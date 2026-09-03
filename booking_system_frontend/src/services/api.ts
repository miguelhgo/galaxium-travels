import axios from 'axios';
import type {
  Flight,
  Booking,
  User,
  BookingRequest,
  UserRegistration,
  ErrorResponse,
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Helper function for exponential backoff delay
const getRetryDelay = (retryCount: number): number => {
  return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
};

// Helper function to check if error is retryable
const isRetryableError = (error: any): boolean => {
  // Retry on network errors or 5xx server errors
  return !error.response || (error.response.status >= 500 && error.response.status < 600);
};

// Request interceptor to add retry logic
api.interceptors.request.use(
  (config) => {
    // Initialize retry count if not present
    if (!config.headers['x-retry-count']) {
      config.headers['x-retry-count'] = '0';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const retryCount = parseInt(config.headers['x-retry-count'] || '0', 10);

    // Check if we should retry
    if (retryCount < MAX_RETRIES && isRetryableError(error)) {
      // Increment retry count
      config.headers['x-retry-count'] = String(retryCount + 1);
      
      // Calculate delay with exponential backoff
      const delay = getRetryDelay(retryCount);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return api(config);
    }

    // Max retries reached or non-retryable error
    if (error.response?.data) {
      // Backend returned an error response
      return Promise.reject(error.response.data);
    }
    // Network or other error
    return Promise.reject({
      success: false,
      error: 'Network error',
      error_code: 'NETWORK_ERROR',
      details: error.message,
    } as ErrorResponse);
  }
);

// ==================== Flight Endpoints ====================

/**
 * Get all available flights
 */
export const getFlights = async (): Promise<Flight[]> => {
  const response = await api.get<Flight[]>('/flights');
  return response.data;
};

// ==================== User Endpoints ====================

/**
 * Register a new user
 */
export const registerUser = async (
  data: UserRegistration
): Promise<User | ErrorResponse> => {
  const response = await api.post<User | ErrorResponse>('/register', data);
  return response.data;
};

/**
 * Get user by name and email
 */
export const getUserByCredentials = async (
  name: string,
  email: string
): Promise<User | ErrorResponse> => {
  const response = await api.get<User | ErrorResponse>('/user', {
    params: { name, email },
  });
  return response.data;
};

// ==================== Booking Endpoints ====================

/**
 * Book a flight
 */
export const bookFlight = async (
  data: BookingRequest
): Promise<Booking | ErrorResponse> => {
  const response = await api.post<Booking | ErrorResponse>('/book', data);
  return response.data;
};

/**
 * Get all bookings for a user
 */
export const getUserBookings = async (userId: number): Promise<Booking[]> => {
  const response = await api.get<Booking[]>(`/bookings/${userId}`);
  return response.data;
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (
  bookingId: number
): Promise<Booking | ErrorResponse> => {
  const response = await api.post<Booking | ErrorResponse>(
    `/cancel/${bookingId}`
  );
  return response.data;
};

// ==================== Helper Functions ====================

/**
 * Check if response is an error
 */
export const isErrorResponse = (
  response: any
): response is ErrorResponse => {
  return response && response.success === false;
};

/**
 * Health check
 */
export const healthCheck = async (): Promise<{ status: string }> => {
  const response = await api.get<{ status: string }>('/');
  return response.data;
};

export default api;

// Made with Bob

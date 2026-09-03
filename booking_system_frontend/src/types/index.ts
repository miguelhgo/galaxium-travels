// API Data Models matching backend schemas

// Seat class types
export type SeatClass = 'economy' | 'business' | 'galaxium';

export interface SeatClassInfo {
  name: string;
  multiplier: number;
  description: string;
  color: string;
  icon: string;
}

// Seat class configuration
export const SEAT_CLASSES: Record<SeatClass, SeatClassInfo> = {
  economy: {
    name: 'Economy',
    multiplier: 1.0,
    description: 'Standard seating with basic amenities',
    color: '#60A5FA',
    icon: 'Plane'
  },
  business: {
    name: 'Business',
    multiplier: 2.5,
    description: 'Premium seating with enhanced services',
    color: '#A78BFA',
    icon: 'PlaneTakeoff'
  },
  galaxium: {
    name: 'Galaxium',
    multiplier: 4.0,
    description: 'First-class luxury experience',
    color: '#FBBF24',
    icon: 'Sparkles'
  }
};

export interface Flight {
  flight_id: number;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  base_price: number;
  economy_seats: number;
  business_seats: number;
  galaxium_seats: number;
  economy_price: number;
  business_price: number;
  galaxium_price: number;
}

export interface Booking {
  booking_id: number;
  user_id: number;
  flight_id: number;
  seat_class: SeatClass;
  price_paid: number;
  status: 'booked' | 'cancelled' | 'completed';
  booking_time: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
}

// Request/Response types
export interface BookingRequest {
  user_id: number;
  name: string;
  flight_id: number;
  seat_class: SeatClass;
}

export interface UserRegistration {
  name: string;
  email: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  error_code: string;
  details?: string;
}

// Extended types for UI
export interface BookingWithFlight extends Booking {
  flight?: Flight;
}

export interface FlightFilters {
  origin?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
}

// User context type
export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Made with Bob

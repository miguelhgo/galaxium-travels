from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Literal

# Seat class type definition
SeatClass = Literal['economy', 'business', 'galaxium']

# Seat class configuration with multipliers
SEAT_CLASSES = {
    "economy": {
        "name": "Economy",
        "multiplier": 1.0,
        "description": "Standard seating with basic amenities"
    },
    "business": {
        "name": "Business",
        "multiplier": 2.5,
        "description": "Premium seating with enhanced services"
    },
    "galaxium": {
        "name": "Galaxium",
        "multiplier": 4.0,
        "description": "First-class luxury experience"
    }
}


def calculate_price(base_price: int, seat_class: str) -> int:
    """Calculate the price for a given seat class based on base price."""
    multiplier = SEAT_CLASSES[seat_class]["multiplier"]
    return int(base_price * multiplier)


class FlightOut(BaseModel):
    flight_id: int
    origin: str
    destination: str
    departure_time: str
    arrival_time: str
    base_price: int
    economy_seats: int
    business_seats: int
    galaxium_seats: int
    # Calculated fields for convenience
    economy_price: int
    business_price: int
    galaxium_price: int

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_prices(cls, flight):
        """Create FlightOut with calculated prices."""
        return cls(
            flight_id=flight.flight_id,
            origin=flight.origin,
            destination=flight.destination,
            departure_time=flight.departure_time,
            arrival_time=flight.arrival_time,
            base_price=flight.base_price,
            economy_seats=flight.economy_seats,
            business_seats=flight.business_seats,
            galaxium_seats=flight.galaxium_seats,
            economy_price=calculate_price(flight.base_price, 'economy'),
            business_price=calculate_price(flight.base_price, 'business'),
            galaxium_price=calculate_price(flight.base_price, 'galaxium')
        )


class BookingRequest(BaseModel):
    user_id: int
    name: str
    flight_id: int
    seat_class: SeatClass  # New: seat class selection

    @field_validator('seat_class')
    @classmethod
    def validate_seat_class(cls, v):
        if v not in SEAT_CLASSES:
            raise ValueError(f"seat_class must be one of: {', '.join(SEAT_CLASSES.keys())}")
        return v


class BookingOut(BaseModel):
    booking_id: int
    user_id: int
    flight_id: int
    seat_class: str  # New: seat class of booking
    price_paid: int  # New: actual price paid
    status: str
    booking_time: str

    class Config:
        from_attributes = True


class UserRegistration(BaseModel):
    name: str
    email: EmailStr


class UserOut(BaseModel):
    user_id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    error_code: str
    details: Optional[str] = None

from models import Base, User, Flight, Booking
from db import engine, SessionLocal
from datetime import datetime, timedelta
import random


def calculate_seat_distribution(total_seats: int) -> tuple[int, int, int]:
    """
    Distribute seats across classes: 60% Economy, 30% Business, 10% Galaxium.
    Returns (economy_seats, business_seats, galaxium_seats).
    """
    economy = int(total_seats * 0.6)
    business = int(total_seats * 0.3)
    galaxium = total_seats - economy - business  # Remainder goes to Galaxium
    return economy, business, galaxium


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Clear existing data
    db.query(Booking).delete()
    db.query(User).delete()
    db.query(Flight).delete()
    db.commit()
    
    # Add demo users
    users = [
        User(name="Alice", email="alice@example.com"),
        User(name="Bob", email="bob@example.com"),
        User(name="Charlie", email="charlie@galaxium.com"),
        User(name="Diana", email="diana@moonmail.com"),
        User(name="Eve", email="eve@marsmail.com"),
        User(name="Frank", email="frank@venusmail.com"),
        User(name="Grace", email="grace@jupiter.com"),
        User(name="Heidi", email="heidi@europa.com"),
        User(name="Ivan", email="ivan@asteroidbelt.com"),
        User(name="Judy", email="judy@pluto.com"),
    ]
    db.add_all(users)
    db.commit()
    
    # Add demo flights with seat class distribution
    flight_data = [
        ("Earth", "Mars", "2099-01-01T09:00:00Z", "2099-01-01T17:00:00Z", 1000000, 20),
        ("Earth", "Moon", "2099-01-02T10:00:00Z", "2099-01-02T14:00:00Z", 500000, 15),
        ("Mars", "Earth", "2099-01-03T12:00:00Z", "2099-01-03T20:00:00Z", 950000, 25),
        ("Venus", "Earth", "2099-01-04T08:00:00Z", "2099-01-04T18:00:00Z", 1200000, 10),
        ("Jupiter", "Europa", "2099-01-05T15:00:00Z", "2099-01-05T19:00:00Z", 2000000, 8),
        ("Earth", "Venus", "2099-01-06T07:00:00Z", "2099-01-06T15:00:00Z", 1100000, 18),
        ("Moon", "Mars", "2099-01-07T11:00:00Z", "2099-01-07T19:00:00Z", 800000, 22),
        ("Mars", "Jupiter", "2099-01-08T13:00:00Z", "2099-01-08T23:00:00Z", 2500000, 12),
        ("Europa", "Earth", "2099-01-09T09:00:00Z", "2099-01-09T21:00:00Z", 3000000, 16),
        ("Earth", "Pluto", "2099-01-10T06:00:00Z", "2099-01-11T06:00:00Z", 5000000, 6),
    ]
    
    flights = []
    for origin, dest, dep_time, arr_time, base_price, total_seats in flight_data:
        economy, business, galaxium = calculate_seat_distribution(total_seats)
        flights.append(Flight(
            origin=origin,
            destination=dest,
            departure_time=dep_time,
            arrival_time=arr_time,
            base_price=base_price,
            economy_seats=economy,
            business_seats=business,
            galaxium_seats=galaxium
        ))
    
    db.add_all(flights)
    db.commit()
    
    # Add demo bookings with seat classes
    user_ids = [user.user_id for user in db.query(User).all()]
    flight_ids = [flight.flight_id for flight in db.query(Flight).all()]
    flights_list = db.query(Flight).all()
    statuses = ["booked", "cancelled", "completed"]
    seat_classes = ["economy", "business", "galaxium"]
    
    bookings = []
    now = datetime.utcnow()
    
    for i in range(20):
        user_id = random.choice(user_ids)
        flight = random.choice(flights_list)
        status = random.choice(statuses)
        seat_class = random.choice(seat_classes)
        booking_time = (now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))).isoformat() + "Z"
        
        # Calculate price based on seat class
        from schemas import calculate_price
        price_paid = calculate_price(flight.base_price, seat_class)
        
        bookings.append(Booking(
            user_id=user_id,
            flight_id=flight.flight_id,
            seat_class=seat_class,
            price_paid=price_paid,
            status=status,
            booking_time=booking_time
        ))
    
    db.add_all(bookings)
    db.commit()
    db.close()
    print("Database seeded with seat class demo data!")
    print("Seat distribution: 60% Economy, 30% Business, 10% Galaxium")

if __name__ == "__main__":
    seed() 
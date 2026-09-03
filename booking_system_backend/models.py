from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

class Flight(Base):
    __tablename__ = 'flights'
    flight_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    base_price = Column(Integer, nullable=False)  # Renamed from 'price'
    economy_seats = Column(Integer, nullable=False)  # New: Economy class seats
    business_seats = Column(Integer, nullable=False)  # New: Business class seats
    galaxium_seats = Column(Integer, nullable=False)  # New: Galaxium class seats

class Booking(Base):
    __tablename__ = 'bookings'
    booking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    flight_id = Column(Integer, ForeignKey('flights.flight_id'), nullable=False)
    seat_class = Column(String, nullable=False)  # New: 'economy' | 'business' | 'galaxium'
    price_paid = Column(Integer, nullable=False)  # New: Actual price paid
    status = Column(String, nullable=False)
    booking_time = Column(String, nullable=False)
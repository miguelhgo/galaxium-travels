from sqlalchemy.orm import Session
from models import Flight
from schemas import FlightOut


def list_flights(db: Session) -> list[FlightOut]:
    """List all available flights with calculated prices for each seat class."""
    flights = db.query(Flight).all()
    return [FlightOut.from_orm_with_prices(f) for f in flights]

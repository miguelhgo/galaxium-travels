# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Non-Obvious Patterns

### Backend Architecture
- **Dual Protocol Server**: FastAPI app combines REST API + MCP (Model Context Protocol) server in single process. MCP server MUST be created before FastAPI app to properly combine lifespans (see server.py:14-16)
- **MCP Tools Use Direct DB Sessions**: MCP tool functions create their own SessionLocal() instances and close them in finally blocks, NOT using FastAPI's get_db() dependency injection
- **Seat Class System**: Three seat classes (economy/business/galaxium) with price multipliers (1.0x/2.5x/4.0x) defined in schemas.py SEAT_CLASSES dict. Each flight has separate seat counts per class
- **Price Calculation**: Flight.base_price is multiplied by seat class multiplier. Use calculate_price() from schemas.py, don't calculate manually

### Testing Setup
- **Test DB Patching**: Tests patch BOTH db.SessionLocal AND server.SessionLocal (conftest.py:49-50) because MCP tools import SessionLocal directly
- **Seed Function Disabled**: conftest.py:53 patches seed() to prevent data seeding during tests
- **In-Memory SQLite**: Tests use StaticPool with check_same_thread=False for in-memory database

### Frontend API Integration
- **Automatic Retry Logic**: api.ts implements exponential backoff retry (3 attempts) for 5xx errors and network failures. Retry count tracked in x-retry-count header
- **Error Response Detection**: Use isErrorResponse() helper to check if backend returned ErrorResponse vs success response
- **Component Exports**: Common components exported via index.ts barrel file (src/components/common/index.ts)

### Running Commands
- **Backend Server**: Must run from booking_system_backend/ directory with venv activated: `cd booking_system_backend && source .venv/bin/activate && python server.py`
- **Single Test**: `cd booking_system_backend && pytest tests/test_services.py::TestFlightService::test_list_flights_empty -v`
- **Frontend Dev**: Run from booking_system_frontend/: `cd booking_system_frontend && npm run dev`

### Database
- **SQLite File Location**: booking.db created in booking_system_backend/ directory (not project root)
- **No Migrations**: Schema changes require manual DB deletion and recreation via init_db()
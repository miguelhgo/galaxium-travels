# Plan de Implementación: Clases de Asiento para Galaxium Travels

## 📋 Resumen Ejecutivo

Implementación de tres clases de asiento (Economy, Business, Galaxium) con sistema de precios basado en multiplicadores y distribución fija de asientos por clase.

## 🎯 Objetivos

1. Permitir a los usuarios seleccionar entre 3 clases de asiento al reservar
2. Implementar sistema de precios con multiplicadores por clase
3. Gestionar disponibilidad independiente por clase
4. Mantener compatibilidad con el sistema actual

## 🏗️ Arquitectura de Datos

### Modelo de Clases de Asiento

```python
SEAT_CLASSES = {
    "economy": {
        "name": "Economy",
        "multiplier": 1.0,
        "description": "Asiento estándar con servicios básicos"
    },
    "business": {
        "name": "Business", 
        "multiplier": 2.5,
        "description": "Asiento premium con servicios mejorados"
    },
    "galaxium": {
        "name": "Galaxium",
        "multiplier": 4.0,
        "description": "Primera clase con servicios de lujo"
    }
}
```

### Cambios en Base de Datos

#### Tabla `flights`
**Antes:**
```sql
- flight_id (PK)
- origin
- destination
- departure_time
- arrival_time
- price
- seats_available
```

**Después:**
```sql
- flight_id (PK)
- origin
- destination
- departure_time
- arrival_time
- base_price (renombrado de 'price')
- economy_seats
- business_seats
- galaxium_seats
```

#### Tabla `bookings`
**Antes:**
```sql
- booking_id (PK)
- user_id (FK)
- flight_id (FK)
- status
- booking_time
```

**Después:**
```sql
- booking_id (PK)
- user_id (FK)
- flight_id (FK)
- seat_class (nuevo: 'economy' | 'business' | 'galaxium')
- price_paid (nuevo: precio real pagado)
- status
- booking_time
```

## 📊 Distribución de Asientos

Para cada vuelo, la distribución sugerida es:
- **Economy**: 60% de asientos totales
- **Business**: 30% de asientos totales  
- **Galaxium**: 10% de asientos totales

Ejemplo para un vuelo con 20 asientos totales:
- Economy: 12 asientos
- Business: 6 asientos
- Galaxium: 2 asientos

## 💰 Sistema de Precios

### Cálculo de Precio por Clase
```python
def calculate_price(base_price: int, seat_class: str) -> int:
    multiplier = SEAT_CLASSES[seat_class]["multiplier"]
    return int(base_price * multiplier)
```

### Ejemplo
Si `base_price = 1,000,000`:
- Economy: 1,000,000 × 1.0 = **1,000,000**
- Business: 1,000,000 × 2.5 = **2,500,000**
- Galaxium: 1,000,000 × 4.0 = **4,000,000**

## 🔄 Cambios en Backend

### 1. Models (`models.py`)
```python
class Flight(Base):
    __tablename__ = 'flights'
    flight_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    base_price = Column(Integer, nullable=False)  # Renombrado
    economy_seats = Column(Integer, nullable=False)  # Nuevo
    business_seats = Column(Integer, nullable=False)  # Nuevo
    galaxium_seats = Column(Integer, nullable=False)  # Nuevo

class Booking(Base):
    __tablename__ = 'bookings'
    booking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    flight_id = Column(Integer, ForeignKey('flights.flight_id'), nullable=False)
    seat_class = Column(String, nullable=False)  # Nuevo
    price_paid = Column(Integer, nullable=False)  # Nuevo
    status = Column(String, nullable=False)
    booking_time = Column(String, nullable=False)
```

### 2. Schemas (`schemas.py`)
```python
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
    # Campos calculados
    economy_price: int
    business_price: int
    galaxium_price: int

class BookingRequest(BaseModel):
    user_id: int
    name: str
    flight_id: int
    seat_class: str  # Nuevo: 'economy' | 'business' | 'galaxium'

class BookingOut(BaseModel):
    booking_id: int
    user_id: int
    flight_id: int
    seat_class: str  # Nuevo
    price_paid: int  # Nuevo
    status: str
    booking_time: str
```

### 3. Services (`services/booking.py`)
```python
def book_flight(db: Session, user_id: int, name: str, flight_id: int, seat_class: str):
    # Validar seat_class
    if seat_class not in ['economy', 'business', 'galaxium']:
        return ErrorResponse(...)
    
    # Verificar disponibilidad por clase
    seat_field = f"{seat_class}_seats"
    available = getattr(flight, seat_field)
    
    if available < 1:
        return ErrorResponse(error=f"No {seat_class} seats available")
    
    # Calcular precio
    price_paid = calculate_price(flight.base_price, seat_class)
    
    # Decrementar asientos de la clase específica
    setattr(flight, seat_field, available - 1)
    
    # Crear reserva
    new_booking = Booking(
        user_id=user_id,
        flight_id=flight_id,
        seat_class=seat_class,
        price_paid=price_paid,
        status="booked",
        booking_time=datetime.utcnow().isoformat()
    )
    ...
```

### 4. Seed Data (`seed.py`)
```python
def calculate_seat_distribution(total_seats: int):
    """Distribuye asientos: 60% Economy, 30% Business, 10% Galaxium"""
    economy = int(total_seats * 0.6)
    business = int(total_seats * 0.3)
    galaxium = total_seats - economy - business  # Resto para Galaxium
    return economy, business, galaxium

flights = [
    Flight(
        origin="Earth",
        destination="Mars",
        departure_time="2099-01-01T09:00:00Z",
        arrival_time="2099-01-01T17:00:00Z",
        base_price=1000000,
        economy_seats=12,
        business_seats=6,
        galaxium_seats=2
    ),
    ...
]
```

## 🎨 Cambios en Frontend

### 1. Types (`types/index.ts`)
```typescript
export type SeatClass = 'economy' | 'business' | 'galaxium';

export interface SeatClassInfo {
  name: string;
  multiplier: number;
  description: string;
  icon: string;
  color: string;
}

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

export interface BookingRequest {
  user_id: number;
  name: string;
  flight_id: number;
  seat_class: SeatClass;
}
```

### 2. Componente SeatClassSelector
```typescript
interface SeatClassSelectorProps {
  flight: Flight;
  selectedClass: SeatClass;
  onSelectClass: (seatClass: SeatClass) => void;
}

// Muestra las 3 opciones con:
// - Nombre de la clase
// - Precio calculado
// - Asientos disponibles
// - Descripción/beneficios
// - Estado (disponible/agotado)
```

### 3. FlightCard Actualizado
```typescript
// Mostrar información resumida de clases:
// - Precio desde (Economy)
// - Indicador de disponibilidad por clase
// - Badge con clase más económica disponible
```

### 4. BookingModal Actualizado
```typescript
// Incluir:
// - SeatClassSelector integrado
// - Precio dinámico según clase seleccionada
// - Resumen de beneficios de la clase
// - Validación de disponibilidad en tiempo real
```

## 🔍 Validaciones y Reglas de Negocio

### Backend
1. ✅ Validar que `seat_class` sea uno de: 'economy', 'business', 'galaxium'
2. ✅ Verificar disponibilidad de la clase específica antes de reservar
3. ✅ Calcular precio correcto según multiplicador
4. ✅ Decrementar solo los asientos de la clase reservada
5. ✅ Al cancelar, restaurar asientos a la clase correcta
6. ✅ Guardar `price_paid` para mantener histórico de precios

### Frontend
1. ✅ Deshabilitar clases sin asientos disponibles
2. ✅ Mostrar precio actualizado al cambiar de clase
3. ✅ Validar selección de clase antes de confirmar
4. ✅ Mostrar claramente qué incluye cada clase
5. ✅ Indicador visual de disponibilidad por clase

## 🧪 Casos de Prueba

### Backend Tests
```python
def test_book_economy_seat():
    # Reservar Economy y verificar precio = base_price * 1.0
    
def test_book_business_seat():
    # Reservar Business y verificar precio = base_price * 2.5
    
def test_book_galaxium_seat():
    # Reservar Galaxium y verificar precio = base_price * 4.0
    
def test_no_seats_available_for_class():
    # Intentar reservar cuando no hay asientos de esa clase
    
def test_cancel_booking_restores_correct_class():
    # Cancelar y verificar que se restauran asientos de la clase correcta
    
def test_invalid_seat_class():
    # Intentar reservar con clase inválida
```

### Frontend Tests
```typescript
test('SeatClassSelector shows all three classes', () => {
  // Verificar que se muestran las 3 opciones
});

test('SeatClassSelector disables sold out classes', () => {
  // Verificar que clases sin asientos están deshabilitadas
});

test('BookingModal updates price when class changes', () => {
  // Verificar actualización dinámica de precio
});
```

## 📈 Migración de Datos Existentes

Para datos existentes en la base de datos:

```python
def migrate_existing_data():
    """
    Migrar vuelos existentes:
    - Renombrar 'price' a 'base_price'
    - Distribuir 'seats_available' en las 3 clases
    
    Migrar reservas existentes:
    - Asignar 'seat_class' = 'economy' (por defecto)
    - Asignar 'price_paid' = precio original
    """
    pass
```

## 🎨 Diseño Visual

### Colores por Clase
- **Economy**: Azul claro (`#60A5FA`) - Accesible y estándar
- **Business**: Púrpura (`#A78BFA`) - Premium y elegante
- **Galaxium**: Dorado (`#FBBF24`) - Lujo y exclusividad

### Iconos
- **Economy**: `Plane` - Avión estándar
- **Business**: `PlaneTakeoff` - Despegue premium
- **Galaxium**: `Sparkles` - Lujo y exclusividad

## 📝 Notas de Implementación

### Orden de Implementación Recomendado
1. ✅ Backend: Models y Schemas
2. ✅ Backend: Services (lógica de negocio)
3. ✅ Backend: Endpoints REST y MCP
4. ✅ Backend: Seed data actualizado
5. ✅ Frontend: Types
6. ✅ Frontend: Componentes (SeatClassSelector)
7. ✅ Frontend: Actualizar FlightCard y BookingModal
8. ✅ Frontend: API services
9. ✅ Testing completo
10. ✅ Documentación de usuario

### Consideraciones Técnicas
- Mantener retrocompatibilidad durante migración
- Usar transacciones para operaciones de reserva
- Implementar logging detallado para debugging
- Considerar índices en `seat_class` para queries eficientes
- Cachear cálculos de precios si es necesario

## 🚀 Próximos Pasos

Una vez aprobado este diseño, proceder con la implementación siguiendo el orden establecido en la lista de tareas.

---

**Documento creado**: 2026-06-24  
**Versión**: 1.0  
**Estado**: Pendiente de aprobación
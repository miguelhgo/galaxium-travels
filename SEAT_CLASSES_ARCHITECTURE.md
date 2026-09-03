# Arquitectura del Sistema de Clases de Asiento

## 🏛️ Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph Frontend["Frontend (React + TypeScript)"]
        UI[Componentes UI]
        FlightCard[FlightCard]
        BookingModal[BookingModal]
        SeatSelector[SeatClassSelector]
        API[API Services]
        Types[TypeScript Types]
    end

    subgraph Backend["Backend (FastAPI + SQLAlchemy)"]
        REST[REST Endpoints]
        MCP[MCP Tools]
        Services[Business Logic]
        Schemas[Pydantic Schemas]
        Models[SQLAlchemy Models]
    end

    subgraph Database["Database (SQLite)"]
        FlightTable[(flights)]
        BookingTable[(bookings)]
        UserTable[(users)]
    end

    UI --> FlightCard
    UI --> BookingModal
    BookingModal --> SeatSelector
    FlightCard --> API
    BookingModal --> API
    API --> Types

    API -->|HTTP| REST
    REST --> Services
    MCP --> Services
    Services --> Schemas
    Services --> Models
    Models --> FlightTable
    Models --> BookingTable
    Models --> UserTable

    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style Database fill:#f0f0f0
```

## 📊 Modelo de Datos Detallado

```mermaid
erDiagram
    FLIGHT ||--o{ BOOKING : "has many"
    USER ||--o{ BOOKING : "makes"
    
    FLIGHT {
        int flight_id PK
        string origin
        string destination
        string departure_time
        string arrival_time
        int base_price "Precio base"
        int economy_seats "Asientos Economy"
        int business_seats "Asientos Business"
        int galaxium_seats "Asientos Galaxium"
    }
    
    BOOKING {
        int booking_id PK
        int user_id FK
        int flight_id FK
        string seat_class "economy|business|galaxium"
        int price_paid "Precio pagado"
        string status "booked|cancelled|completed"
        string booking_time
    }
    
    USER {
        int user_id PK
        string name
        string email
    }
```

## 🔄 Flujo de Reserva con Clases

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend UI
    participant API as API Service
    participant Backend as FastAPI
    participant Service as Booking Service
    participant DB as Database

    User->>UI: Selecciona vuelo
    UI->>UI: Muestra BookingModal
    User->>UI: Selecciona clase (Economy/Business/Galaxium)
    UI->>UI: Actualiza precio dinámicamente
    User->>UI: Confirma reserva
    
    UI->>API: bookFlight(user_id, flight_id, seat_class)
    API->>Backend: POST /book
    Backend->>Service: book_flight()
    
    Service->>DB: Verificar disponibilidad de clase
    DB-->>Service: Asientos disponibles
    
    alt Asientos disponibles
        Service->>Service: Calcular precio (base_price × multiplier)
        Service->>DB: Decrementar asientos de clase
        Service->>DB: Crear booking con seat_class y price_paid
        DB-->>Service: Booking creado
        Service-->>Backend: BookingOut
        Backend-->>API: 200 OK + Booking
        API-->>UI: Success
        UI->>User: Mostrar confirmación
    else Sin asientos
        Service-->>Backend: ErrorResponse
        Backend-->>API: 400 Error
        API-->>UI: Error
        UI->>User: Mostrar error
    end
```

## 💰 Cálculo de Precios

```mermaid
graph LR
    A[Base Price] --> B{Seat Class}
    B -->|Economy × 1.0| C[Economy Price]
    B -->|Business × 2.5| D[Business Price]
    B -->|Galaxium × 4.0| E[Galaxium Price]
    
    C --> F[Mostrar al usuario]
    D --> F
    E --> F
    
    style A fill:#90EE90
    style C fill:#60A5FA
    style D fill:#A78BFA
    style E fill:#FBBF24
```

## 🎨 Componentes Frontend

```mermaid
graph TD
    A[Flights Page] --> B[FlightCard]
    B --> C[Book Button]
    C --> D[BookingModal]
    D --> E[SeatClassSelector]
    E --> F[Economy Option]
    E --> G[Business Option]
    E --> H[Galaxium Option]
    D --> I[Price Display]
    D --> J[Confirm Button]
    
    F -.->|Updates| I
    G -.->|Updates| I
    H -.->|Updates| I
    
    style E fill:#e1f5ff
    style F fill:#60A5FA
    style G fill:#A78BFA
    style H fill:#FBBF24
```

## 🔐 Validaciones y Reglas

```mermaid
flowchart TD
    Start([Usuario intenta reservar]) --> ValidClass{¿Clase válida?}
    ValidClass -->|No| Error1[Error: Clase inválida]
    ValidClass -->|Sí| CheckSeats{¿Asientos disponibles?}
    
    CheckSeats -->|No| Error2[Error: Sin asientos]
    CheckSeats -->|Sí| CheckUser{¿Usuario existe?}
    
    CheckUser -->|No| Error3[Error: Usuario no encontrado]
    CheckUser -->|Sí| CalcPrice[Calcular precio]
    
    CalcPrice --> DecrementSeats[Decrementar asientos de clase]
    DecrementSeats --> CreateBooking[Crear reserva]
    CreateBooking --> Success([Reserva exitosa])
    
    Error1 --> End([Fin])
    Error2 --> End
    Error3 --> End
    Success --> End
    
    style Success fill:#90EE90
    style Error1 fill:#FFB6C1
    style Error2 fill:#FFB6C1
    style Error3 fill:#FFB6C1
```

## 📱 Estados del Componente SeatClassSelector

```mermaid
stateDiagram-v2
    [*] --> Loading: Cargando datos
    Loading --> Available: Datos cargados
    
    Available --> EconomySelected: Usuario selecciona Economy
    Available --> BusinessSelected: Usuario selecciona Business
    Available --> GalaxiumSelected: Usuario selecciona Galaxium
    
    EconomySelected --> Available: Cambiar selección
    BusinessSelected --> Available: Cambiar selección
    GalaxiumSelected --> Available: Cambiar selección
    
    Available --> Disabled: Sin asientos
    Disabled --> Available: Asientos disponibles
    
    EconomySelected --> Confirming: Confirmar reserva
    BusinessSelected --> Confirming: Confirmar reserva
    GalaxiumSelected --> Confirming: Confirmar reserva
    
    Confirming --> Success: Reserva exitosa
    Confirming --> Error: Error en reserva
    
    Success --> [*]
    Error --> Available: Reintentar
```

## 🗄️ Migración de Datos

```mermaid
flowchart LR
    A[(Base de datos actual)] --> B{Migración}
    
    B --> C[Flights]
    C --> C1[Renombrar price → base_price]
    C --> C2[Distribuir seats_available]
    C2 --> C3[60% → economy_seats]
    C2 --> C4[30% → business_seats]
    C2 --> C5[10% → galaxium_seats]
    
    B --> D[Bookings]
    D --> D1[Agregar seat_class = 'economy']
    D --> D2[Agregar price_paid = precio original]
    
    C3 --> E[(Nueva estructura)]
    C4 --> E
    C5 --> E
    D1 --> E
    D2 --> E
    
    style A fill:#FFB6C1
    style E fill:#90EE90
```

## 🧪 Estrategia de Testing

```mermaid
graph TB
    subgraph Unit["Unit Tests"]
        U1[Cálculo de precios]
        U2[Validación de clases]
        U3[Distribución de asientos]
    end
    
    subgraph Integration["Integration Tests"]
        I1[API Endpoints]
        I2[Database Operations]
        I3[Service Layer]
    end
    
    subgraph E2E["End-to-End Tests"]
        E1[Flujo completo de reserva]
        E2[Selección de clases]
        E3[Cancelación por clase]
    end
    
    Unit --> Integration
    Integration --> E2E
    
    style Unit fill:#e1f5ff
    style Integration fill:#fff4e1
    style E2E fill:#f0e1ff
```

## 📈 Métricas y Monitoreo

```mermaid
graph LR
    A[Sistema] --> B[Métricas]
    
    B --> C[Reservas por clase]
    B --> D[Ingresos por clase]
    B --> E[Disponibilidad promedio]
    B --> F[Tasa de conversión]
    
    C --> G[Dashboard]
    D --> G
    E --> G
    F --> G
    
    style G fill:#90EE90
```

---

**Documento creado**: 2026-06-24  
**Versión**: 1.0  
**Relacionado con**: SEAT_CLASSES_DESIGN.md
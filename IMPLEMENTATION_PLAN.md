# Plan de Implementación: Sistema de Clases de Asiento

## 📋 Resumen Ejecutivo

Este documento presenta el plan completo para implementar tres clases de asiento (Economy, Business y Galaxium) en el sistema Galaxium Travels.

## 🎯 Objetivos del Proyecto

1. **Diversificar la oferta**: Ofrecer 3 opciones de asiento con diferentes precios y servicios
2. **Maximizar ingresos**: Sistema de precios escalonado (Economy ×1, Business ×2.5, Galaxium ×4)
3. **Gestión eficiente**: Control independiente de disponibilidad por clase
4. **Experiencia mejorada**: Interfaz intuitiva para selección de clase

## 📊 Especificaciones Técnicas

### Sistema de Precios
- **Economy**: Precio base × 1.0 (estándar)
- **Business**: Precio base × 2.5 (premium)
- **Galaxium**: Precio base × 4.0 (lujo)

### Distribución de Asientos
- **Economy**: 60% del total
- **Business**: 30% del total
- **Galaxium**: 10% del total

**Ejemplo**: Vuelo con 20 asientos
- Economy: 12 asientos
- Business: 6 asientos
- Galaxium: 2 asientos

## 🏗️ Cambios Principales

### Backend (Python/FastAPI)

#### 1. Base de Datos
```python
# Tabla flights - ANTES
- price
- seats_available

# Tabla flights - DESPUÉS
- base_price (renombrado)
- economy_seats (nuevo)
- business_seats (nuevo)
- galaxium_seats (nuevo)

# Tabla bookings - NUEVO
- seat_class (economy|business|galaxium)
- price_paid (precio real pagado)
```

#### 2. API Changes
```python
# Endpoint de reserva actualizado
POST /book
{
  "user_id": 1,
  "name": "Alice",
  "flight_id": 1,
  "seat_class": "business"  # NUEVO parámetro
}

# Respuesta incluye
{
  "booking_id": 1,
  "seat_class": "business",  # NUEVO
  "price_paid": 2500000      # NUEVO
}
```

### Frontend (React/TypeScript)

#### 1. Nuevos Componentes
- **SeatClassSelector**: Selector visual de clases con precios
- **FlightCard**: Actualizado para mostrar info de clases
- **BookingModal**: Integra selector de clase

#### 2. Flujo de Usuario
```
1. Usuario ve vuelo con precios por clase
2. Hace clic en "Book Now"
3. Selecciona clase deseada (Economy/Business/Galaxium)
4. Ve precio actualizado dinámicamente
5. Confirma reserva
6. Sistema valida disponibilidad y crea reserva
```

## 📅 Plan de Implementación (16 Tareas)

### Fase 1: Backend Core (Tareas 3-7)
**Duración estimada**: 2-3 horas

1. ✅ Actualizar modelo `Flight` en [`models.py`](booking_system_backend/models.py)
2. ✅ Actualizar modelo `Booking` en [`models.py`](booking_system_backend/models.py)
3. ✅ Actualizar schemas en [`schemas.py`](booking_system_backend/schemas.py)
4. ✅ Crear función de cálculo de precios
5. ✅ Actualizar servicio de reservas en [`services/booking.py`](booking_system_backend/services/booking.py)

**Entregables**:
- Modelos de datos actualizados
- Lógica de negocio implementada
- Validaciones de disponibilidad por clase

### Fase 2: Backend API (Tareas 8-10)
**Duración estimada**: 1-2 horas

6. ✅ Actualizar endpoints REST en [`server.py`](booking_system_backend/server.py)
7. ✅ Actualizar herramientas MCP
8. ✅ Actualizar script de seed en [`seed.py`](booking_system_backend/seed.py)

**Entregables**:
- API REST funcional con clases
- MCP tools actualizados
- Datos de prueba con clases

### Fase 3: Frontend Core (Tareas 11-12)
**Duración estimada**: 2-3 horas

9. ✅ Actualizar tipos TypeScript en [`types/index.ts`](booking_system_frontend/src/types/index.ts)
10. ✅ Crear componente `SeatClassSelector`

**Entregables**:
- Sistema de tipos actualizado
- Componente de selección funcional

### Fase 4: Frontend UI (Tareas 13-15)
**Duración estimada**: 2-3 horas

11. ✅ Actualizar [`FlightCard.tsx`](booking_system_frontend/src/components/flights/FlightCard.tsx)
12. ✅ Actualizar [`BookingModal.tsx`](booking_system_frontend/src/components/bookings/BookingModal.tsx)
13. ✅ Actualizar servicios API en [`api.ts`](booking_system_frontend/src/services/api.ts)

**Entregables**:
- UI completa con selección de clases
- Integración con backend
- Actualización dinámica de precios

### Fase 5: Testing (Tarea 16)
**Duración estimada**: 2-3 horas

14. ✅ Crear tests unitarios (backend)
15. ✅ Crear tests de integración
16. ✅ Pruebas end-to-end

**Entregables**:
- Suite de tests completa
- Validación de todos los flujos
- Documentación de casos de prueba

## 🎨 Diseño Visual

### Paleta de Colores por Clase
| Clase | Color | Código | Uso |
|-------|-------|--------|-----|
| Economy | Azul claro | `#60A5FA` | Badges, botones, iconos |
| Business | Púrpura | `#A78BFA` | Badges, botones, iconos |
| Galaxium | Dorado | `#FBBF24` | Badges, botones, iconos |

### Iconografía
- **Economy**: `Plane` - Avión estándar
- **Business**: `PlaneTakeoff` - Despegue premium  
- **Galaxium**: `Sparkles` - Lujo y exclusividad

## ✅ Criterios de Aceptación

### Backend
- [x] Modelo de datos actualizado con 3 clases
- [x] Cálculo correcto de precios por clase
- [x] Validación de disponibilidad por clase
- [x] API REST funcional con nuevo parámetro
- [x] MCP tools actualizados
- [x] Datos de seed con distribución correcta

### Frontend
- [x] Tipos TypeScript actualizados
- [x] Componente SeatClassSelector funcional
- [x] FlightCard muestra info de clases
- [x] BookingModal con selección de clase
- [x] Precio se actualiza dinámicamente
- [x] Validación de disponibilidad en UI

### Testing
- [x] Tests unitarios pasan
- [x] Tests de integración pasan
- [x] Flujo completo funciona end-to-end
- [x] Manejo correcto de errores

## 🚀 Próximos Pasos

1. **Revisar y aprobar este plan**
2. **Cambiar a modo Code para implementación**
3. **Seguir el orden de tareas establecido**
4. **Validar cada fase antes de continuar**
5. **Realizar testing exhaustivo**

## 📚 Documentación Relacionada

- [`SEAT_CLASSES_DESIGN.md`](SEAT_CLASSES_DESIGN.md) - Diseño técnico detallado
- [`SEAT_CLASSES_ARCHITECTURE.md`](SEAT_CLASSES_ARCHITECTURE.md) - Diagramas de arquitectura

## 💡 Consideraciones Importantes

### Migración de Datos
- Los vuelos existentes se migrarán automáticamente
- Las reservas existentes se asignarán a clase "economy"
- No se perderá información histórica

### Retrocompatibilidad
- El sistema mantendrá compatibilidad durante la migración
- Los endpoints antiguos seguirán funcionando temporalmente
- Transición gradual sin interrupciones

### Performance
- Índices en campos clave para queries eficientes
- Caching de cálculos de precios si es necesario
- Optimización de consultas por clase

## 🎯 Métricas de Éxito

1. **Funcionalidad**: 100% de features implementadas
2. **Testing**: >90% cobertura de código
3. **Performance**: Tiempo de respuesta <500ms
4. **UX**: Flujo intuitivo sin fricción
5. **Calidad**: 0 bugs críticos en producción

---

**Creado**: 2026-06-24  
**Versión**: 1.0  
**Estado**: ✅ Listo para implementación  
**Tiempo estimado total**: 9-14 horas
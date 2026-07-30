# ARCHITECTURE.md — System Structure and Boundaries

## System Context

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│  Browser     │─────▶│  FastAPI     │─────▶│ PostgreSQL │
│  (React SPA) │      │  Backend     │      │  (Render)  │
└─────────────┘      └──────────────┘      └────────────┘
       │                      │
       │  HTTP/JSON           │  SQLAlchemy ORM
```

## Monorepo Boundaries

### `frontend/` — Vite + React SPA

- **Entrypoint:** `src/main.tsx`
- **Router:** React Router, lazy-load admin routes
- **Patient pages:** `src/patient/` — Landing, Register, Login, Book, MyAppointments
- **Admin pages:** `src/admin/` — Login, Dashboard (with sub-sections)
- **Shared:** `src/shared/` — Auth provider, API client, types, common UI
- **Build output:** Static files served by Render Static Sites
- **No server rendering** — pure client-side SPA

### `backend/` — FastAPI REST API

- **Entrypoint:** `app/main.py`
- **API routes:** `app/api/` — versioned (v1)
- **Models:** `app/models/` — SQLAlchemy declarative models
- **Schemas:** `app/schemas/` — Pydantic request/response validation
- **Services:** `app/services/` — Business logic (booking, conflict detection)
- **Core:** `app/core/` — Config, security, database session
- **No HTML rendering** — JSON API only

### `shared/` — Type Bridge

- Mirrored TypeScript types from backend Pydantic schemas
- Manual sync (automation if project grows)
- Used by frontend for type-safe API calls

## Data Flow

### Appointment Booking Flow

```
Patient → POST /api/appointments → Create pending appointment
  → Backend checks patient exists, date valid, service valid
  → Returns appointment with status="pending"

Patient → GET /api/availability/calendar → Crowd meter data
  → Backend counts pending+accepted appointments per date
  → Also returns doctor unavailable dates
  → Frontend renders green/orange/red calendar
```

### Appointment Acceptance Flow (Intelligence Engine)

```
Admin → PATCH /api/admin/appointments/:id/accept {time_slot_start, time_slot_end}
  → Service validates:
     1. No accepted appointment overlaps the time range on same date
     2. No doctor_unavailability entry overlaps the time range
     3. Appointment is currently in "pending" status
  → Success: status → "accepted", time slot saved
  → Conflict: return 409 with details of the conflict
```

### Patient Status Check Flow

```
Patient → GET /api/appointments
  → Returns all patient's appointments with current status
  → Frontend shows status badges + relevant action buttons
```

## Security Boundaries

- **Patient auth** — JWT in Authorization header, 24h expiry
- **Admin auth** — JWT in HTTP-only cookie, sliding session up to 30 days
- **Sensitive actions** (accept/reject/complete) — admin-role middleware
- **CORS** — restricted to frontend origin in production
- **Rate limiting** — per-IP on auth endpoints
- **Input validation** — Pydantic on all endpoints

## Key Design Patterns

- **Lazy-loaded admin code** — React.lazy() + Suspense, admin bundle only loads on `/admin/*`
- **Conflict detection as a service** — `app/services/scheduler.py` contains all overlap logic
- **Locking** — Use PostgreSQL row-level locking on appointment acceptance to prevent race conditions
- **No cascading deletes** — appointments and records are soft-deleted or preserved for audit

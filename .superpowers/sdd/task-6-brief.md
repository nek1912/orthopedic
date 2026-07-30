# Phase 6: Booking API + Intelligence Engine (Backend)

**Goal:** All appointment, availability, service, prescription, unavailability, and admin management endpoints.

## Files to Create/Modify

```
backend/app/
├── api/v1/
│   ├── appointments.py       # Patient appointment CRUD
│   ├── services_api.py       # Public services list
│   ├── availability.py       # Calendar + crowd meter
│   ├── admin_appointments.py # Admin accept/reject/complete
│   ├── admin_patients.py     # Admin patient list + history
│   ├── admin_prescriptions.py# Admin prescription CRUD
│   ├── admin_unavailability.py# Admin unavailability CRUD
│   └── admin_settings.py     # Admin clinic settings
├── schemas/
│   ├── appointment.py
│   ├── service.py
│   ├── availability.py
│   ├── prescription.py
│   └── unavailability.py
└── services/
    ├── appointment_service.py
    ├── scheduler.py           # ← THE Intelligence Engine
    └── availability_service.py
```

## Full Endpoint List

### Patient Endpoints (JWT required, except services + calendar)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/services` | None | List active services |
| GET | `/api/v1/availability/calendar?month=YYYY-MM` | None | Crowd meter data per date |
| POST | `/api/v1/appointments` | Patient | Create booking (date + service) |
| GET | `/api/v1/appointments` | Patient | List patient's appointments |
| GET | `/api/v1/appointments/:id` | Patient | Get single appointment detail |
| PATCH | `/api/v1/appointments/:id/cancel` | Patient | Cancel pending appointment |

### Admin Endpoints (admin cookie required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/appointments` | List all (filterable by status, date) |
| GET | `/api/v1/admin/appointments/:id` | Get appointment detail |
| PATCH | `/api/v1/admin/appointments/:id/accept` | Accept + assign time slot |
| PATCH | `/api/v1/admin/appointments/:id/reject` | Reject + reason + suggested date |
| PATCH | `/api/v1/admin/appointments/:id/arrive` | Mark patient arrived |
| PATCH | `/api/v1/admin/appointments/:id/complete` | Mark completed |
| GET | `/api/v1/admin/patients` | List patients (searchable by name/email) |
| GET | `/api/v1/admin/patients/:id` | Patient detail + appointment history |
| POST | `/api/v1/admin/prescriptions` | Create prescription for appointment |
| GET | `/api/v1/admin/prescriptions/:appointment_id` | Get prescriptions |
| GET | `/api/v1/admin/unavailability` | List unavailability entries |
| POST | `/api/v1/admin/unavailability` | Create unavailability |
| DELETE | `/api/v1/admin/unavailability/:id` | Remove unavailability |
| GET | `/api/v1/admin/settings` | Get clinic settings |
| PATCH | `/api/v1/admin/settings` | Update clinic settings |
| GET | `/api/v1/admin/stats` | Dashboard stats (today count, pending count) |

## Intelligence Engine (`services/scheduler.py`)

This is the most critical file:

```python
async def validate_and_accept(db, appointment_id, date, start_time, end_time):
    1. SELECT ... FOR UPDATE on appointment row (row lock)
    2. Verify appointment.status == "pending"
    3. Query all ACCEPTED appointments on `date`
    4. For each: check overlap (start < end_time AND end > start_time)
    5. Query doctor_unavailability for `date` (include recurring logic)
    6. For each: check overlap
    7. If any overlap → raise ConflictError with details (appointment id, time range)
    8. If clear → update appointment status + time slots, return success
```

**Recurring unavailability logic:**
- `none` → match exact date
- `weekly` → match if weekday matches the stored date's weekday
- `weekdays` → match if date is Mon-Fri

**Race condition prevention:** Use `SELECT ... FOR UPDATE` on the appointment record within a transaction.

### Availability Service (`services/availability_service.py`)

For the crowd meter calendar:
1. For a given month, count appointments per date (pending + accepted)
2. Mark dates with doctor unavailability as blocked
3. Return: `{ "2026-08-01": { "count": 5, "level": "orange", "blocked": false }, ... }`

Thresholds: Green=0-3, Orange=4-7, Red=8+

## Schemas

### appointment.py
- `AppointmentCreate` — service_id (optional), service_description (optional), requested_date
- `AppointmentResponse` — all fields including patient name, service name, status
- `AppointmentListResponse` — list of AppointmentResponse
- `CancelResponse` — message

### service.py
- `ServiceResponse` — id, name, description, is_active

### availability.py
- `DateAvailability` — count: int, level: str (green/orange/red), blocked: bool
- `CalendarResponse` — dict keyed by date string

### prescription.py
- `PrescriptionCreate` — appointment_id, medicines (list of dicts or JSON), diagnosis, notes
- `PrescriptionResponse` — id, appointment_id, medicines, diagnosis, notes, created_at

### unavailability.py
- `UnavailabilityCreate` — date, start_time, end_time, recurring (none/weekly/weekdays), reason
- `UnavailabilityResponse` — all fields

## Router Updates

Update `backend/app/api/v1/router.py` to import and include all new routers.

## Constraints

- No comments in code unless explicitly asked
- Use existing `get_current_patient` and `get_current_admin` dependencies
- Async SQLAlchemy for all operations
- Pydantic v2 schemas
- UUID path params consistently
- 409 Conflict for overlapping time slots with details
- Row-level locking with `select(...).with_for_update()` for accept endpoint

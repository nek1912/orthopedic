# Task 6: Booking API + Intelligence Engine — Report

## Files Created

### Schemas (5 files)
- `backend/app/schemas/appointment.py` — AppointmentCreate, AppointmentResponse, AppointmentListResponse, CancelResponse, AdminAppointmentDetail, AcceptRequest, RejectRequest, AppointmentStats
- `backend/app/schemas/service.py` — ServiceResponse
- `backend/app/schemas/availability.py` — DateAvailability, CalendarResponse
- `backend/app/schemas/prescription.py` — PrescriptionCreate, PrescriptionResponse
- `backend/app/schemas/unavailability.py` — UnavailabilityCreate, UnavailabilityResponse

### Services (3 files)
- `backend/app/services/scheduler.py` — Intelligence Engine: `validate_and_accept` with FOR UPDATE locking, overlap detection, recurring unavailability
- `backend/app/services/availability_service.py` — `get_calendar` crowd meter (green/orange/red thresholds, blocked dates)
- `backend/app/services/appointment_service.py` — Full CRUD: create, cancel, list, get, accept, reject, arrive, complete, admin list/detail

### API Routes (9 files)
- `backend/app/api/v1/appointments.py` — Patient appointment CRUD
- `backend/app/api/v1/services_api.py` — Public services list
- `backend/app/api/v1/availability.py` — Calendar crowd meter
- `backend/app/api/v1/admin_appointments.py` — Admin accept/reject/arrive/complete
- `backend/app/api/v1/admin_patients.py` — Admin patient list + detail with history
- `backend/app/api/v1/admin_prescriptions.py` — Admin prescription CRUD
- `backend/app/api/v1/admin_unavailability.py` — Admin unavailability CRUD
- `backend/app/api/v1/admin_settings.py` — Admin clinic settings view/update
- `backend/app/api/v1/admin_stats.py` — Dashboard stats (today count, pending count)

## Files Modified
- `backend/app/api/v1/router.py` — Added all 11 new routers
- `backend/app/schemas/__init__.py` — Added all new schema exports

## Endpoints (29 total)

### Patient (JWT required)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/services | List active services |
| GET | /api/v1/availability/calendar | Crowd meter by month |
| POST | /api/v1/appointments | Create booking |
| GET | /api/v1/appointments | List own appointments |
| GET | /api/v1/appointments/{id} | Get appointment detail |
| PATCH | /api/v1/appointments/{id}/cancel | Cancel pending |

### Admin (cookie auth)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/admin/appointments | List (filter by status/date) |
| GET | /api/v1/admin/appointments/{id} | Detail with patient info |
| PATCH | /api/v1/admin/appointments/{id}/accept | Accept + assign time slot |
| PATCH | /api/v1/admin/appointments/{id}/reject | Reject with reason |
| PATCH | /api/v1/admin/appointments/{id}/arrive | Mark arrived |
| PATCH | /api/v1/admin/appointments/{id}/complete | Mark completed |
| GET | /api/v1/admin/patients | List (search by name/email) |
| GET | /api/v1/admin/patients/{id} | Detail + appointment history |
| POST | /api/v1/admin/prescriptions | Create prescription |
| GET | /api/v1/admin/prescriptions/{appointment_id} | Get prescriptions |
| GET | /api/v1/admin/unavailability | List unavailability |
| POST | /api/v1/admin/unavailability | Create unavailability |
| DELETE | /api/v1/admin/unavailability/{id} | Remove unavailability |
| GET | /api/v1/admin/settings | Get clinic settings |
| PATCH | /api/v1/admin/settings | Update clinic settings |
| GET | /api/v1/admin/stats | Dashboard stats |

## Intelligence Engine Implementation

**`services/scheduler.py:validate_and_accept`**
1. `SELECT ... FOR UPDATE` on appointment row (race condition prevention)
2. Verifies appointment status is `pending`
3. Queries all `accepted` appointments on same date; checks time overlap (`start < end_time AND end > start_time`)
4. Queries all `DoctorUnavailability` entries; filters by date logic:
   - `none`: exact date match
   - `weekly`: same weekday
   - `weekdays`: Mon-Fri (weekday < 5)
5. Any overlap → `409 Conflict` with details (appointment ID + time range or unavailability time range)
6. On clear → updates status to `accepted`, sets time_slot_start/end

**`services/availability_service.py:get_calendar`**
- Groups appointments (pending + accepted) per date for a month
- Thresholds: 0-3 green, 4-7 orange, 8+ red
- Checks recurring/non-recurring unavailability → `blocked` flag
- Returns `dict[str, {"count", "level", "blocked"}]`

## Import Verification
All 19 files pass import verification. OpenAPI schema generates successfully with all 29 endpoints.

## Concerns
- `mark_arrived` endpoint exists but does not persist arrival state (no `arrived_at` field in Appointment model). Consider adding an `arrived_at` timestamp column in a future model migration.
- No tests were written. Should be covered in a future task.

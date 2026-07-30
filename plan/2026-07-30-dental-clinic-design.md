# Dental Clinic Management System — Design Spec

**Date:** 2026-07-30
**Status:** Approved

## 1. Project Overview

A full-stack web application for a single-dentist clinic. Two interfaces:
- **Patient website** — landing page, appointment booking, appointment tracking
- **Admin dashboard** — appointment management, patient history, prescriptions, unavailability scheduling

## 2. Tech Stack

- Frontend: React + Vite (single SPA, role-routed)
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL (Render)
- Auth: JWT + bcrypt (separate flows for patient and admin)
- Hosting: Render (Web Service + Static Sites + PostgreSQL)

## 3. Architecture

### Monorepo Layout

```
dental-clinic/
├── frontend/
│   ├── src/
│   │   ├── patient/       # Landing, Login, Register, Book, MyAppointments
│   │   ├── admin/         # Login, Dashboard (lazy-loaded)
│   │   ├── shared/        # Auth context, API client, UI kit
│   │   └── App.tsx
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/           # Routes
│   │   ├── models/        # SQLAlchemy
│   │   ├── schemas/       # Pydantic
│   │   ├── services/      # Business logic
│   │   └── core/          # Config, DB, security
│   ├── scripts/           # seed_admin.py, etc.
│   └── requirements.txt
├── shared/                # Mirrored TS types
├── docker-compose.yml
└── docs/
```

### Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Patient login |
| `/register` | Public | Patient registration |
| `/book` | Patient | Book appointment |
| `/my-appointments` | Patient | View appointment history |
| `/admin/login` | Public | Admin login page |
| `/admin/dashboard` | Admin | Full admin dashboard |

### API Endpoints

See documented endpoints in ARCHITECTURE.md.

## 4. Data Model

### Tables

**patients:** id, email (unique), password_hash, name, phone, dob, created_at

**appointments:** id, patient_id (FK), service_id (FK nullable), service_description, requested_date, status (enum: pending/accepted/rejected/completed/cancelled), rejection_reason, suggested_date, time_slot_start, time_slot_end, notes, created_at, updated_at

**services:** id, name, description, is_active

**prescriptions:** id, appointment_id (FK), medicines (JSON), diagnosis, notes, created_at

**appointment_documents:** id, appointment_id (FK), file_url, file_type, uploaded_at

**doctor_unavailability:** id, date, start_time, end_time, recurring (enum: none/weekly/weekdays), reason

**admin_settings:** id (PK, single row), email, password_hash, clinic_name, address, phone, created_at, updated_at

## 5. Auth Flow

### Patient
- Register with email + password
- Login at `/login` → JWT returned
- JWT sent in Authorization header
- 24h token expiry, refresh token for session extension

### Admin
- DB-seeded account (single in admin_settings table)
- Login at `/admin/login` — password-only page (email pre-known)
- Sliding-window session cookie
- 30-day session with "Remember me"
- Password changeable from dashboard settings
- No registration endpoint exists

## 6. Booking Flow

1. Patient lands on `/` → sees clinic info + services
2. Clicks "Book Appointment" → prompted to login/register
3. Selects service (or "Other" → custom text)
4. Calendar view with crowd meter (green/orange/red per date)
5. Confirms booking → status = "pending"
6. Receives confirmation on `/my-appointments`

## 7. Admin Dashboard

### Sections
1. **Home** — Today's appointments, pending count, quick stats
2. **Requests** — All pending appointments with accept/reject actions
3. **Today** — Today's patients with arrival → complete workflow
4. **Patients** — Searchable patient list with consolidated history
5. **Unavailability** — Set specific dates or recurring unavailable times
6. **Settings** — Clinic info, change password

### Appointment Acceptance Workflow
1. Admin opens pending request
2. Clicks "Accept" → time slot picker shows
3. Picker shows only free slots (existing appointments + unavailability blocked)
4. On submit → Intelligence Engine validates
5. Success → appointment status updates, patient notified
6. Conflict → 409 error shown, picker marks conflict

## 8. Intelligence Engine

### Non-Overlapping Slot Validation

When `PATCH /api/admin/appointments/:id/accept` is called with `time_slot_start` and `time_slot_end`:

1. Lock the appointment row (PostgreSQL row lock)
2. Query all accepted appointments on the same date
3. Check: does any existing slot overlap with the requested slot?
4. Query doctor_unavailability for the same date
5. Check: does any unavailability overlap with the requested slot?
6. If any overlap → return 409 with conflict details
7. If clear → update appointment status + time slot, commit

### Race Condition Prevention
- Use `SELECT ... FOR UPDATE` on the appointment record
- Transaction isolation level: REPEATABLE READ or SERIALIZABLE for the overlap check

## 9. UI/UX Guidelines

- Mobile-first design — all components designed for mobile first
- Clean, minimal, aesthetic — bespoke design, no generic templates
- No flashy colors — palette suitable for medical trustworthiness
- Crowd meter visually inspired by Indian railway booking UX
- Admin dashboard uses familiar card-based layout with clear CTAs

## 10. Security

- All passwords hashed with bcrypt
- JWT for patient auth, HTTP-only cookies for admin session
- Admin API routes protected by middleware checking admin role
- CORS restricted to frontend origin in production
- Rate limiting on auth endpoints
- Input validation via Pydantic on all endpoints
- No sensitive data in URL parameters
- File upload validation for documents/X-rays

## 11. Deployment

- Backend: Render Web Service (uvicorn with gunicorn)
- Frontend: Render Static Site (Vite build → dist/)
- Database: Render PostgreSQL
- Environment variables managed in Render dashboard
- Admin seed run manually after first deploy

## 12. Future Considerations

- SEO improvements (meta tags, sitemap, SSR if needed)
- SMS/email notifications for appointment status changes
- Online payment integration
- Multi-language support
- Patient document upload

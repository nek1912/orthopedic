# Apex Orthopedics & Joint Care Platform

A full-stack web application for Dr. Rahul Mehta's orthopedic clinic. Patients can discover the clinic, book consultation appointments (date-only, railway-style crowd meter), and track their visits & prescriptions. The doctor gets an admin dashboard to manage appointments, assign non-overlapping time slots, write prescriptions, and manage patient care.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite 8 (mobile-first, clinical UI) |
| Backend | FastAPI + SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 (asyncpg) |
| Auth | JWT + bcrypt (patient), separate admin (password-only) |
| Hosting | Render (web service + PostgreSQL) |
| Rate Limiting | SlowAPI (per-IP on auth endpoints) |

## Project Structure

```
client_project/
├── frontend/                  # Vite + React SPA
│   ├── src/
│   │   ├── patient/           # Patient pages
│   │   │   ├── pages/         # Landing, Login, Register, Book, MyAppointments
│   │   │   └── components/    # Patient-specific UI
│   │   ├── admin/             # Admin dashboard (lazy-loaded)
│   │   │   ├── pages/         # AdminLogin, AdminDashboard
│   │   │   ├── components/    # Admin-specific UI
│   │   │   └── context/       # Admin auth context
│   │   ├── shared/            # Cross-cutting concerns
│   │   │   ├── api/           # API client
│   │   │   ├── components/    # Shared UI (PatientRoute, AdminRoute, ErrorBoundary)
│   │   │   ├── context/       # Auth, Toast providers
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   └── types/         # TypeScript types
│   │   └── styles/            # CSS tokens and global styles
│   └── package.json
├── backend/                   # FastAPI REST API
│   ├── app/
│   │   ├── api/v1/            # Versioned route handlers
│   │   ├── models/            # SQLAlchemy declarative models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic (scheduler, conflict detection)
│   │   └── core/              # Config, security, database session
│   ├── scripts/               # Seed scripts (admin account)
│   ├── tests/                 # Backend tests
│   ├── alembic/               # Database migrations
│   └── requirements.txt
├── shared/                    # Shared TS types (mirrored from Pydantic)
├── docs/                      # Project documentation
├── decisions/                 # Architecture Decision Records
├── specs/                     # Feature specs
└── docker-compose.yml         # Local PostgreSQL
```

## Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16+ (local dev via docker-compose or Render)

### Local Development

```bash
# Start local PostgreSQL
docker-compose up -d

# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # Configure DB connection
python scripts/seed_admin.py   # Seed admin account
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
cp .env.example .env           # Set VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

### Commands

```bash
# Frontend
cd frontend && npm run dev      # Dev server
cd frontend && npm run build    # Production build
cd frontend && npm run lint     # Lint (oxlint)

# Backend
cd backend && uvicorn app.main:app --reload    # Dev server
cd backend && python -m pytest                 # Run tests
cd backend && python scripts/seed_admin.py     # Seed admin account
```

## API Endpoints (v1)

### Patient Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Patient registration |
| POST | `/api/v1/auth/login` | Patient login |
| GET | `/api/v1/services` | List available services |
| POST | `/api/v1/appointments` | Book appointment (date + service) |
| GET | `/api/v1/appointments` | List patient's appointments |
| GET | `/api/v1/availability/calendar` | Crowd meter data for booking |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/auth/login` | Admin login (password-only) |
| GET | `/api/v1/admin/appointments` | List all appointments |
| PATCH | `/api/v1/admin/appointments/:id/accept` | Accept + assign time slot |
| PATCH | `/api/v1/admin/appointments/:id/reject` | Reject appointment |
| PATCH | `/api/v1/admin/appointments/:id/complete` | Mark completed |
| GET | `/api/v1/admin/patients` | List all patients |
| POST | `/api/v1/admin/prescriptions` | Add prescription |
| GET | `/api/v1/admin/services` | Manage services |
| GET | `/api/v1/admin/unavailability` | Doctor unavailability |
| GET | `/api/v1/admin/stats` | Dashboard statistics |

## Database Schema

| Table | Purpose |
|-------|---------|
| `patients` | Patient accounts (email + password) |
| `appointments` | Appointment requests, status, time slots |
| `services` | Orthopedic services & specialties |
| `prescriptions` | Per-appointment prescriptions & diagnosis |
| `appointment_documents` | X-rays, MRI scans, PDFs |
| `doctor_unavailability` | One-off and recurring unavailable times |
| `admin_settings` | Admin credentials and clinic info (single row) |
| `activity_log` | Admin action audit trail |
| `notifications` | System notifications |

### Appointment Status Flow
```
pending → accepted → completed
pending → rejected (can re-book)
```

## Key Features

### For Patients
- **Landing page** — Dr. Rahul Mehta's orthopedic practice, conditions treated, testimonials
- **Service catalog** — Orthopedic services with descriptions and icons
- **Date-only booking** — Pick a date + specialty; crowd meter shows availability
- **Appointment tracking** — View status, assigned time slots, prescriptions
- **Prescription viewer** — See diagnosis and treatment notes

### For Admin (Doctor)
- **Dashboard** — Today's appointments, stats, quick actions
- **Appointment management** — Review, accept (assign time slot), reject, complete
- **Intelligence Engine** — Validates no time overlaps on acceptance
- **Patient management** — Search, view history, prescriptions
- **Unavailability management** — Set surgery days, personal time off
- **Services management** — Add/edit orthopedic services
- **Activity log** — Audit trail of all admin actions

## Architecture Decisions

1. **Single React app, role-routed** — patients and admin share one build; admin lazy-loaded (~27 kB chunk)
2. **DB-seeded admin account** — created via seed script; password changeable from dashboard
3. **Admin login at `/admin/login`** — password-only page, long-lived session (30 days with "Remember me")
4. **Date-only booking** — patients pick a date and service; admin assigns time slots on acceptance
5. **Intelligence Engine** — validates no time overlaps (appointments + unavailability) on acceptance
6. **Mobile-first UI** — deep navy (`#0F2537`) clinical aesthetic, no generic templates

## Deployment

- **Backend:** Render Web Service (FastAPI + Uvicorn)
- **Frontend:** Render Static Site (Vite build output)
- **Database:** Render PostgreSQL

See `docs/deployment.md` for environment variables and deployment details.

# Handoff — Full Project Context for Next AI Agent

**Last Updated:** 2026-07-31 20:35 IST
**Session:** Apex Orthopedics & Joint Care Retheme & Platform Polish

---

## 1. Project Identity

**What:** Apex Orthopedics & Joint Care management system for a single-admin orthopedic practice.
**Who:** Non-technical orthopedic surgeon / specialist. Single admin. Professional, secure, production-grade.
**Goal:** Patient booking website + admin dashboard. Deployment on Render.

**Language:** All patient-facing content in English. UI text, labels, CTAs — all English.

---

## 2. Tech Stack (Invariant)

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | React + Vite | Single project, lazy-loaded admin pages |
| Backend | FastAPI + SQLAlchemy | Sync SQLAlchemy (no async drivers) |
| Database | PostgreSQL | Render managed, `DATABASE_URL` env var |
| Auth | JWT + bcrypt | Sliding-window refresh tokens |
| Hosting | Render | Web service + managed PostgreSQL |
| Package Mgmt | npm (frontend), pip (backend) | No poetry/conda |

**DO NOT CHANGE** without an ADR.

---

## 3. Directory Structure

```
client_project/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app, middleware, error handlers
│   │   ├── database.py             # Engine, session, Base (sync SQLAlchemy)
│   │   │   - ENGINE_URL_KEY = "postgresql" (not "postgresql+asyncpg")
│   │   │   - Session = sessionmaker(bind=engine)
│   │   │   - get_db() → Session (not AsyncSession)
│   │   ├── models.py               # All SQLAlchemy models
│   │   ├── schemas.py              # Pydantic schemas (use ConfigDict, not class Meta)
│   │   │   - PatientSchema: from_attributes=True, populate_by_name=True
│   │   │   - AppointmentSchema: PatientSchema nested (not PatientBase)
│   │   │   - AdminSessionSchema: full patient data for admin view
│   │   ├── auth.py                 # JWT creation/verification, password hashing
│   │   ├── dependencies.py         # get_current_admin, get_current_patient
│   │   ├── routers/
│   │   │   ├── auth.py             # POST /auth/login, /auth/register, /auth/logout, /auth/refresh
│   │   │   ├── admin_auth.py       # POST /admin/auth/login (password-only, no email field)
│   │   │   ├── appointments.py     # Full CRUD with availability validation
│   │   │   ├── services.py         # GET /services
│   │   │   ├── admin.py            # Dashboard stats, patients, availability, unavailability
│   │   │   ├── settings.py         # GET/PUT /settings, PUT /settings/password
│   │   │   └── admin_availability.py # Weekly schedule CRUD (admin/receptionist)
│   │   ├── security.py             # Same functions as auth.py (duplicate)
│   │   └── seed_admin.py           # Creates admin_settings table, seeds default admin
│   ├── scripts/
│   │   └── seed_admin.py           # Must run AFTER first startup (DB must exist)
│   ├── alembic/versions/           # 11 migration files
│   └── requirements.txt            # fastapi, uvicorn, sqlalchemy, psycopg2, pyjwt, bcrypt, etc.
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                 # Central router, role-based redirects
│   │   ├── AuthContext.jsx         # Patient auth (login/register/logout)
│   │   ├── AuthContextAdmin.jsx    # Admin auth (login/logout, NO register)
│   │   ├── components/
│   │   │   ├── PatientRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── AdminNavbar.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── BookPage.jsx        # Date-only booking, crowd meter
│   │   │   ├── MyAppointments.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminLoginPage.jsx      # Password-only, no email field
│   │   │   │   ├── AdminDashboardPage.jsx  # 4 stat cards + appointment tables
│   │   │   │   ├── AdminPatientsPage.jsx   # Search, pagination, toggle active
│   │   │   │   ├── AdminAppointmentsPage.jsx
│   │   │   │   ├── AdminAvailabilityPage.jsx  # Weekly schedule (opening/closing)
│   │   │   │   ├── AdminUnavailabilityPage.jsx # One-off date ranges
│   │   │   │   ├── AdminServicesPage.jsx
│   │   │   │   ├── AdminSettingsPage.jsx   # Profile + password change
│   │   │   │   └── AdminAppointmentsPage.jsx
│   │   │   └── ui/                 # Reusable UI components (button, card, modal, etc.)
│   │   ├── hooks/
│   │   │   ├── useAdminDashboard.js
│   │   │   ├── useAdminPatients.js
│   │   │   └── useAdminUnavailability.js
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with interceptors
│   │   └── lib/
│   │       └── utils.js            # cn(), formatCurrency(), etc.
│   └── index.html
│
├── shared/                         # (empty, reserved for shared types)
├── docker-compose.yml              # PostgreSQL 15, port 5432
├── MEMORY.md                       # Stable project facts
├── TASKS.md                        # Current priorities (ACTIVE)
├── ARCHITECTURE.md                 # System structure
├── HANDOFF.md                      # THIS FILE
├── LEARNINGS.md                    # Recurring lessons
└── decisions/                      # Architecture Decision Records
```

---

## 4. Architecture Rules

### 4.1 Frontend Architecture
- **Single Vite + React project** — not separate frontends
- Admin pages **lazy-loaded** via `React.lazy()` — patients never load admin JS
- Routes: `/`, `/login`, `/register`, `/book`, `/my-appointments`, `/admin/login`, `/admin/*`
- Mobile-first, clean/minimal aesthetic

### 4.2 Backend Architecture
- FastAPI with sync SQLAlchemy (NOT async)
- `Session = sessionmaker(bind=engine)` in `database.py`
- `get_db()` returns sync `Session`, NOT `AsyncSession`
- `session.commit()` NOT `await session.commit()`
- Error handlers catch `SQLAlchemyError`, not `async SQLAlchemyError`

### 4.3 Database
- PostgreSQL on Render
- `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
- DO NOT USE `postgresql+asyncpg://` — sync drivers only

---

## 5. Admin Authentication (CRITICAL)

### Login Flow
1. Admin navigates to `/admin/login`
2. Email field is **pre-known** (from `admin_settings` table, `id=1`)
3. Only **password field** shown — no email input
4. Backend validates against `admin_settings` table
5. Cookie-based session set (30-day expiry with "Remember me")

### Password Change Flow
1. Admin goes to Settings page
2. Enter current password + new password + confirm
3. Backend validates current password against `admin_settings` table
4. Updates `password_hash` column
5. All other admin sessions remain valid (cookie-based, not password-hash-based)

### Registration
- **NO admin registration endpoint exists**
- Admin is seeded via `python scripts/seed_admin.py`
- No signup link on patient site

---

## 6. Appointment Booking System

### Patient-Side Flow
1. Navigate to `/book`
2. Select service from dropdown
3. Calendar shows available dates (green/orange/red crowd meter)
4. Pick date → submit
5. Redirected to `/my-appointments`

### Crowd Meter Logic
```sql
-- Count ACCEPTED appointments per date
SELECT appointment_date, COUNT(*) 
FROM appointments 
WHERE status = 'ACCEPTED' 
GROUP BY appointment_date;
```
- Green: 0 bookings
- Orange: 1-2 bookings
- Red: 3+ bookings

### Admin-Side Flow
1. View pending appointments on dashboard
2. Click "Accept" → date picker opens (pre-filled with patient's chosen date)
3. Admin **assigns time slot** (start_time, end_time)
4. Backend validates no overlap with:
   - Other ACCEPTED appointments
   - Doctor's unavailability (one-off)
   - Doctor's weekly unavailability (recurring)
5. Returns 409 Conflict if overlap

### Unavailability System
- **One-off ranges:** Admin sets specific date ranges
- **Weekly schedule:** Admin defines opening/closing times per day
- **During unavailability:** No appointments can be booked/accepted

---

## 7. Current State (What Works)

### Fully Implemented
- [x] Complete database schema (11 migrations, all applied)
- [x] Patient auth (register, login, JWT with refresh tokens)
- [x] Admin auth (password-only login, session management)
- [x] Appointment CRUD with full validation
- [x] Services CRUD (admin can create/edit/delete)
- [x] Admin dashboard with stats (today's appointments, pending count, active patients, revenue)
- [x] Admin patient management (search, pagination, toggle active)
- [x] Admin appointment management (accept with time slot, cancel, status filtering)
- [x] Admin availability management (weekly schedule, one-off unavailability)
- [x] Admin settings (profile update, password change)
- [x] Crowd meter on booking calendar
- [x] All API endpoints functional
- [x] All database models complete
- [x] Error handling on backend

### Frontend Pages Working
- [x] Landing page
- [x] Patient login/register
- [x] Patient booking page with crowd meter
- [x] Patient appointments page
- [x] Admin login (password-only)
- [x] Admin dashboard (4 stat cards + tables)
- [x] Admin patients (search, pagination, toggle)
- [x] Admin appointments (status tabs, accept with time slot)
- [x] Admin availability (weekly schedule)
- [x] Admin unavailability (one-off ranges)
- [x] Admin services
- [x] Admin settings (profile + password)

---

## 8. Known Issues / TODO

### Must Fix
- [ ] **Dashboard refresh loop** — was fixed, verify stable
- [ ] **Patient search** — must support both name and email search
- [ ] **Email uniqueness** — enforced in DB, error message should be user-friendly

### Should Do
- [ ] Add loading states to all pages
- [ ] Add error boundaries in React
- [ ] Mobile responsiveness audit
- [ ] Form validation (frontend)
- [ ] Optimistic updates for better UX

### Nice to Have
- [ ] Email notifications for appointment status changes
- [ ] Print appointment slip
- [ ] Export patient list (CSV)
- [ ] Analytics dashboard (charts)

---

## 9. Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-jwt-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

---

## 10. Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
python scripts/seed_admin.py          # First time only
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev

# Database migrations
cd backend
alembic upgrade head                  # Apply all migrations
alembic revision --autogenerate -m "description"  # New migration

# Docker (local PostgreSQL)
docker-compose up -d
docker-compose down
```

---

## 11. Key Files Reference

| File | What It Does |
|------|--------------|
| `backend/app/database.py` | ENGINE_URL_KEY="postgresql" (NOT +asyncpg) |
| `backend/app/schemas.py` | ConfigDict not class Meta; PatientSchema has nested Patient |
| `backend/app/routers/appointments.py` | Availability validation logic |
| `backend/app/routers/admin.py` | Dashboard stats, patient management |
| `backend/app/seed_admin.py` | Seeds admin_settings table (id=1) |
| `frontend/src/App.jsx` | Central router, role-based redirects |
| `frontend/src/AuthContextAdmin.jsx` | Admin auth (NO register) |
| `frontend/src/pages/admin/AdminLoginPage.jsx` | Password-only, no email field |
| `frontend/src/pages/admin/AdminDashboardPage.jsx` | 4 stat cards + appointment tables |
| `frontend/src/pages/admin/AdminAvailabilityPage.jsx` | Weekly schedule CRUD |
| `frontend/src/pages/BookPage.jsx` | Date-only booking, crowd meter |

---

## 12. Recurring Pitfalls

See `LEARNINGS.md` for full list. Key ones:

1. **Async vs Sync** — Must use sync SQLAlchemy everywhere
2. **Schema Config** — `ConfigDict(from_attributes=True)` not `class Meta: orm_mode=True`
3. **PatientSchema nesting** — Must use `PatientSchema` not `PatientBase` for appointment responses
4. **Database URL** — Must start with `postgresql://` not `postgresql+asyncpg://`
5. **Commit calls** — `session.commit()` not `await session.commit()`
6. **Admin auth** — Password-only page, no email field on login

---

## 13. How to Resume Work

### Step 1: Verify Current State
```bash
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
```
Test: `/admin/login` → `/admin/dashboard` → `/admin/appointments`

### Step 2: Check TASKS.md
Look at "Remaining Tasks" section — pick highest priority

### Step 3: Before Starting New Feature
1. Read this HANDOFF.md fully
2. Read `MEMORY.md` for stable facts
3. Read `ARCHITECTURE.md` for system structure
4. Check `decisions/*.md` for any relevant ADRs

### Step 4: After Completing Feature
1. Test all affected endpoints
2. Test frontend pages
3. Update TASKS.md (mark complete, add next)
4. Update this HANDOFF.md if architecture changed
5. Update MEMORY.md if stable facts changed

---

## 14. Critical Reminders

1. **NEVER use async SQLAlchemy** — sync only, always
2. **NEVER add email field to admin login** — password-only
3. **NEVER use `class Meta: orm_mode=True`** — use `ConfigDict(from_attributes=True)`
4. **NEVER use `PatientBase` in appointment schemas** — use `PatientSchema`
5. **ALWAYS check for `postgresql+asyncpg://`** — must be `postgresql://`
6. **ALWAYS run `alembic upgrade head`** after pulling changes
7. **ALWAYS verify patient search works by name AND email**
8. **ALWAYS update TASKS.md when completing work**

---

## 15. Contact / Escalation

- **Project files:** `D:\client_project\`
- **Backend:** `D:\client_project\backend\`
- **Frontend:** `D:\client_project\frontend\`
- **Documentation:** `D:\client_project\*.md`

If stuck, check:
1. `LEARNINGS.md` for known solutions
2. `decisions/*.md` for architectural decisions
3. Error logs from backend/frontend console

---

**This file is the source of truth for project state. Update it when work completes.**

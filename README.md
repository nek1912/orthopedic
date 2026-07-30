# Dental Clinic Management System

A full-stack web application for a dental clinic. Patients can discover the clinic online, book appointments (date-only, railway-style), and manage their visits. The doctor gets an admin dashboard to manage appointments, assign non-overlapping time slots, write prescriptions, and track patients.

## Tech Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Frontend      | React + Vite (mobile-first, clean UI)   |
| Backend       | FastAPI + SQLAlchemy                    |
| Database      | PostgreSQL (Render)                     |
| Auth          | JWT + bcrypt (patient), separate admin  |
| Hosting       | Render (web service + PostgreSQL)       |
| SEO           | Added post-MVP                         |

## Project Structure

```
dental-clinic/
├── frontend/              # Vite + React
│   ├── src/
│   │   ├── patient/       # Patient pages (landing, booking, my-appointments)
│   │   ├── admin/         # Admin dashboard (lazy-loaded)
│   │   └── shared/        # Auth context, API client, UI components
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/           # Route handlers
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── core/          # Config, auth, DB
│   └── requirements.txt
├── shared/                # Shared TS types (mirrored)
├── docs/                  # Project documentation
├── decisions/             # Architecture Decision Records
└── specs/                 # Feature specs
```

## Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL (local dev via docker-compose or Render)

### Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Configure DB connection
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
cp .env.example .env       # Set VITE_API_URL
npm run dev
```

## Deployment

- **Backend:** Render Web Service (FastAPI + Gunicorn/Uvicorn)
- **Frontend:** Render Static Site (Vite build output)
- **Database:** Render PostgreSQL

### Environment Variables (Render)

See `docs/deployment.md` for the full list.

## Key Design Decisions

1. **Single React app, role-routed** — patients and admin share one frontend build; admin pages lazy-loaded
2. **DB-seeded admin account** — created via seed script; password changeable from dashboard
3. **Admin login at `/admin`** — password-only page, long-lived session, separate from patient auth
4. **Date-only booking** — patients pick a date and service; admin assigns time slots on acceptance
5. **Non-overlapping slots** — intelligent engine prevents time conflicts on acceptance
6. **Mobile-first UI** — no generic templates, custom clean aesthetic

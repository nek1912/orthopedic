# AGENTS.md — Permanent Instructions for AI Agents

This file defines invariant rules, conventions, and context for any AI agent working on this project. Every session starts here.

## Project Identity

- Dental clinic management system: patient-facing website + admin dashboard
- Doctor is non-tech, single-admin clinic
- Goal: professional, secure, production-grade deployment

## Tech Stack (DO NOT CHANGE without ADR)

| Layer   | Choice                  |
|---------|-------------------------|
| Frontend| React + Vite            |
| Backend | FastAPI + SQLAlchemy    |
| DB      | PostgreSQL (Render)     |
| Auth    | JWT + bcrypt            |
| Hosting | Render                  |

## Critical Rules

### Admin Authentication (CRITICAL — DO NOT VIOLATE)
- Admin account is **DB-seeded** (NOT in env vars, NOT hardcoded)
- Admin credential stored in `admin_settings` table (single row, id=1)
- Seed via: `python scripts/seed_admin.py`
- Password can be changed from admin dashboard settings
- Admin login page at `/admin/login` (separate route from patient login)
- Admin session: sliding-window cookie, long-lived (30 days with "Remember me")
- Admin login: **password-only page** (email pre-known, single field shown)
- No admin registration endpoint exists
- No admin signup link on patient site

### Booking System (CRITICAL)
- **Date-only booking** on patient side (NOT time slots)
- Patients pick a date + service; admin assigns time slot on acceptance
- "Indian railway" crowd meter: green/orange/red per date based on existing bookings
- Patient account required before booking

### The Intelligence Engine (CRITICAL)
- When admin accepts an appointment and assigns a time slot, the system validates:
  1. No overlap with other ACCEPTED appointments on same date
  2. No overlap with doctor's unavailability (one-off or recurring)
  3. Return 409 Conflict if overlap detected
- This is the core business logic — must be rigorous

### Frontend Architecture
- Single Vite + React project (NOT separate frontends)
- Admin pages lazy-loaded via `React.lazy()` so patients never load admin code
- Routes: `/`, `/login`, `/register`, `/book`, `/my-appointments`, `/admin/login`, `/admin/*`
- Mobile-first design, clean/minimal aesthetic, no flashy colors

### Monorepo Structure
- `frontend/` — Vite + React app
- `backend/` — FastAPI app
- `shared/` — mirrored TypeScript types
- One monorepo, independent build commands

## Workflow Conventions

- **No comments in code** unless explicitly asked
- **Verify before claiming completion**: always run lint → typecheck → test
- **If file grows large, split it** — keep components focused
- **Prefer existing patterns** — match code style of neighboring files
- **Decision changes must update** the appropriate AGENTS.md / MEMORY.md / ADR file
- **Commit only when asked** — never commit without explicit instruction

## Key Files

| File | Purpose |
|------|---------|
| `MEMORY.md` | Stable facts about the project |
| `TASKS.md` | Current priorities and status |
| `ARCHITECTURE.md` | System structure and boundaries |
| `HANDOFF.md` | Current session state and unfinished work |
| `LEARNINGS.md` | Recurring lessons and pitfalls |
| `decisions/*.md` | Architecture Decision Records |
| `specs/*.md` | Feature requirements and acceptance criteria |

## Commands

```bash
# Frontend
cd frontend && npm install      # Install deps
cd frontend && npm run dev      # Dev server
cd frontend && npm run build    # Production build
cd frontend && npm run lint     # Lint

# Backend
cd backend && pip install -r requirements.txt  # Install deps
cd backend && uvicorn app.main:app --reload    # Dev server
cd backend && python -m pytest                 # Tests
cd backend && python scripts/seed_admin.py     # Seed admin account

# Docker (local PostgreSQL)
docker-compose up -d
```

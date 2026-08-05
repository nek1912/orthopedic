# TASKS.md — Current Priorities and Status

## Status: Orthopedic Brand Retheme [COMPLETE]

Visual and thematic overhaul from dental to orthopedic clinical platform complete 2026-07-31.

| Priority | Task | Status |
|----------|------|--------|
| P0 | Retheme CSS design tokens (`tokens.css`) to orthopedic navy slate palette | ✅ Done |
| P0 | Rebrand page titles & SEO metadata in `index.html` | ✅ Done |
| P0 | Landing page orthopedic specialties, testimonials, doctor profile update | ✅ Done |
| P0 | Update Hero Section text, trust badges, and imagery metadata | ✅ Done |
| P0 | Retheme Navbar and Footer with Apex Orthopedics branding | ✅ Done |
| P0 | Update ServiceSelector & ServiceCard icons & specialties | ✅ Done |
| P0 | Purge remaining dental references in code | ✅ Done |

## Status: Core Bug Audit & Streamlined Scope Pass [COMPLETE]

Full simplified workflow implementation pass completed 2026-07-31. Core bugs resolved and non-essential features stripped.

| Priority | Task | Status |
|----------|------|--------|
| P0 | Fix accept-appointment 500 (backend M1: MissingGreenlet) | ✅ Done |
| P0 | Fix admin "Today" page date filter (frontend M1) | ✅ Done |
| P0 | Fix calendar API shape mismatch — crowd meter broken (backend M4 / frontend M5) | ✅ Done |
| P0 | Fix patient search debounce race (frontend M2) | ✅ Done |
| P0 | TimeSlotPicker real availability integration & double-submit guard (frontend M9) | ✅ Done |
| P0 | Patient prescription viewer & GET /{appointment_id}/prescriptions endpoint | ✅ Done |
| P1 | Intelligence Engine overlap validation & start/end time guard | ✅ Done |

## Status: Frontend Implementation [COMPLETE]

All 10 phases from the frontend implementation plan are complete.

| Priority | Task | Status |
|----------|------|--------|
| P0 | Create implementation plan from spec | ✅ Done |
| P0 | Scaffold monorepo structure | ✅ Done |
| P0 | Set up Docker Compose (local PostgreSQL) | ✅ Done |
| P0 | Backend: project skeleton (FastAPI + SQLAlchemy) | ✅ Done |
| P0 | Frontend: project skeleton (Vite + React + routing) | ✅ Done |
| P1 | Backend: data models (all tables) | ✅ Done |
| P1 | Backend: admin seed script | ✅ Done |
| P1 | Backend: auth endpoints (patient + admin) | ✅ Done |
| P1 | Frontend: auth pages (login, register, admin login) | ✅ Done |
| P1 | Frontend: landing page with services | ✅ Done |
| P1 | Backend: booking API (create request, availability calendar) | ✅ Done |
| P1 | Frontend: booking flow (date picker + crowd meter) | ✅ Done |
| P1 | Backend: Intelligence Engine (conflict detection) | ✅ Done |
| P2 | Admin dashboard: appointment management | ✅ Done |
| P2 | Admin dashboard: patient history view | ✅ Done |
| P2 | Frontend: patient "my appointments" page | ✅ Done |
| P2 | Backend: prescriptions + documents API | ✅ Done |
| P2 | Admin dashboard: prescriptions/live updates | ✅ Done |
| P2 | Admin dashboard: unavailability management | ✅ Done |
| P3 | SEO improvements | ⏳ Pending |
| P3 | Deployment scripts / Render config | ⏳ Pending |
| P3 | Testing (backend pytest, frontend vitest) | ⏳ Pending |
| P3 | Production hardening (rate limiting, CORS, security) | ⏳ Pending |

## Done

- ✅ Tech stack decided
- ✅ Architecture decisions documented
- ✅ Design spec completed
- ✅ Documentation files created
- ✅ Backend fully scaffolded (models, routes, services, schemas, Intelligence Engine)
- ✅ Frontend fully built (all 10 phases)
- ✅ Admin code lazy-loaded (separate chunk, ~27 kB)
- ✅ Design system (CSS tokens, components, pages)
- ✅ Dark mode (auto + manual toggle)

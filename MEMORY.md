# MEMORY.md — Stable Project Facts

Facts that do not change between sessions. Updated only when a decision changes.

## Project Identity

| Field | Value |
|---|---|
| Project | Dental Clinic Management System |
| Client | Single dentist (non-tech) |
| Users | Patients (public) + Doctor (admin) |
| Goal | Online presence + appointment management |

## Architecture

- **Monorepo** at `D:\client_project` (or wherever cloned)
- Backend is a standalone FastAPI application
- Frontend is a standalone Vite + React application
- They communicate via JSON REST API
- No SSR, no server-side templates

## Database (PostgreSQL)

### Core Tables

| Table | Purpose |
|-------|---------|
| `patients` | Patient accounts (email + password auth) |
| `appointments` | All appointment requests, status, time slots |
| `services` | List of dental services offered |
| `prescriptions` | Per-appointment prescriptions and diagnosis |
| `appointment_documents` | X-rays, PDFs attached to appointments |
| `doctor_unavailability` | One-off and recurring unavailable times |
| `admin_settings` | Single row (id=1) with admin credentials and clinic info |

### Appointment Statuses

```
pending → accepted → completed
pending → rejected (can re-book)
```

## Auth System

- Patients: email + password, JWT, standard login at `/login`
- Admin: password-only page at `/admin/login`, DB-seeded, long-lived sessions
- Admin refresh tokens stored in HTTP-only cookies

## Booking Model

- Patients select a date (NOT a time slot)
- Service selection from predefined list or "Other"
- Crowd meter shows green/orange/red per date
- Admin assigns time slot on acceptance
- Time slots validated for non-overlap by the Intelligence Engine

## Doctor Workflow

1. Review pending requests
2. Accept → assign time slot (validated no-overlap)
3. Reject → optional reason + suggested date
4. Mark patient arrived → Complete → add prescription
5. Set unavailability for future dates/times

## UI/UX Principles

- Mobile-first (strict)
- Clean, minimal, aesthetic — no generic templates
- No flashy colors — medical trustworthiness
- No AI-generated-template look
- Purpose-built branding

## Current State

- Project is at design phase
- No code written yet
- Stack decisions finalized
- Architecture decisions documented in ADRs

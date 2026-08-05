# MEMORY.md — Stable Project Facts

Facts that do not change between sessions. Updated only when a decision changes.

## Project Identity

| Field | Value |
|---|---|
| Project | Dr. Rahul Mehta Orthopedic Care Platform |
| Client | Single orthopedic specialist / surgeon (non-tech) |
| Users | Patients (public) + Doctor/Admin |
| Goal | Premium online presence + streamlined consultation & joint care management |

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
| `services` | List of orthopedic services & specialties offered |
| `prescriptions` | Per-appointment prescriptions and diagnosis |
| `appointment_documents` | X-rays, MRI scans, PDFs attached to appointments |
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
- Specialty selection from predefined list or "Other Concern"
- Crowd meter shows green/orange/red per date
- Admin assigns time slot on acceptance
- Time slots validated for non-overlap by the Intelligence Engine

## Doctor Workflow

1. Review pending consultation requests
2. Accept → assign time slot (validated no-overlap)
3. Reject → optional reason + suggested date
4. Mark patient arrived → Complete → add prescription / treatment notes
5. Set unavailability for surgery / personal days

## UI/UX Principles

- Mobile-first (strict)
- Clean, minimal, clinical aesthetic — deep navy (`#0F2537`) and slate palette
- High trust medical aesthetics — zero generic SaaS look
- Purpose-built orthopedic branding

## Current State

- Landing page redesigned to match landing_page.png with Dr. Rahul Mehta branding.
- Hero section: "Stronger Bones. Better Movement. Better Life." with stats cards (15+ Years, 5000+ Patients, 98% Satisfaction).
- Conditions We Treat: 7 condition cards with icons (Knee, Back & Neck, Shoulder, Sports, Fractures, Arthritis, Joint Replacement).
- Booking section: 3-step process with calendar widget and crowd meter.
- Doctor profile: Dr. Rahul Mehta credentials (MBBS, MS Orthopedics, 15+ Years, 5000+ Patients).
- Testimonials: 3 patient reviews with star ratings.
- FAQ: 8 questions in 2-column layout.
- CTA banner: "Take the first step towards a pain-free life."
- Footer: 5-column layout with Quick Links, Services, Contact, and Clinic Location.
- Intelligence engine and appointment workflow verified.

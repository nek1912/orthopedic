# ADR 0003: Admin Authentication

**Date:** 2026-07-30

## Context

A single non-tech admin manages the clinic. Credentials must be secure yet changeable without redeployment. Admin must stay logged in across sessions.

## Decision

**DB-seeded admin account** stored in `admin_settings` table (single row, id=1). Created via `python scripts/seed_admin.py`.

## Rationale Against Env Vars

- Env vars require Render dashboard access + redeploy to change password
- DB-seeded account allows password change from dashboard settings
- No admin hardcoded anywhere — proper bcrypt hashing

## Admin Login UX

- Separate route at `/admin/login`
- Password-only page (email pre-known from DB, single field)
- Sliding-window session cookie, "Remember me" for 30 days
- No admin registration endpoint
- No admin signup link on patient site

## Consequences

- Seed script must run once on deployment
- Admin password changeable from dashboard settings without redeploy
- Admin auth is completely independent from patient auth system

# ADR 0001: Tech Stack

**Date:** 2026-07-30

## Context

Need a production-grade, zero-cost stack for a dental clinic website with patient-facing booking and admin dashboard.

## Decision

| Layer     | Choice             | Rationale                        |
|-----------|--------------------|----------------------------------|
| Frontend  | React + Vite       | SEO later, simple, fast builds   |
| Backend   | FastAPI            | Python, async, auto-docs         |
| ORM       | SQLAlchemy         | Mature, most used with FastAPI   |
| Database  | PostgreSQL (Render)| Free tier, production-grade      |
| Auth      | JWT + bcrypt       | Stateless, industry standard     |
| Hosting   | Render             | Free tier, built-in PostgreSQL   |

## Consequences

- Frontend is a pure SPA (no SSR)
- Backend and frontend deploy independently on Render
- SEO requires separate effort post-MVP

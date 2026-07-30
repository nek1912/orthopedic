# ADR 0002: Single React App with Role-Routed Pages

**Date:** 2026-07-30

## Context

The project has two user types (patient, admin) with completely different interfaces. We need to choose how to organize the frontend.

## Options Considered

1. **Two separate React apps** — patient and admin in different Vite projects
2. **Single app, role-based routing** — one Vite project, React Router handles route access
3. **Single app with lazy-loaded admin** — same as 2, but admin imports use React.lazy()

## Decision

Option 2 (single app with role routing). Option 3's lazy loading is a natural extension of option 2, applied to admin routes.

## Rationale

- One codebase, shared auth context, API client, types, UI components
- One build to deploy, simpler CI/CD
- Admin pages lazy-loaded via `React.lazy()` so patient bundle stays lean
- No duplicated configuration or login logic

## Consequences

- Admin bundle only loads when navigating to `/admin/*`
- Single Vite config, single package.json
- Router must handle unauthorized access gracefully

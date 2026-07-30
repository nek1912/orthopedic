# LEARNINGS.md — Recurring Lessons and Pitfalls

## Must-Remember

### Admin Auth Is Not Patient Auth

Never conflate admin and patient auth. They have different:
- Login endpoints
- Session strategies (long-lived vs short-lived)
- Frontend routes
- Security considerations

### The Intelligence Engine Is the Core

The non-overlapping time slot enforcement when admin accepts an appointment is the most critical business logic. It must:
- Check against **both** accepted appointments AND doctor unavailability
- Use database-level locking to prevent race conditions
- Return clear error messages when conflicts occur
- Be tested exhaustively

### Booking Is Date-Only on Patient Side

Patients NEVER see time slots. They pick a date. Time slots are only assigned by the admin on acceptance. Violating this means redoing the entire booking flow.

### Admin Code Must Never Load for Patients

Even if unused. Use `React.lazy()` + dynamic imports. The admin dashboard bundle should only download when the browser navigates to `/admin/*`.

### Mobile-First Means Mobile-First

Desktop is the enhancement. All layouts, components, and interactions must be designed for mobile screens first. No "add mobile responsiveness later."

### No Generic Templates

Every UI component must be purpose-built for this clinic. No Tailwind UI copy-paste, no shadcn defaults, no Material UI. The look must be bespoke.

## Past Mistakes (Hypothetical — Add Real Ones Here)

- [ ] — Catch-all for future entries

## Pitfalls to Avoid

- 🔴 Adding time slots to patient booking flow (was already decided against)
- 🔴 Using env vars for admin credentials instead of DB seed
- 🔴 Blocking patients when DB is unavailable (graceful degradation needed)
- 🔴 Exposing admin API endpoints without role middleware
- 🔴 Forgetting CORS config for Render deployment
- 🔴 Not using PostgreSQL row locking for appointment acceptance races

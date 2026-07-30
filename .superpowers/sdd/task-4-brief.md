# Phase 4: Admin Seed Script

**Goal:** Script to create the initial admin account in the database.

## Files to Create

```
backend/scripts/seed_admin.py
```

## Behavior

1. Prompt for email and password (or accept as CLI args: --email and --password)
2. Hash password with bcrypt (use passlib, same as app.core.security)
3. Insert or update `admin_settings` row with id=1
4. Print confirmation
5. If no CLI args, prompt interactively for email and password

## Details

- Import `get_password_hash` from `app.core.security`
- Use async SQLAlchemy session: create engine from settings, session, upsert, cleanup
- If settings.DATABASE_URL is not set, fall back to env var or default
- Handle the case where the database or tables don't exist yet gracefully

## Acceptance Criteria

- [ ] `python scripts/seed_admin.py --email admin@clinic.com --password secret` creates admin row
- [ ] Running it again updates (upsert), doesn't duplicate
- [ ] Password is bcrypt hashed
- [ ] Interactive mode works when no args given

## Constraints

- No comments in code unless explicitly asked
- Use async/await pattern consistent with the rest of the project

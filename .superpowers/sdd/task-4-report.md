# Task 4 Report: Admin Seed Script

## What was implemented

Created `backend/scripts/seed_admin.py` with:
- CLI arg parsing via argparse: `--email`, `--password` (both optional)
- Interactive mode falls back to `input()` for email and `getpass.getpass()` for password
- Async upsert on `admin_settings` table, row `id=1`
- Uses `get_password_hash` from `app.core.security` (bcrypt via passlib)
- Creates its own async engine (doesn't use the global one from `app.core.database`)
- Properly disposes engine in `finally` block
- Graceful error handling with `sys.exit(1)`

## Import verification

`python -c "import scripts.seed_admin"` — OK

## Concerns

None.

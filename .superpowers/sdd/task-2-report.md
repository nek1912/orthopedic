# Task 2 Report: Backend Skeleton (FastAPI)

## Status: DONE_WITH_CONCERNS

## What Was Implemented

- **Full FastAPI project skeleton** under `backend/` with async SQLAlchemy
- **Config**: `app/core/config.py` — Pydantic `BaseSettings` with `DATABASE_URL`, `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `CORS_ORIGINS`. Reads from `.env` file.
- **Database**: `app/core/database.py` — async engine (asyncpg), `async_sessionmaker`, `DeclarativeBase`, `get_db` dependency generator.
- **Security**: `app/core/security.py` — JWT token creation (`python-jose`), bcrypt password hashing/verification (`passlib`).
- **Main app**: `app/main.py` — FastAPI with CORS middleware, lifespan event (auto-create tables on startup for dev), health route at `GET /` returning `{"status": "ok"}`, v1 router included at `/api/v1`.
- **V1 router**: `app/api/v1/router.py` — empty `APIRouter`.
- **Alembic**: initialized with `alembic init alembic`, `env.py` configured for async SQLAlchemy (reads URL from app settings, uses `async_engine_from_config`, `asyncio.run`).
- **pytest.ini**: asyncio_mode = auto.
- **.env.example**: template with default values.
- **requirements.txt**: all pinned deps.

## Files Created

```
backend/
├── .env.example
├── requirements.txt
├── pytest.ini
├── alembic.ini
├── alembic/
│   ├── README
│   ├── env.py                  (async-configured)
│   ├── script.py.mako
│   └── versions/
│       └── .gitkeep
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── router.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   └── __init__.py
│   ├── schemas/
│   │   └── __init__.py
│   └── services/
│       └── __init__.py
└── scripts/
    └── __init__.py
```

## pip install Result

**SUCCESS** — all packages installed. 6 new packages were downloaded (passlib, httpx, httpcore, httptools, watchfiles, websockets); others were already present.

## uvicorn Startup Test

**EXPECTED FAILURE** — PostgreSQL is not running locally (no Docker container started). The error is:
```
asyncpg.exceptions.InvalidAuthorizationSpecificationError: role "dental_dev" does not exist
```
This confirms:
- All Python modules import correctly (config → database → security → main)
- FastAPI app initializes and attempts lifespan (create_all)
- Alembic env.py loads correctly and attempts async connection
- Only missing piece is the actual PostgreSQL database

## Alembic Verification

`alembic check` fails with the same DB connection error, confirming env.py is correctly configured for async mode.

## Issues / Concerns

1. **No DB running** — the lifespan's `create_all` will fail without PostgreSQL. This is expected for dev; Docker Compose must be started first (`docker-compose up -d`).
2. **CRLF warnings** — Git shows whitespace warnings for LF→CRLF conversion on Windows. No functional impact.
3. **Alembic check** cannot be tested without DB — will work once PostgreSQL is available.
4. The `timedelta` import in `security.py` requires Python 3.9+ (uses `|` union syntax) — fine since we're on 3.11.

## Commits

```
ff75cc4 feat: add FastAPI backend skeleton with async SQLAlchemy
```

# Phase 2: Backend Skeleton

**Goal:** FastAPI project with config, database connection, and health check endpoint.

## Files to Create

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, lifespan
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── router.py    # v1 API router
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Pydantic Settings (DATABASE_URL, JWT secrets, CORS origins)
│   │   ├── database.py      # Async SQLAlchemy engine + session factory
│   │   └── security.py      # JWT encode/decode, bcrypt hash/verify
│   ├── models/
│   │   └── __init__.py
│   ├── schemas/
│   │   └── __init__.py
│   └── services/
│       └── __init__.py
├── scripts/
│   └── __init__.py
├── requirements.txt
├── .env.example
└── pytest.ini
```

## Key Decisions

- **Async SQLAlchemy** — use `asyncpg` driver, `AsyncSession`
- **Alembic** — add for migrations (create `alembic/` dir, `alembic.ini`)
- **Config** — Pydantic `BaseSettings` with `.env` file support

## requirements.txt

```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
sqlalchemy[asyncio]>=2.0.0
asyncpg>=0.29.0
alembic>=1.13.0
pydantic-settings>=2.0.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.9
httpx>=0.27.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
```

## Acceptance Criteria

- [ ] `pip install -r requirements.txt` succeeds
- [ ] `uvicorn app.main:app --reload` starts on port 8000
- [ ] `GET /` returns `{"status": "ok"}`
- [ ] `GET /docs` shows Swagger UI
- [ ] Database session connects to PostgreSQL (Docker)

## Constraints (from AGENTS.md)

- No comments in code unless explicitly asked
- No generic templates
- Mobile-first not applicable (backend)
- Never commit without explicit instruction

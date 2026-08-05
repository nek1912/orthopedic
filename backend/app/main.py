from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.rate_limit import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        from sqlalchemy import text
        for ddl in [
            "ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 30",
            "ALTER TABLE services ADD COLUMN IF NOT EXISTS default_fee FLOAT NOT NULL DEFAULT 0",
            "ALTER TABLE services ADD COLUMN IF NOT EXISTS preparation_notes TEXT",
            "ALTER TABLE services ADD COLUMN IF NOT EXISTS requires_followup BOOLEAN NOT NULL DEFAULT false",
            "ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0",
        ]:
            try:
                await conn.execute(text(ddl))
            except Exception:
                pass

    from sqlalchemy import select
    from app.core.database import async_session_factory
    from app.core.security import get_password_hash
    from app.models.admin import AdminSettings
    from app.models.service import Service
    import uuid

    async with async_session_factory() as session:
        result = await session.execute(select(AdminSettings).where(AdminSettings.id == 1))
        if result.scalar_one_or_none() is None:
            session.add(AdminSettings(
                id=1,
                email="admin@apexortho.com",
                password_hash=get_password_hash("admin123"),
            ))
            await session.commit()

    SERVICES = [
        {"name": "Joint Replacement", "description": "Hip, Knee, Shoulder Consultation & Surgery"},
        {"name": "Sports Injury & Arthroscopy", "description": "Minimally Invasive Ligament & Joint Repair"},
        {"name": "Fracture & Trauma Care", "description": "Bone Setting, Casting & Emergency Care"},
        {"name": "Spine & Back Pain Care", "description": "Disc, Vertebral & Sciatica Management"},
        {"name": "Arthritis & Pain Relief", "description": "Joint Injections, Pain Therapy & Care"},
        {"name": "Rehab & Mobility Check", "description": "Post-op Physical Therapy & Alignment"},
    ]

    async with async_session_factory() as session:
        result = await session.execute(select(Service))
        existing = {s.name for s in result.scalars().all()}
        for svc in SERVICES:
            if svc["name"] not in existing:
                session.add(Service(
                    id=uuid.uuid4(),
                    name=svc["name"],
                    description=svc["description"],
                    duration_minutes=30,
                    default_fee=0.0,
                    is_active=True,
                ))
        await session.commit()

    yield
    await engine.dispose()


app = FastAPI(title="Apex Orthopedics API", version="0.1.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"status": "ok"}

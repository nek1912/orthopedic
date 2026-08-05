import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.models.service import Service

SERVICES = [
    {"name": "Joint Replacement", "description": "Hip, Knee, Shoulder Consultation & Surgery"},
    {"name": "Sports Injury & Arthroscopy", "description": "Minimally Invasive Ligament & Joint Repair"},
    {"name": "Fracture & Trauma Care", "description": "Bone Setting, Casting & Emergency Care"},
    {"name": "Spine & Back Pain Care", "description": "Disc, Vertebral & Sciatica Management"},
    {"name": "Arthritis & Pain Relief", "description": "Joint Injections, Pain Therapy & Care"},
    {"name": "Rehab & Mobility Check", "description": "Post-op Physical Therapy & Alignment"},
]


async def seed_services():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    try:
        async with session_factory() as session:
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
            print(f"Seeded {len(SERVICES) - len(existing)} new services ({len(existing)} already existed)")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed_services())

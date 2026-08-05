from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceResponse

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceResponse])
async def list_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.is_active.is_(True)))
    services = result.scalars().all()
    return [
        ServiceResponse(
            id=str(s.id),
            name=s.name,
            description=s.description,
            duration_minutes=s.duration_minutes or 30,
            default_fee=float(s.default_fee) if s.default_fee is not None else 0.0,
            preparation_notes=s.preparation_notes,
            requires_followup=bool(s.requires_followup) if s.requires_followup is not None else False,
            is_active=bool(s.is_active) if s.is_active is not None else True,
        )
        for s in services
    ]

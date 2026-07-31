from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.service import Service
from app.schemas.service import ServiceResponse

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceResponse])
async def list_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).where(Service.is_active == True))
    services = result.scalars().all()
    return [
        ServiceResponse(
            id=str(s.id),
            name=s.name,
            description=s.description,
            duration_minutes=s.duration_minutes,
            default_fee=s.default_fee,
            preparation_notes=s.preparation_notes,
            requires_followup=s.requires_followup,
            is_active=s.is_active,
        )
        for s in services
    ]

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.unavailability import DoctorUnavailability, RecurringEnum
from app.schemas.unavailability import UnavailabilityCreate, UnavailabilityResponse
from app.services.audit import log_activity


router = APIRouter(prefix="/admin/unavailability", tags=["admin-unavailability"])


def _response(u: DoctorUnavailability) -> UnavailabilityResponse:
    return UnavailabilityResponse(
        id=str(u.id),
        date=u.date,
        start_time=u.start_time,
        end_time=u.end_time,
        recurring=u.recurring.value if hasattr(u.recurring, 'value') else u.recurring,
        reason=u.reason,
    )


@router.get("", response_model=list[UnavailabilityResponse])
async def list_unavailability(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(DoctorUnavailability).order_by(DoctorUnavailability.date.desc())
    )
    return [_response(u) for u in result.scalars().all()]


@router.post("", response_model=UnavailabilityResponse, status_code=201)
async def create_unavailability(
    body: UnavailabilityCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    recurring = body.recurring
    if isinstance(recurring, str):
        recurring = RecurringEnum(recurring)

    u = DoctorUnavailability(
        date=body.date,
        start_time=body.start_time,
        end_time=body.end_time,
        recurring=recurring,
        reason=body.reason,
    )
    db.add(u)
    await db.commit()
    await db.refresh(u)
    await log_activity(
        db,
        "unavailability.created",
        "unavailability",
        str(u.id),
        f"{u.date} {u.start_time}-{u.end_time}",
    )
    return _response(u)


@router.delete("/{unavailability_id}")
async def delete_unavailability(
    unavailability_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(DoctorUnavailability).where(
            DoctorUnavailability.id == uuid.UUID(unavailability_id)
        )
    )
    u = result.scalar_one_or_none()
    if u is None:
        raise HTTPException(status_code=404, detail="Unavailability not found")

    uid = str(u.id)
    detail = f"{u.date} {u.start_time}-{u.end_time}"
    await db.delete(u)
    await db.commit()
    await log_activity(
        db, "unavailability.deleted", "unavailability", uid, detail
    )
    return {"message": "Unavailability removed"}

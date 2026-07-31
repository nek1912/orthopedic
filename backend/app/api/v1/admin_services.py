import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.service import Service
from app.schemas.service import (
    ServiceCreate,
    ServiceResponse,
    ServiceUpdate,
    ToggleActiveRequest,
)
from app.services.audit import log_activity


router = APIRouter(prefix="/admin/services", tags=["admin-services"])


def _service_response(s: Service) -> ServiceResponse:
    return ServiceResponse(
        id=str(s.id),
        name=s.name,
        description=s.description,
        duration_minutes=s.duration_minutes,
        default_fee=s.default_fee,
        preparation_notes=s.preparation_notes,
        requires_followup=s.requires_followup,
        is_active=s.is_active,
    )


async def _get_service_or_404(db: AsyncSession, service_id: str) -> Service:
    try:
        uid = uuid.UUID(service_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Service not found")
    result = await db.execute(select(Service).where(Service.id == uid))
    service = result.scalar_one_or_none()
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.get("", response_model=list[ServiceResponse])
async def list_services(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(select(Service).order_by(Service.name))
    return [_service_response(s) for s in result.scalars().all()]


@router.post("", response_model=ServiceResponse, status_code=201)
async def create_service(
    body: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    service = Service(
        name=body.name,
        description=body.description,
        duration_minutes=body.duration_minutes,
        default_fee=body.default_fee if body.default_fee is not None else 0.0,
        preparation_notes=body.preparation_notes,
        requires_followup=body.requires_followup,
        is_active=body.is_active,
    )
    db.add(service)
    await db.commit()
    await db.refresh(service)
    await log_activity(
        db, "service.created", "service", str(service.id), service.name
    )
    return _service_response(service)


@router.patch("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str,
    body: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    service = await _get_service_or_404(db, service_id)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    await db.commit()
    await db.refresh(service)
    await log_activity(
        db, "service.updated", "service", str(service.id), service.name
    )
    return _service_response(service)


@router.patch("/{service_id}/active", response_model=ServiceResponse)
async def toggle_active(
    service_id: str,
    body: ToggleActiveRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    service = await _get_service_or_404(db, service_id)
    service.is_active = body.active
    await db.commit()
    await db.refresh(service)
    action = "service.activated" if service.is_active else "service.deactivated"
    await log_activity(
        db, action, "service", str(service.id), service.name
    )
    return _service_response(service)

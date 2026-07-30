import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.appointment import Appointment
from app.models.prescription import Prescription
from app.schemas.prescription import PrescriptionCreate, PrescriptionResponse


router = APIRouter(prefix="/admin/prescriptions", tags=["admin-prescriptions"])


@router.post("", response_model=PrescriptionResponse, status_code=201)
async def create_prescription(
    body: PrescriptionCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(Appointment).where(Appointment.id == uuid.UUID(body.appointment_id))
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    presc = Prescription(
        appointment_id=uuid.UUID(body.appointment_id),
        medicines=body.medicines,
        diagnosis=body.diagnosis,
        notes=body.notes,
    )
    db.add(presc)
    await db.commit()
    await db.refresh(presc)

    return PrescriptionResponse(
        id=str(presc.id),
        appointment_id=str(presc.appointment_id),
        medicines=presc.medicines,
        diagnosis=presc.diagnosis,
        notes=presc.notes,
        created_at=presc.created_at,
    )


@router.get("/{appointment_id}", response_model=list[PrescriptionResponse])
async def get_prescriptions(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(Prescription)
        .where(Prescription.appointment_id == uuid.UUID(appointment_id))
        .order_by(Prescription.created_at.desc())
    )
    return [
        PrescriptionResponse(
            id=str(p.id),
            appointment_id=str(p.appointment_id),
            medicines=p.medicines,
            diagnosis=p.diagnosis,
            notes=p.notes,
            created_at=p.created_at,
        )
        for p in result.scalars().all()
    ]

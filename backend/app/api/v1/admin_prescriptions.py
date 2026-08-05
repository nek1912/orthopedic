import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.appointment import Appointment, StatusEnum
from app.models.prescription import Prescription, PrescriptionTemplate
from app.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionResponse,
    PrescriptionTemplateCreate,
    PrescriptionTemplateResponse,
)
from app.services.audit import log_activity


class PrescriptionUpdate(BaseModel):
    diagnosis: str | None = None
    medicines: dict | None = None
    notes: str | None = None


router = APIRouter(prefix="/admin/prescriptions", tags=["admin-prescriptions"])


def _prescription_response(p: Prescription) -> PrescriptionResponse:
    return PrescriptionResponse(
        id=str(p.id),
        appointment_id=str(p.appointment_id),
        patient_name=p.appointment.patient.name if p.appointment and p.appointment.patient else "",
        medicines=p.medicines,
        diagnosis=p.diagnosis,
        notes=p.notes,
        created_at=p.created_at,
    )


def _template_response(t: PrescriptionTemplate) -> PrescriptionTemplateResponse:
    return PrescriptionTemplateResponse(
        id=str(t.id),
        name=t.name,
        diagnosis=t.diagnosis,
        medicines=t.medicines,
        notes=t.notes,
        created_at=t.created_at,
    )


@router.post("", response_model=PrescriptionResponse, status_code=201)
async def create_prescription(
    body: PrescriptionCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    try:
        appointment_id = uuid.UUID(body.appointment_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Appointment not found")

    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == appointment_id)
        .options(selectinload(Appointment.patient))
    )
    appointment = result.scalar_one_or_none()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.status not in (StatusEnum.accepted, StatusEnum.completed):
        raise HTTPException(
            status_code=400,
            detail="Prescriptions can only be added to accepted or completed appointments",
        )

    presc = Prescription(
        appointment_id=appointment_id,
        medicines=body.medicines,
        diagnosis=body.diagnosis,
        notes=body.notes,
    )
    db.add(presc)
    await db.commit()
    await db.refresh(presc)
    presc.appointment = appointment
    await log_activity(
        db,
        "prescription.created",
        "prescription",
        str(presc.id),
        f"appointment {body.appointment_id}",
    )

    return _prescription_response(presc)


@router.get("", response_model=list[PrescriptionResponse])
async def list_all_prescriptions(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(Prescription)
        .options(selectinload(Prescription.appointment).selectinload(Appointment.patient))
        .order_by(Prescription.created_at.desc())
    )
    return [_prescription_response(p) for p in result.scalars().all()]


@router.post("/templates", response_model=PrescriptionTemplateResponse, status_code=201)
async def create_template(
    body: PrescriptionTemplateCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    template = PrescriptionTemplate(
        name=body.name,
        diagnosis=body.diagnosis,
        medicines=body.medicines,
        notes=body.notes,
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return _template_response(template)


@router.get("/templates", response_model=list[PrescriptionTemplateResponse])
async def list_templates(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(PrescriptionTemplate).order_by(PrescriptionTemplate.created_at.desc())
    )
    return [_template_response(t) for t in result.scalars().all()]


@router.get("/{appointment_id}", response_model=list[PrescriptionResponse])
async def get_prescriptions(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    try:
        uid = uuid.UUID(appointment_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Appointment not found")
    result = await db.execute(
        select(Prescription)
        .where(Prescription.appointment_id == uid)
        .options(selectinload(Prescription.appointment).selectinload(Appointment.patient))
        .order_by(Prescription.created_at.desc())
    )
    return [_prescription_response(p) for p in result.scalars().all()]


@router.patch("/{prescription_id}", response_model=PrescriptionResponse)
async def update_prescription(
    prescription_id: str,
    body: PrescriptionUpdate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    try:
        uid = uuid.UUID(prescription_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Prescription not found")

    result = await db.execute(
        select(Prescription)
        .where(Prescription.id == uid)
        .options(selectinload(Prescription.appointment).selectinload(Appointment.patient))
    )
    presc = result.scalar_one_or_none()
    if presc is None:
        raise HTTPException(status_code=404, detail="Prescription not found")

    if body.diagnosis is not None:
        presc.diagnosis = body.diagnosis
    if body.medicines is not None:
        presc.medicines = body.medicines
    if body.notes is not None:
        presc.notes = body.notes

    await db.commit()
    await db.refresh(presc)
    await log_activity(
        db,
        "prescription.updated",
        "prescription",
        str(presc.id),
        f"appointment {presc.appointment_id}",
    )
    return _prescription_response(presc)

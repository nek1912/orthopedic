import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.patient import Patient
from app.schemas.auth import PatientResponse
from app.schemas.appointment import AppointmentResponse


router = APIRouter(prefix="/admin/patients", tags=["admin-patients"])


def _patient_response(p: Patient) -> PatientResponse:
    return PatientResponse(
        id=str(p.id),
        name=p.name,
        email=p.email,
        phone=p.phone,
        dob=p.dob,
        created_at=p.created_at,
    )


def _appointment_response(a) -> AppointmentResponse:
    return AppointmentResponse(
        id=str(a.id),
        patient_id=str(a.patient_id),
        patient_name=a.patient.name if a.patient else "",
        service_id=str(a.service_id) if a.service_id else None,
        service_name=a.service.name if a.service else None,
        service_description=a.service_description,
        requested_date=a.requested_date,
        status=a.status.value if hasattr(a.status, 'value') else a.status,
        rejection_reason=a.rejection_reason,
        suggested_date=a.suggested_date,
        time_slot_start=a.time_slot_start,
        time_slot_end=a.time_slot_end,
        notes=a.notes,
        created_at=a.created_at,
        updated_at=a.updated_at,
    )


@router.get("", response_model=list[PatientResponse])
async def list_patients(
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    query = select(Patient)
    if search:
        query = query.where(
            Patient.name.ilike(f"%{search}%") | Patient.email.ilike(f"%{search}%")
        )
    query = query.order_by(Patient.created_at.desc())
    result = await db.execute(query)
    return [_patient_response(p) for p in result.scalars().all()]


@router.get("/{patient_id}")
async def get_patient_detail(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(Patient)
        .where(Patient.id == uuid.UUID(patient_id))
        .options(selectinload(Patient.appointments))
    )
    patient = result.scalar_one_or_none()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    return {
        "patient": _patient_response(patient),
        "appointments": [_appointment_response(a) for a in patient.appointments],
    }

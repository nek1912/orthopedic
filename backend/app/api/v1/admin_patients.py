import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.appointment import Appointment, StatusEnum
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.schemas.admin import AdminPatientResponse
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


async def _appointment_count_rows(db: AsyncSession):
    result = await db.execute(
        select(
            Appointment.patient_id,
            func.count(Appointment.id)
            .filter(
                Appointment.status.in_(
                    [StatusEnum.pending, StatusEnum.accepted, StatusEnum.completed]
                )
            )
            .label("total_visits"),
            func.count(Appointment.id)
            .filter(Appointment.status == StatusEnum.pending)
            .label("pending_count"),
            func.count(Appointment.id)
            .filter(Appointment.status == StatusEnum.completed)
            .label("completed_count"),
            func.max(Appointment.requested_date)
            .filter(Appointment.status == StatusEnum.completed)
            .label("last_visit_date"),
        ).group_by(Appointment.patient_id)
    )
    return result.all()


async def _prescription_count_rows(db: AsyncSession):
    result = await db.execute(
        select(
            Appointment.patient_id,
            func.count(Prescription.id).label("prescription_count"),
        )
        .join(Prescription, Prescription.appointment_id == Appointment.id)
        .group_by(Appointment.patient_id)
    )
    return result.all()


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


@router.get("", response_model=list[AdminPatientResponse])
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
    patients = (await db.execute(query)).scalars().all()

    total_visits = {}
    pending_count = {}
    completed_count = {}
    last_visit_date = {}
    for row in await _appointment_count_rows(db):
        total_visits[row.patient_id] = row.total_visits
        pending_count[row.patient_id] = row.pending_count
        completed_count[row.patient_id] = row.completed_count
        last_visit_date[row.patient_id] = (
            row.last_visit_date.isoformat() if row.last_visit_date else None
        )

    prescription_count = {}
    for row in await _prescription_count_rows(db):
        prescription_count[row.patient_id] = row.prescription_count

    items = []
    for p in patients:
        base = _patient_response(p)
        items.append(
            AdminPatientResponse(
                **base.model_dump(),
                total_visits=total_visits.get(p.id, 0),
                last_visit_date=last_visit_date.get(p.id),
                pending_count=pending_count.get(p.id, 0),
                completed_count=completed_count.get(p.id, 0),
                prescription_count=prescription_count.get(p.id, 0),
            )
        )
    return items


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

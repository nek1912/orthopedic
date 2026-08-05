from fastapi import APIRouter, Depends, Query
from sqlalchemy import String, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.service import Service
from app.schemas.appointment import AppointmentResponse
from app.schemas.auth import PatientResponse
from app.schemas.search import SearchResponse
from app.schemas.service import ServiceResponse


router = APIRouter(prefix="/admin/search", tags=["admin-search"])


def _escape_like(s: str) -> str:
    return s.replace('%', '\\%').replace('_', '\\_')


def _patient_response(p: Patient) -> PatientResponse:
    return PatientResponse(
        id=str(p.id),
        name=p.name,
        email=p.email,
        phone=p.phone,
        dob=p.dob,
        created_at=p.created_at,
    )


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


def _appointment_response(appt) -> AppointmentResponse:
    return AppointmentResponse(
        id=str(appt.id),
        patient_id=str(appt.patient_id),
        patient_name=appt.patient.name if appt.patient else "",
        service_id=str(appt.service_id) if appt.service_id else None,
        service_name=appt.service.name if appt.service else None,
        service_description=appt.service_description,
        requested_date=appt.requested_date,
        status=appt.status.value if hasattr(appt.status, 'value') else appt.status,
        rejection_reason=appt.rejection_reason,
        suggested_date=appt.suggested_date,
        time_slot_start=appt.time_slot_start,
        time_slot_end=appt.time_slot_end,
        notes=appt.notes,
        created_at=appt.created_at,
        updated_at=appt.updated_at,
    )


@router.get("", response_model=SearchResponse)
async def global_search(
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    if not q or not q.strip():
        return SearchResponse()

    pattern = f"%{_escape_like(q.strip())}%"

    patients = (
        await db.execute(
            select(Patient)
            .where(
                Patient.name.ilike(pattern, escape='\\')
                | Patient.email.ilike(pattern, escape='\\')
                | (
                    Patient.phone.isnot(None)
                    & Patient.phone.ilike(pattern, escape='\\')
                )
            )
            .order_by(Patient.created_at.desc())
            .limit(5)
        )
    ).scalars().all()

    services = (
        await db.execute(
            select(Service)
            .where(Service.name.ilike(pattern, escape='\\'))
            .order_by(Service.name)
            .limit(5)
        )
    ).scalars().all()

    appointments = (
        await db.execute(
            select(Appointment)
            .options(selectinload(Appointment.patient), selectinload(Appointment.service))
            .where(
                Patient.name.ilike(pattern, escape='\\')
                | func.cast(Appointment.requested_date, String).ilike(pattern, escape='\\')
                | func.cast(Appointment.status, String).ilike(pattern, escape='\\')
                | Service.name.ilike(pattern, escape='\\')
            )
            .join(Appointment.patient)
            .outerjoin(Appointment.service)
            .order_by(Appointment.requested_date.desc())
            .limit(5)
        )
    ).scalars().all()

    return SearchResponse(
        patients=[_patient_response(p) for p in patients],
        services=[_service_response(s) for s in services],
        appointments=[_appointment_response(a) for a in appointments],
    )

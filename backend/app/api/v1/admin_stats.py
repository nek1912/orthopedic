from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.appointment import Appointment, StatusEnum
from app.models.patient import Patient
from app.schemas.appointment import AppointmentResponse, AppointmentStats
from app.services import appointment_service as svc
from app.services.availability_service import get_next_available_day

router = APIRouter(prefix="/admin", tags=["admin-stats"])


def _build_response(appt) -> AppointmentResponse:
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


@router.get("/stats", response_model=AppointmentStats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    today = date.today()
    today_appts = await svc.get_admin_appointments(db, date_=today)
    pending_appts = await svc.get_admin_appointments(db, status="pending")

    total_patients_result = await db.execute(select(func.count(Patient.id)))
    total_patients = total_patients_result.scalar() or 0

    completed_result = await db.execute(
        select(func.count(Appointment.id)).where(
            Appointment.status == StatusEnum.completed
        )
    )
    completed_count = completed_result.scalar() or 0

    total_result = await db.execute(select(func.count(Appointment.id)))
    total_count = total_result.scalar() or 0

    completion_rate = (completed_count / total_count * 100) if total_count > 0 else 0

    next_day = await get_next_available_day(db, today)

    return AppointmentStats(
        today_count=len(today_appts),
        pending_count=len(pending_appts),
        total_patients=total_patients,
        completion_rate=round(completion_rate, 1),
        next_available_day=next_day.isoformat() if next_day else None,
        today_appointments=[_build_response(a) for a in today_appts],
    )

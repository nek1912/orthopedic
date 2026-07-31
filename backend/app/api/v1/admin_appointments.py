from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.schemas.appointment import (
    AcceptRequest,
    AdminAppointmentDetail,
    AppointmentListResponse,
    AppointmentResponse,
    RejectRequest,
)
from app.services import appointment_service as svc
from app.services.audit import log_activity

router = APIRouter(prefix="/admin/appointments", tags=["admin-appointments"])


def _appointment_summary(appt) -> str:
    service = appt.service.name if appt.service else appt.service_description
    return f"{appt.patient.name} · {service} · {appt.requested_date}"


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


def _build_detail(appt) -> AdminAppointmentDetail:
    base = _build_response(appt)
    return AdminAppointmentDetail(
        **base.model_dump(),
        patient_email=appt.patient.email if appt.patient else "",
        patient_phone=appt.patient.phone if appt.patient else None,
    )


@router.get("", response_model=AppointmentListResponse)
async def list_appointments(
    status: str | None = Query(None),
    date: date | None = Query(None, alias="date"),
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    appointments = await svc.get_admin_appointments(db, status, date)
    return AppointmentListResponse(
        appointments=[_build_response(a) for a in appointments]
    )


@router.get("/{appointment_id}", response_model=AdminAppointmentDetail)
async def get_appointment_detail(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    appt = await svc.get_appointment_detail(db, appointment_id)
    if appt is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return _build_detail(appt)


@router.patch("/{appointment_id}/accept", response_model=AppointmentResponse)
async def accept_appointment(
    appointment_id: str,
    body: AcceptRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    appt = await svc.accept_appointment(
        db, appointment_id, body.date, body.start_time, body.end_time
    )
    await log_activity(
        db,
        "appointment.accepted",
        "appointment",
        str(appt.id),
        f"{_appointment_summary(appt)} {appt.time_slot_start}-{appt.time_slot_end}",
    )
    return _build_response(appt)


@router.patch("/{appointment_id}/reject", response_model=AppointmentResponse)
async def reject_appointment(
    appointment_id: str,
    body: RejectRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    appt = await svc.reject_appointment(
        db, appointment_id, body.reason, body.suggested_date
    )
    await log_activity(
        db,
        "appointment.rejected",
        "appointment",
        str(appt.id),
        f"{_appointment_summary(appt)} · {appt.rejection_reason}",
    )
    return _build_response(appt)


@router.patch("/{appointment_id}/arrive", response_model=AppointmentResponse)
async def mark_arrived(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    appt = await svc.mark_arrived(db, appointment_id)
    await log_activity(
        db, "appointment.arrived", "appointment", str(appt.id), _appointment_summary(appt)
    )
    return _build_response(appt)


@router.patch("/{appointment_id}/complete", response_model=AppointmentResponse)
async def mark_completed(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    appt = await svc.mark_completed(db, appointment_id)
    await log_activity(
        db, "appointment.completed", "appointment", str(appt.id), _appointment_summary(appt)
    )
    return _build_response(appt)

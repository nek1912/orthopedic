from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_patient
from app.models.patient import Patient
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentListResponse,
    AppointmentResponse,
    CancelResponse,
)
from app.services import appointment_service as svc
from app.services.audit import create_notification, log_activity

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _build_response(appt) -> AppointmentResponse:
    return AppointmentResponse(
        id=str(appt.id),
        patient_id=str(appt.patient_id) if appt.patient_id else "",
        patient_name=appt.patient.name if (hasattr(appt, 'patient') and appt.patient) else "",
        service_id=str(appt.service_id) if appt.service_id else None,
        service_name=appt.service.name if (hasattr(appt, 'service') and appt.service) else None,
        service_description=appt.service_description,
        requested_date=str(appt.requested_date) if appt.requested_date else "",
        status=appt.status.value if hasattr(appt.status, 'value') else str(appt.status),
        rejection_reason=appt.rejection_reason,
        suggested_date=str(appt.suggested_date) if appt.suggested_date else None,
        time_slot_start=str(appt.time_slot_start) if appt.time_slot_start else None,
        time_slot_end=str(appt.time_slot_end) if appt.time_slot_end else None,
        notes=appt.notes,
        created_at=str(appt.created_at) if appt.created_at else None,
        updated_at=str(appt.updated_at) if appt.updated_at else None,
        prescriptions=[
            {
                "id": str(p.id),
                "diagnosis": p.diagnosis,
                "medicines": p.medicines,
                "notes": p.notes,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in getattr(appt, "prescriptions", [])
        ]
    )


@router.post("", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    body: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    patient: Patient = Depends(get_current_patient),
):
    if body.requested_date < date.today():
        raise HTTPException(status_code=400, detail="Cannot book appointments in the past")
    appt = await svc.create_appointment(
        db=db,
        patient_id=str(patient.id),
        service_id=body.service_id,
        service_description=body.service_description,
        requested_date=body.requested_date,
    )
    service_name = appt.service.name if appt.service else (appt.service_description or "service")
    await create_notification(
        db,
        "request.new",
        "New appointment request",
        f"{appt.patient.name} requested {service_name} on {appt.requested_date}",
    )
    await log_activity(
        db,
        "appointment.booked",
        "appointment",
        str(appt.id),
        f"{appt.patient.name} booked {service_name} for {appt.requested_date}",
    )
    return _build_response(appt)


@router.get("", response_model=AppointmentListResponse)
async def list_appointments(
    db: AsyncSession = Depends(get_db),
    patient: Patient = Depends(get_current_patient),
):
    appointments = await svc.get_patient_appointments(db, str(patient.id))
    return AppointmentListResponse(
        appointments=[_build_response(a) for a in appointments]
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    patient: Patient = Depends(get_current_patient),
):
    appt = await svc.get_appointment(db, appointment_id)
    if appt is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if str(appt.patient_id) != str(patient.id):
        raise HTTPException(status_code=403, detail="Not your appointment")
    return _build_response(appt)


@router.patch("/{appointment_id}/cancel", response_model=CancelResponse)
async def cancel_appointment(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    patient: Patient = Depends(get_current_patient),
):
    appt = await svc.cancel_patient_appointment(db, appointment_id, str(patient.id))
    await create_notification(
        db,
        "appointment.cancelled",
        "Appointment cancelled",
        f"{appt.patient.name} cancelled the {appt.requested_date} appointment",
    )
    await log_activity(
        db,
        "appointment.cancelled",
        "appointment",
        str(appt.id),
        f"{appt.patient.name} cancelled the {appt.requested_date} appointment",
    )
    return CancelResponse()


@router.get("/{appointment_id}/prescriptions")
async def get_patient_appointment_prescriptions(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    patient: Patient = Depends(get_current_patient),
):
    import uuid
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.prescription import Prescription
    from app.schemas.prescription import PrescriptionResponse

    try:
        appt_uuid = uuid.UUID(appointment_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt = await svc.get_appointment(db, appointment_id)
    if appt is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if str(appt.patient_id) != str(patient.id):
        raise HTTPException(status_code=403, detail="Not your appointment")

    result = await db.execute(
        select(Prescription)
        .where(Prescription.appointment_id == appt_uuid)
        .options(selectinload(Prescription.appointment))
        .order_by(Prescription.created_at.desc())
    )
    prescriptions = result.scalars().all()
    return [
        PrescriptionResponse(
            id=str(p.id),
            appointment_id=str(p.appointment_id),
            patient_name=patient.name,
            medicines=p.medicines,
            diagnosis=p.diagnosis,
            notes=p.notes,
            created_at=p.created_at,
        )
        for p in prescriptions
    ]

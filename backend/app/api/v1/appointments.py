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

router = APIRouter(prefix="/appointments", tags=["appointments"])


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


@router.post("", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    body: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
    patient: Patient = Depends(get_current_patient),
):
    appt = await svc.create_appointment(
        db=db,
        patient_id=str(patient.id),
        service_id=body.service_id,
        service_description=body.service_description,
        requested_date=body.requested_date,
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
    await svc.cancel_appointment(db, appointment_id, str(patient.id))
    return CancelResponse()

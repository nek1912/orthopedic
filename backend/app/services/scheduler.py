import uuid
from datetime import date, time

from fastapi import HTTPException
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment, StatusEnum
from app.models.unavailability import DoctorUnavailability, RecurringEnum


from sqlalchemy.orm import selectinload


async def validate_and_accept(
    db: AsyncSession,
    appointment_id: str,
    target_date: date,
    start_time: time,
    end_time: time,
) -> Appointment:
    if end_time <= start_time:
        raise HTTPException(status_code=400, detail="end_time must be after start_time")

    try:
        appt_uuid = uuid.UUID(appointment_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Appointment not found")

    await db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:date_str))"), {"date_str": str(target_date)})

    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == appt_uuid)
        .options(
            selectinload(Appointment.patient),
            selectinload(Appointment.service),
            selectinload(Appointment.prescriptions),
        )
        .with_for_update()
    )
    appointment = result.scalar_one_or_none()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.status != StatusEnum.pending:
        raise HTTPException(status_code=400, detail="Appointment is not pending")

    accepted = await db.execute(
        select(Appointment).where(
            Appointment.requested_date == target_date,
            Appointment.status == StatusEnum.accepted,
            Appointment.id != appt_uuid,
        ).with_for_update()
    )
    for a in accepted.scalars().all():
        if a.time_slot_start and a.time_slot_end:
            if a.time_slot_start < end_time and a.time_slot_end > start_time:
                raise HTTPException(
                    status_code=409,
                    detail=f"Overlaps with appointment ({a.time_slot_start}-{a.time_slot_end})"
                )

    all_unavailability = await db.execute(select(DoctorUnavailability))
    for u in all_unavailability.scalars().all():
        if _is_unavailable_for_date(u, target_date):
            if u.start_time < end_time and u.end_time > start_time:
                raise HTTPException(
                    status_code=409,
                    detail=f"Overlaps with unavailability ({u.start_time}-{u.end_time})"
                )

    appointment.status = StatusEnum.accepted
    appointment.time_slot_start = start_time
    appointment.time_slot_end = end_time
    appointment.requested_date = target_date
    await db.commit()
    await db.refresh(appointment, ["patient", "service", "prescriptions"])
    return appointment


def _is_unavailable_for_date(
    u: DoctorUnavailability,
    target_date: date,
) -> bool:
    if target_date < u.date:
        return False
    if u.recurring == RecurringEnum.none:
        return u.date == target_date
    if u.recurring == RecurringEnum.weekly:
        return u.date.weekday() == target_date.weekday()
    if u.recurring == RecurringEnum.weekdays:
        return target_date.weekday() < 5
    return False

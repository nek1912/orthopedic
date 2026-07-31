import uuid
from datetime import date, datetime, time, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.appointment import Appointment, StatusEnum
from app.models.service import Service
from app.services.scheduler import validate_and_accept


async def create_appointment(
    db: AsyncSession,
    patient_id: str,
    service_id: str | None,
    service_description: str | None,
    requested_date: date,
) -> Appointment:
    if service_id:
        result = await db.execute(
            select(Service).where(Service.id == uuid.UUID(service_id), Service.is_active == True)
        )
        if result.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail="Service not found")

    appointment = Appointment(
        patient_id=uuid.UUID(patient_id),
        service_id=uuid.UUID(service_id) if service_id else None,
        service_description=service_description,
        requested_date=requested_date,
        status=StatusEnum.pending,
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment, ["patient", "service"])
    return appointment


async def cancel_patient_appointment(
    db: AsyncSession,
    appointment_id: str,
    patient_id: str,
) -> Appointment:
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == uuid.UUID(appointment_id))
        .options(selectinload(Appointment.patient), selectinload(Appointment.service))
    )
    appointment = result.scalar_one_or_none()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if str(appointment.patient_id) != patient_id:
        raise HTTPException(status_code=403, detail="Not your appointment")
    if appointment.status != StatusEnum.pending:
        raise HTTPException(status_code=400, detail="Only pending appointments can be cancelled")

    appointment.status = StatusEnum.cancelled
    await db.commit()
    await db.refresh(appointment, ["patient", "service"])
    return appointment


async def get_patient_appointments(
    db: AsyncSession,
    patient_id: str,
) -> list[Appointment]:
    result = await db.execute(
        select(Appointment)
        .where(Appointment.patient_id == uuid.UUID(patient_id))
        .order_by(Appointment.requested_date.desc())
        .options(selectinload(Appointment.patient), selectinload(Appointment.service))
    )
    return list(result.scalars().all())


async def get_appointment(
    db: AsyncSession,
    appointment_id: str,
) -> Appointment | None:
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == uuid.UUID(appointment_id))
        .options(selectinload(Appointment.patient), selectinload(Appointment.service))
    )
    return result.scalar_one_or_none()


async def accept_appointment(
    db: AsyncSession,
    appointment_id: str,
    date_: date,
    start_time: time,
    end_time: time,
) -> Appointment:
    return await validate_and_accept(db, appointment_id, date_, start_time, end_time)


async def reject_appointment(
    db: AsyncSession,
    appointment_id: str,
    reason: str | None,
    suggested_date: date | None,
) -> Appointment:
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == uuid.UUID(appointment_id))
        .options(selectinload(Appointment.patient), selectinload(Appointment.service))
    )
    appointment = result.scalar_one_or_none()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.status != StatusEnum.pending:
        raise HTTPException(status_code=400, detail="Appointment is not pending")

    appointment.status = StatusEnum.rejected
    appointment.rejection_reason = reason
    appointment.suggested_date = suggested_date
    await db.commit()
    await db.refresh(appointment, ["patient", "service"])
    return appointment


async def mark_arrived(
    db: AsyncSession,
    appointment_id: str,
) -> Appointment:
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == uuid.UUID(appointment_id))
        .options(selectinload(Appointment.patient), selectinload(Appointment.service))
    )
    appointment = result.scalar_one_or_none()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.status != StatusEnum.accepted:
        raise HTTPException(status_code=400, detail="Appointment must be accepted first")
    appointment.arrived_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(appointment, ["patient", "service"])
    return appointment


async def mark_completed(
    db: AsyncSession,
    appointment_id: str,
) -> Appointment:
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == uuid.UUID(appointment_id))
        .options(selectinload(Appointment.patient), selectinload(Appointment.service))
    )
    appointment = result.scalar_one_or_none()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.status != StatusEnum.accepted:
        raise HTTPException(status_code=400, detail="Appointment must be accepted first")

    appointment.status = StatusEnum.completed
    await db.commit()
    await db.refresh(appointment, ["patient", "service"])
    return appointment


async def cancel_appointment(
    db: AsyncSession,
    appointment_id: str,
) -> Appointment:
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == uuid.UUID(appointment_id))
        .options(selectinload(Appointment.patient), selectinload(Appointment.service))
    )
    appointment = result.scalar_one_or_none()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appointment.status != StatusEnum.accepted:
        raise HTTPException(status_code=400, detail="Only accepted appointments can be cancelled")

    appointment.status = StatusEnum.cancelled
    await db.commit()
    await db.refresh(appointment, ["patient", "service"])
    return appointment


async def get_admin_appointments(
    db: AsyncSession,
    status: str | None = None,
    date_: date | None = None,
) -> list[Appointment]:
    query = select(Appointment).options(
        selectinload(Appointment.patient), selectinload(Appointment.service)
    )
    if status:
        query = query.where(Appointment.status == status)
    if date_:
        query = query.where(Appointment.requested_date == date_)
    query = query.order_by(Appointment.created_at.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_appointment_detail(
    db: AsyncSession,
    appointment_id: str,
) -> Appointment | None:
    result = await db.execute(
        select(Appointment)
        .where(Appointment.id == uuid.UUID(appointment_id))
        .options(
            selectinload(Appointment.patient),
            selectinload(Appointment.service),
            selectinload(Appointment.prescriptions),
        )
    )
    return result.scalar_one_or_none()

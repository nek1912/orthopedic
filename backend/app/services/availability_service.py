import calendar
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment, StatusEnum
from app.models.unavailability import DoctorUnavailability, RecurringEnum


async def get_calendar(db: AsyncSession, year_month: str) -> dict:
    try:
        year, month = map(int, year_month.split("-"))
    except (ValueError, IndexError):
        raise ValueError("Invalid month format, use YYYY-MM")

    _, last_day = calendar.monthrange(year, month)
    start_date = date(year, month, 1)
    end_date = date(year, month, last_day)

    appointments_result = await db.execute(
        select(
            Appointment.requested_date,
            func.count(Appointment.id).label("count"),
        ).where(
            Appointment.requested_date >= start_date,
            Appointment.requested_date <= end_date,
            Appointment.status.in_([StatusEnum.pending, StatusEnum.accepted]),
        ).group_by(Appointment.requested_date)
    )
    appointment_counts = {row[0]: row[1] for row in appointments_result.all()}

    unavailability_result = await db.execute(select(DoctorUnavailability))
    all_unavailability = list(unavailability_result.scalars().all())

    result = {}
    for day in range(1, last_day + 1):
        current_date = date(year, month, day)
        count = appointment_counts.get(current_date, 0)

        if count <= 3:
            level = "green"
        elif count <= 7:
            level = "orange"
        else:
            level = "red"

        blocked = any(
            _is_unavailable_for_date(u, current_date)
            for u in all_unavailability
        )

        result[current_date.isoformat()] = {
            "count": count,
            "level": level,
            "blocked": blocked,
        }

    return result


def _is_unavailable_for_date(
    u: DoctorUnavailability,
    target_date: date,
) -> bool:
    if u.recurring == RecurringEnum.none:
        return u.date == target_date
    if u.recurring == RecurringEnum.weekly:
        return u.date.weekday() == target_date.weekday()
    if u.recurring == RecurringEnum.weekdays:
        return target_date.weekday() < 5
    return False


async def get_next_available_day(db: AsyncSession, after_date: date) -> date | None:
    from app.services.scheduler import _is_unavailable_for_date as is_unavailable

    current = after_date + timedelta(days=1)
    max_lookahead = after_date + timedelta(days=30)

    while current <= max_lookahead:
        unavailability_result = await db.execute(select(DoctorUnavailability))
        unavailable = unavailability_result.scalars().all()

        if not any(is_unavailable(u, current) for u in unavailable):
            existing = await db.execute(
                select(func.count(Appointment.id)).where(
                    Appointment.requested_date == current,
                    Appointment.status.in_([StatusEnum.accepted, StatusEnum.pending]),
                )
            )
            count = existing.scalar() or 0
            if count < 8:
                return current

        current += timedelta(days=1)

    return None

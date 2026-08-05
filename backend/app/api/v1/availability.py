from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.unavailability import DoctorUnavailability
from app.services.availability_service import get_calendar

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("/calendar")
async def calendar(
    month: str = Query(..., description="Month in YYYY-MM format"),
    db: AsyncSession = Depends(get_db),
):
    try:
        dates = await get_calendar(db, month)
        return {"dates": dates}
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid month format")


@router.get("/unavailability")
async def get_unavailability(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db),
):
    try:
        target = date
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    from datetime import date as date_type
    target_date = date_type.fromisoformat(date)

    result = await db.execute(
        select(DoctorUnavailability).where(
            DoctorUnavailability.date == target_date
        )
    )
    entries = result.scalars().all()

    from app.models.unavailability import RecurringEnum
    for recurring_type in [RecurringEnum.weekly, RecurringEnum.weekdays]:
        rec_result = await db.execute(
            select(DoctorUnavailability).where(
                DoctorUnavailability.recurring == recurring_type,
                DoctorUnavailability.date <= target_date,
            )
        )
        for r in rec_result.scalars().all():
            if recurring_type == RecurringEnum.weekly and r.date.weekday() == target_date.weekday():
                if not any(e.id == r.id for e in entries):
                    entries.append(r)
            elif recurring_type == RecurringEnum.weekdays and target_date.weekday() < 5:
                if not any(e.id == r.id for e in entries):
                    entries.append(r)

    return [
        {
            "start_time": str(e.start_time),
            "end_time": str(e.end_time),
            "reason": e.reason,
        }
        for e in entries
    ]

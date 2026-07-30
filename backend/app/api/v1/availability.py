from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.availability_service import get_calendar

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("/calendar")
async def calendar(
    month: str = Query(..., description="Month in YYYY-MM format"),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await get_calendar(db, month)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

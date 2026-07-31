from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.activity_log import ActivityLog
from app.models.admin import AdminSettings
from app.schemas.activity import ActivityLogResponse


router = APIRouter(prefix="/admin/activity", tags=["admin-activity"])


@router.get("", response_model=list[ActivityLogResponse])
async def list_activity(
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit)
    )
    return [
        ActivityLogResponse(
            id=str(a.id),
            created_at=a.created_at,
            action=a.action,
            entity_type=a.entity_type,
            entity_id=a.entity_id,
            detail=a.detail,
        )
        for a in result.scalars().all()
    ]

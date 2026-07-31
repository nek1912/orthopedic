import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse


router = APIRouter(prefix="/admin/notifications", tags=["admin-notifications"])


def _response(n: Notification) -> NotificationResponse:
    return NotificationResponse(
        id=str(n.id),
        created_at=n.created_at,
        type=n.type,
        title=n.title,
        message=n.message,
        is_read=n.is_read,
    )


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(Notification).order_by(Notification.created_at.desc())
    )
    return [_response(n) for n in result.scalars().all()]


@router.patch("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    await db.execute(update(Notification).values(is_read=True))
    await db.commit()
    return {"message": "All notifications marked read"}


@router.patch("/{notification_id}", response_model=NotificationResponse)
async def mark_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    try:
        uid = uuid.UUID(notification_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Notification not found")
    result = await db.execute(select(Notification).where(Notification.id == uid))
    notification = result.scalar_one_or_none()
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    await db.commit()
    await db.refresh(notification)
    return _response(notification)

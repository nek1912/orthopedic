from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity_log import ActivityLog
from app.models.notification import Notification


async def log_activity(
    db: AsyncSession,
    action: str,
    entity_type: str,
    entity_id: str,
    detail: str | None = None,
) -> None:
    db.add(
        ActivityLog(
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            detail=detail,
        )
    )
    await db.commit()


async def create_notification(
    db: AsyncSession,
    type: str,
    title: str,
    message: str,
) -> None:
    db.add(Notification(type=type, title=title, message=message))
    await db.commit()

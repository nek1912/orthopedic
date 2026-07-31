from datetime import datetime

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    created_at: datetime
    type: str
    title: str
    message: str
    is_read: bool

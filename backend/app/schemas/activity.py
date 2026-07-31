from datetime import datetime

from pydantic import BaseModel


class ActivityLogResponse(BaseModel):
    id: str
    created_at: datetime
    action: str
    entity_type: str
    entity_id: str
    detail: str | None = None

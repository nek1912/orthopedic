from datetime import datetime

from pydantic import BaseModel


class PrescriptionCreate(BaseModel):
    appointment_id: str
    medicines: dict | None = None
    diagnosis: str | None = None
    notes: str | None = None


class PrescriptionResponse(BaseModel):
    id: str
    appointment_id: str
    medicines: dict | None = None
    diagnosis: str | None = None
    notes: str | None = None
    created_at: datetime

from datetime import datetime

from pydantic import BaseModel, Field


class PrescriptionCreate(BaseModel):
    appointment_id: str
    medicines: dict | None = None
    diagnosis: str | None = None
    notes: str | None = None


class PrescriptionResponse(BaseModel):
    id: str
    appointment_id: str
    patient_name: str
    medicines: dict | None = None
    diagnosis: str | None = None
    notes: str | None = None
    created_at: datetime


class PrescriptionTemplateCreate(BaseModel):
    name: str = Field(min_length=1)
    diagnosis: str | None = None
    medicines: dict | None = None
    notes: str | None = None


class PrescriptionTemplateResponse(BaseModel):
    id: str
    name: str
    diagnosis: str | None = None
    medicines: dict | None = None
    notes: str | None = None
    created_at: datetime

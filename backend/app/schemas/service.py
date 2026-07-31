from pydantic import BaseModel, Field


class ServiceResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    duration_minutes: int
    default_fee: float
    preparation_notes: str | None = None
    requires_followup: bool
    is_active: bool


class ServiceCreate(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None
    duration_minutes: int = Field(gt=0)
    default_fee: float | None = None
    preparation_notes: str | None = None
    requires_followup: bool = False
    is_active: bool = True


class ServiceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    description: str | None = None
    duration_minutes: int | None = Field(default=None, gt=0)
    default_fee: float | None = None
    preparation_notes: str | None = None
    requires_followup: bool | None = None
    is_active: bool | None = None


class ToggleActiveRequest(BaseModel):
    active: bool

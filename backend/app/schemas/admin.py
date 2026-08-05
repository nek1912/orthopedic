from pydantic import BaseModel, Field

from app.schemas.auth import PatientResponse


class AdminLoginRequest(BaseModel):
    password: str
    remember_me: bool = False


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class AdminLoginResponse(BaseModel):
    message: str = "Login successful"


class AdminPatientResponse(PatientResponse):
    total_visits: int = 0
    last_visit_date: str | None = None
    pending_count: int = 0
    completed_count: int = 0
    prescription_count: int = 0

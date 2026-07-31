from pydantic import BaseModel

from app.schemas.auth import PatientResponse


class AdminLoginRequest(BaseModel):
    password: str
    remember_me: bool = False


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class AdminLoginResponse(BaseModel):
    message: str = "Login successful"
    access_token: str


class AdminPatientResponse(PatientResponse):
    total_visits: int = 0
    last_visit_date: str | None = None
    pending_count: int = 0
    completed_count: int = 0
    prescription_count: int = 0

from datetime import date, datetime

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str | None = None
    dob: date | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class PatientResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str | None = None
    dob: date | None = None
    created_at: datetime


class AuthResponse(BaseModel):
    patient: PatientResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

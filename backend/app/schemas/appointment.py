from datetime import date, datetime, time

from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    service_id: str | None = None
    service_description: str | None = None
    requested_date: date


class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: str = ""
    service_id: str | None = None
    service_name: str | None = None
    service_description: str | None = None
    requested_date: date | str
    status: str
    rejection_reason: str | None = None
    suggested_date: date | str | None = None
    time_slot_start: time | str | None = None
    time_slot_end: time | str | None = None
    notes: str | None = None
    created_at: datetime | str | None = None
    updated_at: datetime | str | None = None
    prescriptions: list[dict] = []


class AppointmentListResponse(BaseModel):
    appointments: list[AppointmentResponse]


class CancelResponse(BaseModel):
    message: str = "Appointment cancelled"


class AdminAppointmentDetail(AppointmentResponse):
    patient_email: str
    patient_phone: str | None = None


class AcceptRequest(BaseModel):
    date: date
    start_time: time
    end_time: time


class RejectRequest(BaseModel):
    reason: str | None = None
    suggested_date: date | None = None


class AppointmentStats(BaseModel):
    today_count: int = 0
    pending_count: int = 0
    total_patients: int = 0
    completion_rate: float = 0.0
    next_available_day: str | None = None
    today_appointments: list[AppointmentResponse] = []

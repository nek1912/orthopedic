from pydantic import BaseModel

from app.schemas.appointment import AppointmentResponse
from app.schemas.auth import PatientResponse
from app.schemas.service import ServiceResponse


class SearchResponse(BaseModel):
    patients: list[PatientResponse] = []
    services: list[ServiceResponse] = []
    appointments: list[AppointmentResponse] = []

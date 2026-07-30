from datetime import date, time

from pydantic import BaseModel


class UnavailabilityCreate(BaseModel):
    date: date
    start_time: time
    end_time: time
    recurring: str = "none"
    reason: str | None = None


class UnavailabilityResponse(BaseModel):
    id: str
    date: date
    start_time: time
    end_time: time
    recurring: str
    reason: str | None = None

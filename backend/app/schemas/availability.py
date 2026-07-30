from pydantic import BaseModel


class DateAvailability(BaseModel):
    count: int
    level: str
    blocked: bool


class CalendarResponse(BaseModel):
    dates: dict[str, DateAvailability]

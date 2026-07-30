import enum
import uuid
from datetime import date, time

from sqlalchemy import Date, Enum as SAEnum, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class RecurringEnum(str, enum.Enum):
    none = "none"
    weekly = "weekly"
    weekdays = "weekdays"


class DoctorUnavailability(Base):
    __tablename__ = "doctor_unavailability"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    recurring: Mapped[RecurringEnum] = mapped_column(
        SAEnum(RecurringEnum), default=RecurringEnum.none
    )
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)

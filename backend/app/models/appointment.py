import enum
import uuid
from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, Enum as SAEnum, ForeignKey, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class StatusEnum(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patients.id"), nullable=False)
    service_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("services.id"), nullable=True)
    service_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    requested_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[StatusEnum] = mapped_column(SAEnum(StatusEnum), default=StatusEnum.pending)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    suggested_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    time_slot_start: Mapped[time | None] = mapped_column(Time, nullable=True)
    time_slot_end: Mapped[time | None] = mapped_column(Time, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, onupdate=datetime.now
    )

    patient = relationship("Patient", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
    prescriptions = relationship("Prescription", back_populates="appointment")
    documents = relationship("AppointmentDocument", back_populates="appointment")

import uuid

from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_minutes: Mapped[int] = mapped_column(
        Integer, nullable=False, default=30
    )
    default_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    preparation_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    requires_followup: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    appointments = relationship("Appointment", back_populates="service")

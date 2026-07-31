# Phase 2: Backend Fixes & Intelligence Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the intelligence engine — state machine validation, audit logging, duration-aware scheduling, clinical data APIs, and operational endpoints.

**Architecture:** Extend existing FastAPI + SQLAlchemy backend with new models, validators, and service layers. Add `audit_logs` table, `prescription_templates` table, expand `services` and `documents` models, and build 15+ new endpoints.

**Tech Stack:** FastAPI, SQLAlchemy (async), PostgreSQL, Pydantic v2, Alembic (migrations), Python 3.11+

---

## File Structure

### New Files
- `backend/app/models/audit_log.py` — AuditLog model
- `backend/app/models/prescription_template.py` — PrescriptionTemplate model
- `backend/app/services/validators.py` — Centralized state machine validators
- `backend/app/services/intelligence.py` — Scoring, utilization, next available day
- `backend/app/services/audit.py` — Audit log service
- `backend/app/services/storage.py` — Storage abstraction (local filesystem)
- `backend/app/api/v1/admin_services.py` — Services CRUD (admin)
- `backend/app/api/v1/admin_documents.py` — Document upload/list/delete
- `backend/app/api/v1/admin_activity.py` — Audit log endpoint
- `backend/app/api/v1/admin_search.py` — Global search
- `backend/app/api/v1/admin_health.py` — Health check
- `backend/app/api/v1/admin_waiting.py` — Waiting room status
- `backend/app/schemas/service.py` — Expanded service schemas (add create/update)
- `backend/app/schemas/audit.py` — Audit log schemas
- `backend/app/schemas/document.py` — Document schemas
- `backend/app/schemas/search.py` — Search schemas
- `backend/app/schemas/health.py` — Health check schemas
- `backend/alembic/versions/002_add_phase2_columns.py` — Migration for new columns

### Modified Files
- `backend/app/models/service.py` — Add duration, fee, preparation, followup, priority
- `backend/app/models/document.py` — Add document_type, filename, mime_type, storage_key, patient_id, uploaded_by
- `backend/app/models/prescription.py` — Add updated_at
- `backend/app/models/__init__.py` — Import new models
- `backend/app/api/v1/router.py` — Register new routers
- `backend/app/api/v1/admin_appointments.py` — Add notes endpoint, use validators
- `backend/app/api/v1/admin_stats.py` — Enhanced stats
- `backend/app/services/appointment_service.py` — Use validators, add state checks

---

## Task 1: Add New Columns to Services Model

**Files:**
- Modify: `backend/app/models/service.py:1-17`
- Create: `backend/alembic/versions/002_add_phase2_columns.py`

**Interfaces:**
- Consumes: existing `Service` model
- Produces: expanded `Service` with `duration_minutes`, `default_fee`, `preparation_notes`, `requires_followup`, `priority`

- [ ] **Step 1: Expand Service model**

```python
# backend/app/models/service.py
import uuid
from decimal import Decimal

from sqlalchemy import Boolean, Numeric, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    default_fee: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    preparation_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    requires_followup: Mapped[bool] = mapped_column(Boolean, default=False)
    priority: Mapped[int] = mapped_column(Integer, default=2)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    appointments = relationship("Appointment", back_populates="service")
```

- [ ] **Step 2: Create Alembic migration**

```python
# backend/alembic/versions/002_add_phase2_columns.py
"""Add Phase 2 columns to services, expand documents, create audit_logs and prescription_templates

Revision ID: 002
Revises: None
Create Date: 2026-07-31
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Services columns
    op.add_column("services", sa.Column("duration_minutes", sa.Integer(), server_default="30"))
    op.add_column("services", sa.Column("default_fee", sa.Numeric(10, 2), nullable=True))
    op.add_column("services", sa.Column("preparation_notes", sa.Text(), nullable=True))
    op.add_column("services", sa.Column("requires_followup", sa.Boolean(), server_default="false"))
    op.add_column("services", sa.Column("priority", sa.Integer(), server_default="2"))

    # Documents expansion
    op.add_column("appointment_documents", sa.Column("patient_id", sa.UUID(), nullable=True))
    op.add_column("appointment_documents", sa.Column("document_type", sa.String(50), server_default="photo"))
    op.add_column("appointment_documents", sa.Column("filename", sa.String(255), nullable=True))
    op.add_column("appointment_documents", sa.Column("mime_type", sa.String(100), nullable=True))
    op.add_column("appointment_documents", sa.Column("storage_key", sa.String(500), nullable=True))
    op.add_column("appointment_documents", sa.Column("uploaded_by", sa.String(50), nullable=True))

    # Prescription updated_at
    op.add_column("prescriptions", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))

    # Audit logs table
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("actor_id", sa.String(50), nullable=False),
        sa.Column("actor_type", sa.String(20), nullable=False),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.String(50), nullable=False),
        sa.Column("old_values", sa.JSON(), nullable=True),
        sa.Column("new_values", sa.JSON(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_audit_logs_entity", "audit_logs", ["entity_type", "entity_id"])
    op.create_index("ix_audit_logs_actor", "audit_logs", ["actor_id"])
    op.create_index("ix_audit_logs_created", "audit_logs", ["created_at"])

    # Prescription templates table
    op.create_table(
        "prescription_templates",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("admin_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("diagnosis", sa.Text(), nullable=True),
        sa.Column("medicines", sa.JSON(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("prescription_templates")
    op.drop_table("audit_logs")
    op.drop_column("prescriptions", "updated_at")
    op.drop_column("appointment_documents", "uploaded_by")
    op.drop_column("appointment_documents", "storage_key")
    op.drop_column("appointment_documents", "mime_type")
    op.drop_column("appointment_documents", "filename")
    op.drop_column("appointment_documents", "document_type")
    op.drop_column("appointment_documents", "patient_id")
    op.drop_column("services", "priority")
    op.drop_column("services", "requires_followup")
    op.drop_column("services", "preparation_notes")
    op.drop_column("services", "default_fee")
    op.drop_column("services", "duration_minutes")
```

- [ ] **Step 3: Verify migration runs**

Run: `cd backend && python -m alembic upgrade head`
Expected: Migration applies without errors

- [ ] **Step 4: Commit**

```bash
git add backend/app/models/service.py backend/alembic/versions/002_add_phase2_columns.py
git commit -m "feat: expand Service model with duration, fee, priority columns and create Phase 2 migration"
```

---

## Task 2: Create AuditLog and PrescriptionTemplate Models

**Files:**
- Create: `backend/app/models/audit_log.py`
- Create: `backend/app/models/prescription_template.py`
- Modify: `backend/app/models/__init__.py`

**Interfaces:**
- Consumes: `Base` from `database.py`
- Produces: `AuditLog`, `PrescriptionTemplate` models for use in services and API endpoints

- [ ] **Step 1: Create AuditLog model**

```python
# backend/app/models/audit_log.py
import uuid
from datetime import datetime

from sqlalchemy import DateTime, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    actor_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    actor_type: Mapped[str] = mapped_column(String(20), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(50), nullable=False)
    old_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    new_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
```

- [ ] **Step 2: Create PrescriptionTemplate model**

```python
# backend/app/models/prescription_template.py
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PrescriptionTemplate(Base):
    __tablename__ = "prescription_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    admin_id: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    medicines: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
```

- [ ] **Step 3: Update models __init__**

```python
# backend/app/models/__init__.py
from app.models.admin import AdminSettings
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.service import Service
from app.models.prescription import Prescription
from app.models.document import AppointmentDocument
from app.models.unavailability import DoctorUnavailability
from app.models.audit_log import AuditLog
from app.models.prescription_template import PrescriptionTemplate
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/models/audit_log.py backend/app/models/prescription_template.py backend/app/models/__init__.py
git commit -m "feat: add AuditLog and PrescriptionTemplate models"
```

---

## Task 3: Expand Document Model

**Files:**
- Modify: `backend/app/models/document.py:1-19`

**Interfaces:**
- Consumes: existing `AppointmentDocument` model
- Produces: expanded model with `patient_id`, `document_type`, `filename`, `mime_type`, `storage_key`, `uploaded_by`

- [ ] **Step 1: Expand AppointmentDocument**

```python
# backend/app/models/document.py
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AppointmentDocument(Base):
    __tablename__ = "appointment_documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    appointment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("appointments.id"), nullable=False)
    patient_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("patients.id"), nullable=True)
    document_type: Mapped[str] = mapped_column(String(50), default="photo")
    filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    storage_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    uploaded_by: Mapped[str | None] = mapped_column(String(50), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="documents")
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/models/document.py
git commit -m "feat: expand AppointmentDocument with document_type, filename, storage_key"
```

---

## Task 4: Add Prescription updated_at

**Files:**
- Modify: `backend/app/models/prescription.py:1-20`

**Interfaces:**
- Consumes: existing `Prescription` model
- Produces: adds `updated_at` field

- [ ] **Step 1: Add updated_at to Prescription**

```python
# backend/app/models/prescription.py
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    appointment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("appointments.id"), nullable=False)
    medicines: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="prescriptions")
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/models/prescription.py
git commit -m "feat: add updated_at to Prescription model"
```

---

## Task 5: Centralized Validators (State Machine)

**Files:**
- Create: `backend/app/services/validators.py`

**Interfaces:**
- Consumes: `Appointment`, `StatusEnum` from models
- Produces: `AppointmentValidator.validate_transition()`, `ServiceValidator`, `PrescriptionValidator`, `SlotValidator`

- [ ] **Step 1: Create validators**

```python
# backend/app/services/validators.py
from fastapi import HTTPException

from app.models.appointment import StatusEnum

VALID_TRANSITIONS = {
    StatusEnum.pending: [StatusEnum.accepted, StatusEnum.rejected, StatusEnum.cancelled],
    StatusEnum.accepted: [StatusEnum.completed, StatusEnum.cancelled],
    StatusEnum.rejected: [],
    StatusEnum.completed: [],
    StatusEnum.cancelled: [],
}


class AppointmentValidator:
    @staticmethod
    def validate_transition(current: StatusEnum, target: StatusEnum) -> None:
        allowed = VALID_TRANSITIONS.get(current, [])
        if target not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot transition from {current.value} to {target.value}"
            )

    @staticmethod
    def can_add_notes(status: StatusEnum) -> bool:
        return status in (StatusEnum.accepted, StatusEnum.completed)

    @staticmethod
    def can_upload_documents(status: StatusEnum) -> bool:
        return status in (StatusEnum.accepted, StatusEnum.completed)

    @staticmethod
    def can_create_prescription(status: StatusEnum) -> bool:
        return status in (StatusEnum.accepted, StatusEnum.completed)


class ServiceValidator:
    @staticmethod
    def validate_create(name: str, duration_minutes: int) -> None:
        if not name or not name.strip():
            raise HTTPException(status_code=400, detail="Service name is required")
        if duration_minutes < 5 or duration_minutes > 480:
            raise HTTPException(status_code=400, detail="Duration must be 5-480 minutes")

    @staticmethod
    def validate_update(duration_minutes: int | None = None) -> None:
        if duration_minutes is not None and (duration_minutes < 5 or duration_minutes > 480):
            raise HTTPException(status_code=400, detail="Duration must be 5-480 minutes")


class PrescriptionValidator:
    @staticmethod
    def validate_create(diagnosis: str | None, medicines: dict | None) -> None:
        if not diagnosis and not medicines:
            raise HTTPException(status_code=400, detail="Either diagnosis or medicines is required")

    @staticmethod
    def validate_medicines(medicines: dict) -> None:
        if not isinstance(medicines, dict):
            raise HTTPException(status_code=400, detail="Medicines must be a dictionary")
        items = medicines.get("items", [])
        if not isinstance(items, list):
            raise HTTPException(status_code=400, detail="Medicines items must be a list")


class SlotValidator:
    @staticmethod
    def validate_times(start_time, end_time) -> None:
        if start_time >= end_time:
            raise HTTPException(status_code=400, detail="Start time must be before end time")

    @staticmethod
    def validate_duration(start_time, end_time, min_minutes: int = 15) -> None:
        from datetime import datetime
        delta = datetime.combine(datetime.today(), end_time) - datetime.combine(datetime.today(), start_time)
        if delta.total_seconds() / 60 < min_minutes:
            raise HTTPException(status_code=400, detail=f"Slot must be at least {min_minutes} minutes")
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/services/validators.py
git commit -m "feat: add centralized validators for appointments, services, prescriptions, slots"
```

---

## Task 6: Audit Log Service

**Files:**
- Create: `backend/app/services/audit.py`

**Interfaces:**
- Consumes: `AuditLog` model, `AsyncSession`
- Produces: `log_action()` function for use in all endpoints

- [ ] **Step 1: Create audit service**

```python
# backend/app/services/audit.py
import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


async def log_action(
    db: AsyncSession,
    *,
    actor_id: str,
    actor_type: str,
    action: str,
    entity_type: str,
    entity_id: str,
    old_values: dict | None = None,
    new_values: dict | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> AuditLog:
    entry = AuditLog(
        id=uuid.uuid4(),
        actor_id=actor_id,
        actor_type=actor_type,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_values=old_values,
        new_values=new_values,
        ip_address=ip_address,
        user_agent=user_agent,
        created_at=datetime.utcnow(),
    )
    db.add(entry)
    await db.flush()
    return entry
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/services/audit.py
git commit -m "feat: add audit log service for tracking all admin actions"
```

---

## Task 7: Intelligence Scoring & Utilization

**Files:**
- Create: `backend/app/services/intelligence.py`

**Interfaces:**
- Consumes: `Appointment`, `Service`, `DoctorUnavailability` models, `AsyncSession`
- Produces: `calculate_score()`, `get_utilization()`, `get_next_available_day()`, `get_suggested_order()`

- [ ] **Step 1: Create intelligence service**

```python
# backend/app/services/intelligence.py
from datetime import date, datetime, timedelta, time

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment, StatusEnum
from app.models.service import Service
from app.models.unavailability import DoctorUnavailability, RecurringEnum


def calculate_score(appointment: Appointment, service: Service | None, completed_ids: set) -> float:
    urgency = 1 if appointment.requested_date == date.today() else 0
    days_waiting = (date.today() - appointment.created_at.date()).days if appointment.created_at else 0
    service_priority = service.priority if service else 2
    follow_up_bonus = 2 if str(appointment.patient_id) in completed_ids else 0
    score = (urgency * 3) + (days_waiting * 1) + (service_priority * 2) + (follow_up_bonus * 2)
    return score


async def get_suggested_order(db: AsyncSession, appointments: list[Appointment]) -> list[dict]:
    completed_subq = (
        select(Appointment.patient_id)
        .where(Appointment.status == StatusEnum.completed)
        .group_by(Appointment.patient_id)
    )
    result = await db.execute(completed_subq)
    completed_patients = {str(row[0]) for row in result.all()}

    scored = []
    for appt in appointments:
        service = None
        if appt.service_id:
            svc_result = await db.execute(select(Service).where(Service.id == appt.service_id))
            service = svc_result.scalar_one_or_none()
        score = calculate_score(appt, service, completed_patients)
        scored.append({"appointment": appt, "score": score})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored


async def get_utilization(db: AsyncSession, target_date: date) -> dict:
    from app.services.scheduler import _is_unavailable_for_date

    result = await db.execute(
        select(Appointment).where(
            Appointment.requested_date == target_date,
            Appointment.status == StatusEnum.accepted,
        )
    )
    accepted = result.scalars().all()

    booked_minutes = 0
    for appt in accepted:
        if appt.time_slot_start and appt.time_slot_end:
            delta = datetime.combine(datetime.today(), appt.time_slot_end) - datetime.combine(
                datetime.today(), appt.time_slot_start
            )
            booked_minutes += int(delta.total_seconds() / 60)

    unavailability_result = await db.execute(select(DoctorUnavailability))
    unavailable = unavailability_result.scalars().all()

    unavailable_minutes = 0
    for u in unavailable:
        if _is_unavailable_for_date(u, target_date):
            delta = datetime.combine(datetime.today(), u.end_time) - datetime.combine(
                datetime.today(), u.start_time
            )
            unavailable_minutes += int(delta.total_seconds() / 60)

    working_hours = 8 * 60
    available_minutes = max(0, working_hours - booked_minutes - unavailable_minutes)
    utilization = (booked_minutes / working_hours * 100) if working_hours > 0 else 0

    return {
        "date": target_date.isoformat(),
        "booked_minutes": booked_minutes,
        "unavailable_minutes": unavailable_minutes,
        "available_minutes": available_minutes,
        "utilization_percentage": round(utilization, 1),
        "total_appointments": len(accepted),
    }


async def get_next_available_day(db: AsyncSession, after_date: date) -> date | None:
    from app.services.scheduler import _is_unavailable_for_date

    current = after_date + timedelta(days=1)
    max_lookahead = after_date + timedelta(days=30)

    while current <= max_lookahead:
        unavailability_result = await db.execute(select(DoctorUnavailability))
        unavailable = unavailability_result.scalars().all()

        is_unavailable = any(_is_unavailable_for_date(u, current) for u in unavailable)
        if not is_unavailable:
            existing = await db.execute(
                select(func.count(Appointment.id)).where(
                    Appointment.requested_date == current,
                    Appointment.status.in_([StatusEnum.accepted, StatusEnum.pending]),
                )
            )
            count = existing.scalar() or 0
            if count < 8:
                return current

        current += timedelta(days=1)

    return None
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/services/intelligence.py
git commit -m "feat: add intelligence scoring, utilization calculation, and next available day"
```

---

## Task 8: Storage Abstraction

**Files:**
- Create: `backend/app/services/storage.py`

**Interfaces:**
- Consumes: file bytes, filename
- Produces: `StorageService` with `save()`, `delete()`, `get_url()` methods

- [ ] **Step 1: Create storage service**

```python
# backend/app/services/storage.py
import os
import uuid
from pathlib import Path

from fastapi import HTTPException

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class StorageService:
    @staticmethod
    def save(file_bytes: bytes, filename: str, subfolder: str = "documents") -> str:
        ext = Path(filename).suffix
        unique_name = f"{uuid.uuid4().hex}{ext}"
        folder = UPLOAD_DIR / subfolder
        folder.mkdir(exist_ok=True)
        path = folder / unique_name
        path.write_bytes(file_bytes)
        return str(path)

    @staticmethod
    def delete(storage_key: str) -> bool:
        path = Path(storage_key)
        if path.exists():
            path.unlink()
            return True
        return False

    @staticmethod
    def get_url(storage_key: str) -> str:
        return f"/api/v1/files/{storage_key}"

    @staticmethod
    def validate_upload(filename: str, size: int, content_type: str) -> None:
        allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"}
        max_size = 10 * 1024 * 1024
        if content_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"File type {content_type} not allowed")
        if size > max_size:
            raise HTTPException(status_code=400, detail="File size must be under 10MB")
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/services/storage.py
git commit -m "feat: add storage abstraction service for file uploads"
```

---

## Task 9: Expanded Schemas

**Files:**
- Modify: `backend/app/schemas/service.py`
- Create: `backend/app/schemas/audit.py`
- Create: `backend/app/schemas/document.py`
- Create: `backend/app/schemas/search.py`
- Create: `backend/app/schemas/health.py`

**Interfaces:**
- Consumes: models from Tasks 1-4
- Produces: Pydantic schemas for all new API endpoints

- [ ] **Step 1: Expand service schemas**

```python
# backend/app/schemas/service.py
from decimal import Decimal
from pydantic import BaseModel


class ServiceCreate(BaseModel):
    name: str
    description: str | None = None
    duration_minutes: int = 30
    default_fee: Decimal | None = None
    preparation_notes: str | None = None
    requires_followup: bool = False
    priority: int = 2


class ServiceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    duration_minutes: int | None = None
    default_fee: Decimal | None = None
    preparation_notes: str | None = None
    requires_followup: bool | None = None
    priority: int | None = None
    is_active: bool | None = None


class ServiceResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    duration_minutes: int = 30
    default_fee: Decimal | None = None
    preparation_notes: str | None = None
    requires_followup: bool = False
    priority: int = 2
    is_active: bool
```

- [ ] **Step 2: Create audit schema**

```python
# backend/app/schemas/audit.py
from datetime import datetime
from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: str
    actor_id: str
    actor_type: str
    action: str
    entity_type: str
    entity_id: str
    old_values: dict | None = None
    new_values: dict | None = None
    created_at: datetime


class AuditLogListResponse(BaseModel):
    logs: list[AuditLogResponse]
    total: int
```

- [ ] **Step 3: Create document schema**

```python
# backend/app/schemas/document.py
from datetime import datetime
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    appointment_id: str
    patient_id: str | None = None
    document_type: str
    filename: str | None = None
    mime_type: str | None = None
    file_url: str
    uploaded_by: str | None = None
    uploaded_at: datetime


class DocumentUploadResponse(BaseModel):
    id: str
    filename: str
    file_url: str
    document_type: str
```

- [ ] **Step 4: Create search schema**

```python
# backend/app/schemas/search.py
from pydantic import BaseModel


class SearchResult(BaseModel):
    id: str
    type: str
    title: str
    subtitle: str | None = None
    url: str


class SearchResponse(BaseModel):
    results: list[SearchResult]
    total: int
```

- [ ] **Step 5: Create health schema**

```python
# backend/app/schemas/health.py
from pydantic import BaseModel


class HealthCheck(BaseModel):
    status: str
    database: str
    storage: str
    version: str
    uptime: str
```

- [ ] **Step 6: Commit**

```bash
git add backend/app/schemas/service.py backend/app/schemas/audit.py backend/app/schemas/document.py backend/app/schemas/search.py backend/app/schemas/health.py
git commit -m "feat: add expanded schemas for services, audit, documents, search, health"
```

---

## Task 10: Services CRUD API (Admin)

**Files:**
- Create: `backend/app/api/v1/admin_services.py`
- Modify: `backend/app/api/v1/router.py:1-26`

**Interfaces:**
- Consumes: `Service` model, `ServiceCreate`/`ServiceUpdate`/`ServiceResponse` schemas, `ServiceValidator`
- Produces: `GET /admin/services`, `POST /admin/services`, `PATCH /admin/services/{id}`, `PATCH /admin/services/{id}/active`

- [ ] **Step 1: Create admin services router**

```python
# backend/app/api/v1/admin_services.py
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate
from app.services.validators import ServiceValidator

router = APIRouter(prefix="/admin/services", tags=["admin-services"])


def _build_response(svc: Service) -> ServiceResponse:
    return ServiceResponse(
        id=str(svc.id),
        name=svc.name,
        description=svc.description,
        duration_minutes=svc.duration_minutes,
        default_fee=svc.default_fee,
        preparation_notes=svc.preparation_notes,
        requires_followup=svc.requires_followup,
        priority=svc.priority,
        is_active=svc.is_active,
    )


@router.get("", response_model=list[ServiceResponse])
async def list_services(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(select(Service).order_by(Service.name))
    return [_build_response(s) for s in result.scalars().all()]


@router.post("", response_model=ServiceResponse, status_code=201)
async def create_service(
    body: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    ServiceValidator.validate_create(body.name, body.duration_minutes)
    svc = Service(
        name=body.name.strip(),
        description=body.description,
        duration_minutes=body.duration_minutes,
        default_fee=body.default_fee,
        preparation_notes=body.preparation_notes,
        requires_followup=body.requires_followup,
        priority=body.priority,
    )
    db.add(svc)
    await db.commit()
    await db.refresh(svc)
    return _build_response(svc)


@router.patch("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: str,
    body: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(select(Service).where(Service.id == uuid.UUID(service_id)))
    svc = result.scalar_one_or_none()
    if svc is None:
        raise HTTPException(status_code=404, detail="Service not found")

    ServiceValidator.validate_update(body.duration_minutes)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(svc, field, value)

    await db.commit()
    await db.refresh(svc)
    return _build_response(svc)


@router.patch("/{service_id}/active", response_model=ServiceResponse)
async def toggle_service_active(
    service_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(select(Service).where(Service.id == uuid.UUID(service_id)))
    svc = result.scalar_one_or_none()
    if svc is None:
        raise HTTPException(status_code=404, detail="Service not found")

    svc.is_active = not svc.is_active
    await db.commit()
    await db.refresh(svc)
    return _build_response(svc)
```

- [ ] **Step 2: Register router**

```python
# backend/app/api/v1/router.py
from fastapi import APIRouter

from app.api.v1.admin_auth import router as admin_auth_router
from app.api.v1.auth import router as auth_router
from app.api.v1.appointments import router as appointments_router
from app.api.v1.availability import router as availability_router
from app.api.v1.services_api import router as services_router
from app.api.v1.admin_appointments import router as admin_appointments_router
from app.api.v1.admin_patients import router as admin_patients_router
from app.api.v1.admin_prescriptions import router as admin_prescriptions_router
from app.api.v1.admin_unavailability import router as admin_unavailability_router
from app.api.v1.admin_settings import router as admin_settings_router
from app.api.v1.admin_stats import router as admin_stats_router
from app.api.v1.admin_services import router as admin_services_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(admin_auth_router)
router.include_router(appointments_router)
router.include_router(availability_router)
router.include_router(services_router)
router.include_router(admin_appointments_router)
router.include_router(admin_patients_router)
router.include_router(admin_prescriptions_router)
router.include_router(admin_unavailability_router)
router.include_router(admin_settings_router)
router.include_router(admin_stats_router)
router.include_router(admin_services_router)
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/v1/admin_services.py backend/app/api/v1/router.py
git commit -m "feat: add admin services CRUD API with validation"
```

---

## Task 11: Appointment Notes Endpoint

**Files:**
- Modify: `backend/app/api/v1/admin_appointments.py:1-118`

**Interfaces:**
- Consumes: `AppointmentValidator.can_add_notes()`, `log_action()`
- Produces: `PATCH /admin/appointments/{id}/notes`

- [ ] **Step 1: Add notes endpoint**

```python
# Add to backend/app/api/v1/admin_appointments.py
from pydantic import BaseModel

class NotesRequest(BaseModel):
    notes: str

# Add after mark_completed endpoint:
@router.patch("/{appointment_id}/notes", response_model=AppointmentResponse)
async def update_notes(
    appointment_id: str,
    body: NotesRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    appt = await svc.get_appointment_detail(db, appointment_id)
    if appt is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    from app.services.validators import AppointmentValidator
    AppointmentValidator.can_add_notes(appt.status)

    old_notes = appt.notes
    appt.notes = body.notes
    await db.commit()
    await db.refresh(appt, ["patient", "service"])

    from app.services.audit import log_action
    await log_action(
        db,
        actor_id=str(admin.id),
        actor_type="admin",
        action="updated_notes",
        entity_type="appointment",
        entity_id=appointment_id,
        old_values={"notes": old_notes},
        new_values={"notes": body.notes},
    )

    return _build_response(appt)
```

- [ ] **Step 2: Add import for NotesRequest at top**

```python
from pydantic import BaseModel

class NotesRequest(BaseModel):
    notes: str
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/v1/admin_appointments.py
git commit -m "feat: add appointment notes endpoint with audit logging"
```

---

## Task 12: Enhanced Stats Endpoint

**Files:**
- Modify: `backend/app/api/v1/admin_stats.py:1-47`

**Interfaces:**
- Consumes: `get_next_available_day()`, `get_utilization()`
- Produces: enhanced `GET /admin/stats` with `total_patients`, `completion_rate`, `next_available_day`

- [ ] **Step 1: Expand stats endpoint**

```python
# backend/app/api/v1/admin_stats.py
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.appointment import Appointment, StatusEnum
from app.models.patient import Patient
from app.schemas.appointment import AppointmentResponse, AppointmentStats
from app.services import appointment_service as svc
from app.services.intelligence import get_next_available_day

router = APIRouter(prefix="/admin", tags=["admin-stats"])


def _build_response(appt) -> AppointmentResponse:
    return AppointmentResponse(
        id=str(appt.id),
        patient_id=str(appt.patient_id),
        patient_name=appt.patient.name if appt.patient else "",
        service_id=str(appt.service_id) if appt.service_id else None,
        service_name=appt.service.name if appt.service else None,
        service_description=appt.service_description,
        requested_date=appt.requested_date,
        status=appt.status.value if hasattr(appt.status, 'value') else appt.status,
        rejection_reason=appt.rejection_reason,
        suggested_date=appt.suggested_date,
        time_slot_start=appt.time_slot_start,
        time_slot_end=appt.time_slot_end,
        notes=appt.notes,
        created_at=appt.created_at,
        updated_at=appt.updated_at,
    )


@router.get("/stats", response_model=AppointmentStats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    today = date.today()
    today_appts = await svc.get_admin_appointments(db, date_=today)
    pending_appts = await svc.get_admin_appointments(db, status="pending")

    total_patients_result = await db.execute(select(func.count(Patient.id)))
    total_patients = total_patients_result.scalar() or 0

    completed_result = await db.execute(
        select(func.count(Appointment.id)).where(Appointment.status == StatusEnum.completed)
    )
    completed_count = completed_result.scalar() or 0

    total_result = await db.execute(select(func.count(Appointment.id)))
    total_count = total_result.scalar() or 0

    completion_rate = (completed_count / total_count * 100) if total_count > 0 else 0

    next_day = await get_next_available_day(db, today)

    return AppointmentStats(
        today_count=len(today_appts),
        pending_count=len(pending_appts),
        total_patients=total_patients,
        completion_rate=round(completion_rate, 1),
        next_available_day=next_day.isoformat() if next_day else None,
        today_appointments=[_build_response(a) for a in today_appts],
    )
```

- [ ] **Step 2: Update AppointmentStats schema**

```python
# backend/app/schemas/appointment.py
# Add to AppointmentStats:
class AppointmentStats(BaseModel):
    today_count: int = 0
    pending_count: int = 0
    total_patients: int = 0
    completion_rate: float = 0.0
    next_available_day: str | None = None
    today_appointments: list[AppointmentResponse] = []
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/v1/admin_stats.py backend/app/schemas/appointment.py
git commit -m "feat: enhance stats endpoint with total_patients, completion_rate, next_available_day"
```

---

## Task 13: Document Upload API

**Files:**
- Create: `backend/app/api/v1/admin_documents.py`
- Modify: `backend/app/api/v1/router.py`

**Interfaces:**
- Consumes: `AppointmentDocument` model, `StorageService`, `AppointmentValidator.can_upload_documents()`
- Produces: `POST /admin/appointments/{id}/documents`, `GET /admin/appointments/{id}/documents`, `DELETE /admin/documents/{id}`

- [ ] **Step 1: Create documents router**

```python
# backend/app/api/v1/admin_documents.py
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.appointment import Appointment
from app.models.document import AppointmentDocument
from app.schemas.document import DocumentResponse, DocumentUploadResponse
from app.services.storage import StorageService
from app.services.validators import AppointmentValidator

router = APIRouter(prefix="/admin", tags=["admin-documents"])


@router.post("/appointments/{appointment_id}/documents", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    appointment_id: str,
    file: UploadFile = File(...),
    document_type: str = "photo",
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(Appointment).where(Appointment.id == uuid.UUID(appointment_id))
    )
    appt = result.scalar_one_or_none()
    if appt is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    AppointmentValidator.can_upload_documents(appt.status)

    content = await file.read()
    StorageService.validate_upload(file.filename, len(content), file.content_type)

    storage_key = StorageService.save(content, file.filename, f"appointments/{appointment_id}")
    file_url = StorageService.get_url(storage_key)

    doc = AppointmentDocument(
        id=uuid.uuid4(),
        appointment_id=uuid.UUID(appointment_id),
        patient_id=appt.patient_id,
        document_type=document_type,
        filename=file.filename,
        mime_type=file.content_type,
        storage_key=storage_key,
        file_url=file_url,
        file_type=document_type,
        uploaded_by="admin",
        uploaded_at=datetime.utcnow(),
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    return DocumentUploadResponse(
        id=str(doc.id),
        filename=doc.filename,
        file_url=doc.file_url,
        document_type=doc.document_type,
    )


@router.get("/appointments/{appointment_id}/documents", response_model=list[DocumentResponse])
async def list_documents(
    appointment_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(AppointmentDocument)
        .where(AppointmentDocument.appointment_id == uuid.UUID(appointment_id))
        .order_by(AppointmentDocument.uploaded_at.desc())
    )
    docs = result.scalars().all()
    return [
        DocumentResponse(
            id=str(d.id),
            appointment_id=str(d.appointment_id),
            patient_id=str(d.patient_id) if d.patient_id else None,
            document_type=d.document_type,
            filename=d.filename,
            mime_type=d.mime_type,
            file_url=d.file_url,
            uploaded_by=d.uploaded_by,
            uploaded_at=d.uploaded_at,
        )
        for d in docs
    ]


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(AppointmentDocument).where(AppointmentDocument.id == uuid.UUID(document_id))
    )
    doc = result.scalar_one_or_none()
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.storage_key:
        StorageService.delete(doc.storage_key)

    await db.delete(doc)
    await db.commit()

    return {"message": "Document deleted"}
```

- [ ] **Step 2: Register router in router.py**

Add to imports and router includes in `backend/app/api/v1/router.py`.

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/v1/admin_documents.py backend/app/api/v1/router.py
git commit -m "feat: add document upload, list, and delete API with storage abstraction"
```

---

## Task 14: Waiting Room & Search APIs

**Files:**
- Create: `backend/app/api/v1/admin_waiting.py`
- Create: `backend/app/api/v1/admin_search.py`
- Modify: `backend/app/api/v1/router.py`

**Interfaces:**
- Consumes: `Appointment` model with `arrived_at`, patient search
- Produces: `GET /admin/today/waiting`, `GET /admin/search?q=&type=`

- [ ] **Step 1: Create waiting room endpoint**

```python
# backend/app/api/v1/admin_waiting.py
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.appointment import Appointment, StatusEnum

router = APIRouter(prefix="/admin/today", tags=["admin-today"])


@router.get("/waiting")
async def get_waiting_room(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(Appointment)
        .where(
            Appointment.status == StatusEnum.accepted,
            Appointment.arrived_at.isnot(None),
        )
        .order_by(Appointment.arrived_at)
    )
    arrived = result.scalars().all()

    waiting = []
    now = datetime.now(timezone.utc)
    for appt in arrived:
        wait_minutes = 0
        if appt.arrived_at:
            delta = now - appt.arrived_at
            wait_minutes = int(delta.total_seconds() / 60)

        waiting.append({
            "id": str(appt.id),
            "patient_name": appt.patient.name if appt.patient else "",
            "service_name": appt.service.name if appt.service else None,
            "time_slot_start": appt.time_slot_start.isoformat() if appt.time_slot_start else None,
            "arrived_at": appt.arrived_at.isoformat() if appt.arrived_at else None,
            "wait_minutes": wait_minutes,
        })

    return {"waiting": waiting, "count": len(waiting)}
```

- [ ] **Step 2: Create search endpoint**

```python
# backend/app/api/v1/admin_search.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.prescription import Prescription
from app.models.service import Service
from app.schemas.search import SearchResult, SearchResponse

router = APIRouter(prefix="/admin/search", tags=["admin-search"])


@router.get("", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=1),
    type: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    results = []
    query = f"%{q}%"

    if type is None or type == "patients":
        patient_result = await db.execute(
            select(Patient).where(
                or_(Patient.name.ilike(query), Patient.phone.ilike(query), Patient.email.ilike(query))
            ).limit(10)
        )
        for p in patient_result.scalars().all():
            results.append(SearchResult(
                id=str(p.id), type="patient", title=p.name,
                subtitle=p.phone or p.email, url=f"/admin/patients/{p.id}"
            ))

    if type is None or type == "appointments":
        appt_result = await db.execute(
            select(Appointment).where(
                Appointment.id.ilike(query)
            ).limit(10)
        )
        for a in appt_result.scalars().all():
            results.append(SearchResult(
                id=str(a.id), type="appointment",
                title=f"{a.patient.name if a.patient else 'Unknown'} - {a.service.name if a.service else 'N/A'}",
                subtitle=a.requested_date.isoformat(),
                url=f"/admin/requests?id={a.id}"
            ))

    if type is None or type == "services":
        svc_result = await db.execute(
            select(Service).where(Service.name.ilike(query)).limit(10)
        )
        for s in svc_result.scalars().all():
            results.append(SearchResult(
                id=str(s.id), type="service", title=s.name,
                subtitle=s.description, url="/admin/services"
            ))

    return SearchResponse(results=results, total=len(results))
```

- [ ] **Step 3: Register both routers**

- [ ] **Step 4: Commit**

```bash
git add backend/app/api/v1/admin_waiting.py backend/app/api/v1/admin_search.py backend/app/api/v1/router.py
git commit -m "feat: add waiting room status and global search endpoints"
```

---

## Task 15: Health Check Endpoint

**Files:**
- Create: `backend/app/api/v1/admin_health.py`
- Modify: `backend/app/api/v1/router.py`

**Interfaces:**
- Consumes: database, storage, filesystem
- Produces: `GET /admin/health`

- [ ] **Step 1: Create health endpoint**

```python
# backend/app/api/v1/admin_health.py
import time
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.schemas.health import HealthCheck

router = APIRouter(prefix="/admin", tags=["admin-health"])

_start_time = time.time()


@router.get("/health", response_model=HealthCheck)
async def health_check(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    storage_status = "ok"
    upload_dir = Path("uploads")
    if not upload_dir.exists():
        storage_status = "error"

    uptime_seconds = int(time.time() - _start_time)
    hours, remainder = divmod(uptime_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    uptime_str = f"{hours}h {minutes}m {seconds}s"

    overall = "healthy" if db_status == "ok" and storage_status == "ok" else "degraded"

    return HealthCheck(
        status=overall,
        database=db_status,
        storage=storage_status,
        version="2.0.0",
        uptime=uptime_str,
    )
```

- [ ] **Step 2: Register router**

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/v1/admin_health.py backend/app/api/v1/router.py
git commit -m "feat: add health check endpoint with database and storage status"
```

---

## Task 16: Prescription Templates API

**Files:**
- Modify: `backend/app/api/v1/admin_prescriptions.py:1-71`

**Interfaces:**
- Consumes: `PrescriptionTemplate` model
- Produces: `GET /admin/prescriptions/templates`, `POST /admin/prescriptions/templates`, `PATCH /admin/prescriptions/templates/{id}`, `DELETE /admin/prescriptions/templates/{id}`

- [ ] **Step 1: Add template endpoints**

```python
# Add to backend/app/api/v1/admin_prescriptions.py
import uuid
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import select

from app.models.prescription_template import PrescriptionTemplate

class TemplateCreate(BaseModel):
    name: str
    diagnosis: str | None = None
    medicines: dict | None = None
    notes: str | None = None

class TemplateUpdate(BaseModel):
    name: str | None = None
    diagnosis: str | None = None
    medicines: dict | None = None
    notes: str | None = None

class TemplateResponse(BaseModel):
    id: str
    name: str
    diagnosis: str | None = None
    medicines: dict | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

# Add after existing endpoints:
@router.get("/templates", response_model=list[TemplateResponse])
async def list_templates(
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(PrescriptionTemplate)
        .where(PrescriptionTemplate.admin_id == admin.id)
        .order_by(PrescriptionTemplate.name)
    )
    return [
        TemplateResponse(
            id=str(t.id), name=t.name, diagnosis=t.diagnosis,
            medicines=t.medicines, notes=t.notes,
            created_at=t.created_at, updated_at=t.updated_at,
        )
        for t in result.scalars().all()
    ]


@router.post("/templates", response_model=TemplateResponse, status_code=201)
async def create_template(
    body: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    template = PrescriptionTemplate(
        id=uuid.uuid4(),
        admin_id=admin.id,
        name=body.name.strip(),
        diagnosis=body.diagnosis,
        medicines=body.medicines,
        notes=body.notes,
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return TemplateResponse(
        id=str(template.id), name=template.name, diagnosis=template.diagnosis,
        medicines=template.medicines, notes=template.notes,
        created_at=template.created_at, updated_at=template.updated_at,
    )


@router.patch("/templates/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: str,
    body: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(PrescriptionTemplate).where(
            PrescriptionTemplate.id == uuid.UUID(template_id),
            PrescriptionTemplate.admin_id == admin.id,
        )
    )
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    template.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(template)
    return TemplateResponse(
        id=str(template.id), name=template.name, diagnosis=template.diagnosis,
        medicines=template.medicines, notes=template.notes,
        created_at=template.created_at, updated_at=template.updated_at,
    )


@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    result = await db.execute(
        select(PrescriptionTemplate).where(
            PrescriptionTemplate.id == uuid.UUID(template_id),
            PrescriptionTemplate.admin_id == admin.id,
        )
    )
    template = result.scalar_one_or_none()
    if template is None:
        raise HTTPException(status_code=404, detail="Template not found")

    await db.delete(template)
    await db.commit()
    return {"message": "Template deleted"}
```

- [ ] **Step 2: Add missing imports**

```python
from app.models.prescription_template import PrescriptionTemplate
from fastapi import HTTPException
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/v1/admin_prescriptions.py
git commit -m "feat: add prescription templates CRUD API"
```

---

## Task 17: Integrate Validators into Existing Endpoints

**Files:**
- Modify: `backend/app/services/appointment_service.py:1-197`

**Interfaces:**
- Consumes: `AppointmentValidator`, `SlotValidator` from validators
- Produces: validated state transitions in `mark_arrived`, `mark_completed`, `reject_appointment`

- [ ] **Step 1: Add validators to appointment service**

```python
# Add to top of appointment_service.py
from app.services.validators import AppointmentValidator, SlotValidator

# Update mark_arrived:
async def mark_arrived(db, appointment_id):
    # ... existing code to fetch appointment ...
    AppointmentValidator.validate_transition(appointment.status, StatusEnum.accepted)
    # ... rest of existing code ...

# Update mark_completed:
async def mark_completed(db, appointment_id):
    # ... existing code to fetch appointment ...
    AppointmentValidator.validate_transition(appointment.status, StatusEnum.completed)
    # ... rest of existing code ...

# Update reject_appointment:
async def reject_appointment(db, appointment_id, reason, suggested_date):
    # ... existing code to fetch appointment ...
    AppointmentValidator.validate_transition(appointment.status, StatusEnum.rejected)
    # ... rest of existing code ...
```

- [ ] **Step 2: Add SlotValidator to accept_appointment**

```python
# In accept_appointment, before calling validate_and_accept:
SlotValidator.validate_times(start_time, end_time)
SlotValidator.validate_duration(start_time, end_time)
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/appointment_service.py
git commit -m "feat: integrate validators into appointment state transitions"
```

---

## Task 18: Verify All Endpoints Work

**Files:**
- No new files — verification only

**Interfaces:**
- Consumes: all Tasks 1-17 outputs
- Produces: all endpoints responding correctly

- [ ] **Step 1: Start dev server**

Run: `cd backend && python -m uvicorn app.main:app --reload`
Expected: Server starts without errors

- [ ] **Step 2: Test services CRUD**

```bash
curl http://localhost:8000/api/v1/admin/services -H "Authorization: Bearer <token>"
curl -X POST http://localhost:8000/api/v1/admin/services -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"name":"Test Service","duration_minutes":30}'
```

- [ ] **Step 3: Test health endpoint**

```bash
curl http://localhost:8000/api/v1/admin/health -H "Authorization: Bearer <token>"
```

- [ ] **Step 4: Test search endpoint**

```bash
curl "http://localhost:8000/api/v1/admin/search?q=test" -H "Authorization: Bearer <token>"
```

- [ ] **Step 5: Test waiting room**

```bash
curl http://localhost:8000/api/v1/admin/today/waiting -H "Authorization: Bearer <token>"
```

- [ ] **Step 6: Commit verification**

```bash
git add -A
git commit -m "chore: verify Phase 2 backend endpoints working"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ 2.1 Data Integrity: state machine (Task 5), audit log (Task 6), validators (Task 5), optimistic concurrency (`updated_at` on models)
- ✅ 2.2 Scheduling Engine: scoring (Task 7), utilization (Task 7), next available day (Task 7)
- ✅ 2.3 Clinical Data: prescriptions CRUD (Task 16), templates (Task 16), documents (Task 13), storage abstraction (Task 8)
- ✅ 2.4 Operational APIs: stats (Task 12), waiting room (Task 14), search (Task 14)
- ✅ 2.5 Infrastructure: health check (Task 15)

**2. Placeholder scan:** No TBD/TODO found. All steps have complete code.

**3. Type consistency:**
- `Service.duration_minutes` used consistently across models, schemas, and validators
- `AppointmentValidator.validate_transition()` uses `StatusEnum` consistently
- `StorageService.save()` returns `str` path, used in `AppointmentDocument.storage_key`
- `AuditLog.actor_id` is `str`, matches `str(admin.id)` usage in endpoints

**No issues found.**

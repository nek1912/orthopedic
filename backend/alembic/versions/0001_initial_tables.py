"""initial tables

Revision ID: 0001
Revises:
Create Date: 2026-07-30 12:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "admin_settings",
        sa.Column("id", sa.Integer(), autoincrement=False, nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("clinic_name", sa.String(255), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "patients",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("dob", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_patients_email", "patients", ["email"], unique=True)
    op.create_table(
        "services",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "doctor_unavailability",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column(
            "recurring",
            sa.Enum("none", "weekly", "weekdays", name="recurringenum"),
            nullable=False,
        ),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_doctor_unavailability_date", "doctor_unavailability", ["date"], unique=False
    )
    op.create_table(
        "appointments",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("patient_id", sa.Uuid(), nullable=False),
        sa.Column("service_id", sa.Uuid(), nullable=True),
        sa.Column("service_description", sa.Text(), nullable=True),
        sa.Column("requested_date", sa.Date(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "accepted", "rejected", "completed", "cancelled", name="statusenum"),
            nullable=False,
        ),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("suggested_date", sa.Date(), nullable=True),
        sa.Column("time_slot_start", sa.Time(), nullable=True),
        sa.Column("time_slot_end", sa.Time(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("arrived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], name="fk_appointments_patient_id"),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"], name="fk_appointments_service_id"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_appointments_requested_date", "appointments", ["requested_date"], unique=False
    )
    op.create_table(
        "prescriptions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("appointment_id", sa.Uuid(), nullable=False),
        sa.Column("medicines", sa.JSON(), nullable=True),
        sa.Column("diagnosis", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["appointment_id"], ["appointments.id"], name="fk_prescriptions_appointment_id"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "appointment_documents",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("appointment_id", sa.Uuid(), nullable=False),
        sa.Column("file_url", sa.String(500), nullable=False),
        sa.Column("file_type", sa.String(50), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["appointment_id"], ["appointments.id"], name="fk_appointment_documents_appointment_id"
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("appointment_documents")
    op.drop_table("prescriptions")
    op.drop_index("ix_appointments_requested_date", table_name="appointments")
    op.drop_table("appointments")
    op.execute("DROP TYPE IF EXISTS statusenum")
    op.drop_index("ix_doctor_unavailability_date", table_name="doctor_unavailability")
    op.drop_table("doctor_unavailability")
    op.execute("DROP TYPE IF EXISTS recurringenum")
    op.drop_table("services")
    op.drop_index("ix_patients_email", table_name="patients")
    op.drop_table("patients")
    op.drop_table("admin_settings")

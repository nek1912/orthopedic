"""add service duration, fee, and follow-up fields

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-31 09:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "services",
        sa.Column(
            "duration_minutes", sa.Integer(), nullable=False, server_default="30"
        ),
    )
    op.add_column(
        "services",
        sa.Column("default_fee", sa.Float(), nullable=False, server_default="0"),
    )
    op.add_column(
        "services",
        sa.Column(
            "preparation_notes", sa.Text(), nullable=True, server_default="''"
        ),
    )
    op.add_column(
        "services",
        sa.Column(
            "requires_followup", sa.Boolean(), nullable=False, server_default="false"
        ),
    )


def downgrade() -> None:
    op.drop_column("services", "requires_followup")
    op.drop_column("services", "preparation_notes")
    op.drop_column("services", "default_fee")
    op.drop_column("services", "duration_minutes")

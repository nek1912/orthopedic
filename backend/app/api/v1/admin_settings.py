from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.admin import AdminSettings
from app.services.audit import log_activity


class SettingsResponse(BaseModel):
    clinic_name: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str


class SettingsUpdate(BaseModel):
    clinic_name: str | None = None
    address: str | None = None
    phone: str | None = None


router = APIRouter(prefix="/admin/settings", tags=["admin-settings"])


@router.get("", response_model=SettingsResponse)
async def get_settings(
    admin: AdminSettings = Depends(get_current_admin),
):
    return SettingsResponse(
        clinic_name=admin.clinic_name,
        address=admin.address,
        phone=admin.phone,
        email=admin.email,
    )


@router.patch("", response_model=SettingsResponse)
async def update_settings(
    body: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    if body.clinic_name is not None:
        admin.clinic_name = body.clinic_name
    if body.address is not None:
        admin.address = body.address
    if body.phone is not None:
        admin.phone = body.phone
    await db.commit()
    await db.refresh(admin)
    await log_activity(db, "settings.updated", "settings", "settings", None)

    return SettingsResponse(
        clinic_name=admin.clinic_name,
        address=admin.address,
        phone=admin.phone,
        email=admin.email,
    )

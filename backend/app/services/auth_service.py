from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)
from app.models.admin import AdminSettings
from app.models.patient import Patient


async def register_patient(
    db: AsyncSession,
    email: str,
    password: str,
    name: str,
    phone: str | None = None,
    dob: date | None = None,
) -> dict:
    result = await db.execute(select(Patient).where(Patient.email == email))
    if result.scalar_one_or_none():
        raise ValueError("Email already registered")

    patient = Patient(
        email=email,
        password_hash=get_password_hash(password),
        name=name,
        phone=phone,
        dob=dob,
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)

    tokens = create_patient_tokens(str(patient.id))
    return {"patient": patient, **tokens}


async def authenticate_patient(db: AsyncSession, email: str, password: str) -> Patient | None:
    result = await db.execute(select(Patient).where(Patient.email == email))
    patient = result.scalar_one_or_none()
    if patient is None or not verify_password(password, patient.password_hash):
        return None
    return patient


async def authenticate_admin(db: AsyncSession, password: str) -> AdminSettings | None:
    result = await db.execute(select(AdminSettings).where(AdminSettings.id == 1))
    admin = result.scalar_one_or_none()
    if admin is None or not verify_password(password, admin.password_hash):
        return None
    return admin


def create_patient_tokens(patient_id: str) -> dict:
    access_token = create_access_token(
        data={"sub": patient_id, "type": "access"},
        expires_delta=timedelta(hours=24),
    )
    refresh_token = create_refresh_token(data={"sub": patient_id})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


def create_admin_token(admin_id: int, remember_me: bool = False, token_version: int = 0) -> dict:
    if remember_me:
        expires_delta = timedelta(days=settings.ADMIN_ACCESS_TOKEN_EXPIRE_DAYS)
    else:
        expires_delta = timedelta(days=1)
    access_token = create_access_token(
        data={"sub": str(admin_id), "type": "admin_access", "remember_me": remember_me, "token_version": token_version},
        expires_delta=expires_delta,
    )
    return {"access_token": access_token}

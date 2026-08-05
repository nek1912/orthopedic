from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.rate_limit import limiter
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.patient import Patient
from app.schemas.auth import AuthResponse, LoginRequest, PatientResponse, ProfileUpdate, RefreshRequest, RegisterRequest
from app.services.auth_service import (
    authenticate_patient,
    create_patient_tokens,
    register_patient,
)
from app.core.security import get_current_patient

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
@limiter.limit("3/hour")
async def register(request: Request, register_request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await register_patient(
            db=db,
            email=register_request.email,
            password=register_request.password,
            name=register_request.name,
            phone=register_request.phone,
            dob=register_request.dob,
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    patient = result["patient"]
    return AuthResponse(
        patient=PatientResponse(
            id=str(patient.id),
            name=patient.name,
            email=patient.email,
            phone=patient.phone,
            dob=patient.dob,
            created_at=patient.created_at,
        ),
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        token_type=result["token_type"],
    )


@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
async def login(request: Request, login_request: LoginRequest, db: AsyncSession = Depends(get_db)):
    patient = await authenticate_patient(db, login_request.email, login_request.password)
    if patient is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    tokens = create_patient_tokens(str(patient.id))
    return AuthResponse(
        patient=PatientResponse(
            id=str(patient.id),
            name=patient.name,
            email=patient.email,
            phone=patient.phone,
            dob=patient.dob,
            created_at=patient.created_at,
        ),
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
    )


@router.post("/refresh", response_model=AuthResponse)
async def refresh(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    patient_id = payload.get("sub")
    if patient_id is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if patient is None:
        raise HTTPException(status_code=401, detail="Patient not found")

    tokens = create_patient_tokens(patient_id)
    return AuthResponse(
        patient=PatientResponse(
            id=str(patient.id),
            name=patient.name,
            email=patient.email,
            phone=patient.phone,
            dob=patient.dob,
            created_at=patient.created_at,
        ),
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
    )


@router.patch("/profile", response_model=PatientResponse)
async def update_profile(
    profile: ProfileUpdate,
    current_patient: Patient = Depends(get_current_patient),
    db: AsyncSession = Depends(get_db),
):
    if profile.name is not None:
        current_patient.name = profile.name
    if profile.phone is not None:
        current_patient.phone = profile.phone
    if profile.dob is not None:
        current_patient.dob = profile.dob

    await db.commit()
    await db.refresh(current_patient)

    return PatientResponse(
        id=str(current_patient.id),
        name=current_patient.name,
        email=current_patient.email,
        phone=current_patient.phone,
        dob=current_patient.dob,
        created_at=current_patient.created_at,
    )

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.patient import Patient
from app.schemas.auth import AuthResponse, LoginRequest, PatientResponse, RefreshRequest, RegisterRequest
from app.services.auth_service import (
    authenticate_patient,
    create_patient_tokens,
    register_patient,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await register_patient(
            db=db,
            email=request.email,
            password=request.password,
            name=request.name,
            phone=request.phone,
            dob=request.dob,
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
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    patient = await authenticate_patient(db, request.email, request.password)
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

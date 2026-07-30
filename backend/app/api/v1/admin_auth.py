from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_admin, get_password_hash, verify_password
from app.models.admin import AdminSettings
from app.schemas.admin import AdminLoginRequest, AdminLoginResponse, ChangePasswordRequest
from app.services.auth_service import authenticate_admin, create_admin_token

router = APIRouter(prefix="/admin", tags=["admin-auth"])


@router.post("/login")
async def admin_login(
    request: AdminLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    admin = await authenticate_admin(db, request.password)
    if admin is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = create_admin_token(admin.id, remember_me=request.remember_me)
    max_age = 30 * 24 * 60 * 60 if request.remember_me else 24 * 60 * 60

    response.set_cookie(
        key=settings.ADMIN_COOKIE_NAME,
        value=token_data["access_token"],
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=max_age,
        path="/",
    )
    return AdminLoginResponse(message="Login successful")


@router.post("/logout")
async def admin_logout(
    response: Response,
    _admin: AdminSettings = Depends(get_current_admin),
):
    response.delete_cookie(
        key=settings.ADMIN_COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return {"message": "Logged out"}


@router.patch("/password")
async def change_password(
    request: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    if not verify_password(request.current_password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    admin.password_hash = get_password_hash(request.new_password)
    await db.commit()
    return {"message": "Password updated"}

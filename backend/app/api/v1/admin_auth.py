from fastapi import APIRouter, Depends, HTTPException, Request, Response
from app.core.rate_limit import limiter
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_admin, get_password_hash, verify_password
from app.models.admin import AdminSettings
from app.schemas.admin import AdminLoginRequest, AdminLoginResponse, ChangePasswordRequest
from app.services.auth_service import authenticate_admin, create_admin_token

router = APIRouter(prefix="/admin", tags=["admin-auth"])


@router.post("/login")
@limiter.limit("5/minute")
async def admin_login(
    request: Request,
    login_request: AdminLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    admin = await authenticate_admin(db, login_request.password)
    if admin is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = create_admin_token(admin.id, remember_me=login_request.remember_me, token_version=admin.token_version or 0)
    max_age = 30 * 24 * 60 * 60 if login_request.remember_me else 24 * 60 * 60

    response.set_cookie(
        key=settings.ADMIN_COOKIE_NAME,
        value=token_data["access_token"],
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
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
        secure=settings.cookie_secure,
    )
    return {"message": "Logged out"}


@router.patch("/password")
@limiter.limit("10/minute")
async def change_password(
    request: Request,
    password_request: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    admin: AdminSettings = Depends(get_current_admin),
):
    if not verify_password(password_request.current_password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    admin.password_hash = get_password_hash(password_request.new_password)
    admin.token_version = (admin.token_version or 0) + 1
    await db.commit()
    return {"message": "Password updated"}

# Task 5: Auth System (Backend) — Report

## Files Created/Modified

| File | Action |
|------|--------|
| `backend/app/core/config.py` | Modified — added `REFRESH_TOKEN_EXPIRE_DAYS`, `ADMIN_ACCESS_TOKEN_EXPIRE_DAYS`, `ADMIN_COOKIE_NAME` |
| `backend/app/core/security.py` | Modified — added `create_refresh_token`, `decode_token`, `get_current_patient`, `get_current_admin` |
| `backend/app/schemas/auth.py` | Created — `RegisterRequest`, `LoginRequest`, `RefreshRequest`, `PatientResponse`, `AuthResponse` |
| `backend/app/schemas/admin.py` | Created — `AdminLoginRequest`, `ChangePasswordRequest`, `AdminLoginResponse` |
| `backend/app/schemas/__init__.py` | Modified — exports all new schemas |
| `backend/app/services/auth_service.py` | Created — `register_patient`, `authenticate_patient`, `authenticate_admin`, `create_patient_tokens`, `create_admin_token` |
| `backend/app/api/v1/auth.py` | Created — patient register, login, refresh endpoints |
| `backend/app/api/v1/admin_auth.py` | Created — admin login (set HTTP-only cookie), logout (clear cookie), change password |
| `backend/app/api/v1/router.py` | Modified — includes auth and admin_auth routers |

## Endpoints

| Method | Path | Auth | What it does |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | None | Creates patient account, returns patient + tokens |
| POST | `/api/v1/auth/login` | None | Validates email+password, returns patient + tokens |
| POST | `/api/v1/auth/refresh` | Refresh token body | Validates refresh token, issues new access+refresh tokens |
| POST | `/api/v1/admin/login` | None | Validates admin password, sets `admin_session` HTTP-only cookie |
| POST | `/api/v1/admin/logout` | Admin cookie | Clears `admin_session` cookie |
| PATCH | `/api/v1/admin/password` | Admin cookie | Verifies current password, updates to new hash |

## Auth Component Details

**Patient auth:**
- Access token: 24h expiry, type="access", returned in JSON body
- Refresh token: 7d expiry, type="refresh", returned in JSON body
- Protected via `get_current_patient` dependency (reads `Authorization: Bearer` header, decodes JWT, fetches Patient)

**Admin auth:**
- Token in `admin_session` HTTP-only cookie (Secure, SameSite=Lax)
- Sliding window: 1d default, 30d with `remember_me`
- Protected via `get_current_admin` dependency (reads cookie, decodes JWT, fetches AdminSettings)
- Logout clears cookie

**Token creation:**
- Patient tokens: `create_patient_tokens(patient_id)` in `auth_service.py`
- Admin tokens: `create_admin_token(admin_id, remember_me)` in `auth_service.py`

**Dependencies:**
- `get_current_patient` in `security.py` — OAuth2PasswordBearer + DB lookup, raises 401
- `get_current_admin` in `security.py` — Cookie extraction + DB lookup, raises 401

## Import Verification

```python
from app.api.v1.auth import router       # OK
from app.api.v1.admin_auth import router  # OK
```

All 6 routes confirmed via OpenAPI schema generation.

## Concerns

- `secure=False` on admin cookie for local dev — must flip to `True` in production (HTTPS)
- JWT_SECRET default is "change-me-to-a-random-secret-key" — must be changed in production
- No rate limiting on login endpoints — recommend adding later
- Patient refresh endpoint re-fetches patient from DB — could optimize with just sub validation

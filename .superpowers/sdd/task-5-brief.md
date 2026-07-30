# Phase 5: Auth System (Backend)

**Goal:** Patient registration, patient login, admin login, JWT middleware, refresh tokens.

## Files to Create/Modify

```
backend/app/
├── api/v1/
│   ├── __init__.py       # modify: add routers
│   ├── auth.py           # Patient register + login
│   └── admin_auth.py     # Admin login + password change
├── core/
│   └── security.py       # modify: add JWT creation, verification, dependencies
├── schemas/
│   ├── __init__.py       # modify: export schemas
│   ├── auth.py           # Login/Register request/response schemas
│   └── admin.py          # Admin login schema
└── services/
    └── auth_service.py   # Auth business logic
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | None | Patient registration |
| POST | `/api/v1/auth/login` | None | Patient login → access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Refresh token body | Refresh access token |
| POST | `/api/v1/admin/login` | None | Admin login → set HTTP-only cookie |
| POST | `/api/v1/admin/logout` | Admin | Clear admin cookie |
| PATCH | `/api/v1/admin/password` | Admin | Change admin password |

## Auth Details

**Patient Auth:**
- Access token: 24h expiry, returned in JSON response body
- Refresh token: 7 days, returned in JSON response body
- Frontend stores in memory (access) and localStorage (refresh)
- `Authorization: Bearer <access_token>` on API calls

**Admin Auth:**
- Access token in HTTP-only, Secure, SameSite=Lax cookie
- 30-day expiry with sliding window (re-issued on each request)
- `remember_me` field extends to 30 days, else 1 day
- Cookie name: `admin_session`

**Dependencies (FastAPI Depends):**
- `get_current_patient` — decode JWT from Authorization header, return Patient model or 401
- `get_current_admin` — decode JWT from cookie, return AdminSettings model or 401

## Details

### security.py additions
- `create_access_token(data: dict, expires_delta: timedelta | None = None)` — create JWT with sub, exp, type="access"
- `create_refresh_token(data: dict)` — create JWT with sub, exp=7d, type="refresh"
- `decode_token(token: str)` — decode and validate JWT, return payload or None
- `verify_password(plain: str, hashed: str) -> bool` — already exists
- `get_password_hash(password: str) -> str` — already exists

### auth_service.py
- `register_patient(db, email, password, name, phone, dob)` — validate email unique, hash password, create patient, return patient + tokens
- `authenticate_patient(db, email, password)` — find by email, verify password, return patient or None
- `authenticate_admin(db, password)` — get admin_settings row (id=1), verify password, return admin or None
- `create_patient_tokens(patient_id)` — return access + refresh tokens dict
- `create_admin_token(admin_id, remember_me)` — return JWT dict

### auth.py endpoints
- `POST /register` — accepts RegisterRequest (name, email, password, phone optional, dob optional), validates, returns AuthResponse (patient, access_token, refresh_token)
- `POST /login` — accepts LoginRequest (email, password), returns AuthResponse
- `POST /refresh` — accepts RefreshRequest (refresh_token), validates, returns new AuthResponse

### admin_auth.py endpoints
- `POST /admin/login` — accepts AdminLoginRequest (password, remember_me optional bool), sets HTTP-only cookie, returns success
- `POST /admin/logout` — clears admin_session cookie
- `PATCH /admin/password` — accepts ChangePasswordRequest (current_password, new_password), verifies current, updates hash

### router.py updates
- Import and include auth router at prefix "", tags=["auth"]
- Import and include admin_auth router at prefix "/admin", tags=["admin-auth"]

## Acceptance Criteria

- [ ] Patient can register, login, and access protected routes
- [ ] Admin can login with password-only, receives HTTP-only cookie
- [ ] Invalid credentials return 401
- [ ] Refresh token works for patients
- [ ] Admin cookie cleared on logout

## Constraints

- No comments in code unless explicitly asked
- Use existing security module for password hashing
- Async SQLAlchemy for all DB operations
- Pydantic v2 validation

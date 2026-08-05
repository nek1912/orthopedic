# BUGS.md — Codebase Audit Findings (Backend + Frontend)

**Last audit:** 2026-08-03
**Original audit:** 2026-07-31
**Scope:** Full read-through of `backend/` (FastAPI + async SQLAlchemy) and `frontend/` (React + Vite + TS).

**Severity legend:**
- **CRITICAL** — data corruption, auth bypass, or completely broken core flow
- **MAJOR** — visible bug in a normal user/admin flow
- **MINOR** — edge case, robustness, or hardening gap

---

## Summary

| Severity | Backend | Frontend | Total |
|----------|---------|----------|-------|
| CRITICAL | 0 | 0 | 0 |
| MAJOR | 2 | 5 | 7 |
| MINOR | 10 | 12 | 22 |

---

## Backend Findings

### CRITICAL

**C1. Default JWT secret shipped** — **FIXED** (2026-08-03)
- `config.py:21-22`: Startup validation now raises `ValueError` if JWT_SECRET equals the default.

### MAJOR

#### M1. Accept appointment returns 500 (MissingGreenlet) — **FIXED** (prior session)
- `scheduler.py` now loads with `selectinload(patient, service, prescriptions)` + `db.refresh(...)`.

#### M2. Race condition in the Intelligence Engine — **FIXED** (2026-08-03)
- `scheduler.py:30`: Added `pg_advisory_xact_lock(hashtext(date_str))` at transaction start.

#### M3. No validation that end_time > start_time — **FIXED** (prior session)
- `scheduler.py:22-23`: Validates `end_time > start_time`.

#### M4. Calendar API shape mismatch — **FIXED** (prior session)
- `availability.py` now returns `{"dates": dates}`.

#### M5. Admin session cookie missing Secure flag — **FIXED** (2026-08-03)
- `security.py:101` and `admin_auth.py`: `secure=True` in all `set_cookie` calls.

#### M6. Naive datetime.now() in timezone columns — **FIXED** (2026-08-03)
- All model files updated to `default=lambda: datetime.now(timezone.utc)`.

### MINOR

| ID | Location | Issue | Status |
|----|----------|-------|--------|
| m1 | `appointment_service.py` | Invalid UUID → ValueError → 500 | **FIXED** — `_parse_uuid()` helper added |
| m2 | `availability_service.py:12-19` | Invalid month → 500 | **FIXED** (prior session) |
| m3 | `admin_unavailability.py:45-47` | Invalid recurring string → ValueError → 500 | **PARTIAL** — Pydantic catches most, manual conversion still throws |
| m4 | `admin_unavailability.py:39-59` | No end>start validation on unavailability | **OPEN** |
| m5 | `auth_service.py:25-27` | Registration TOCTOU → IntegrityError → 500 | **OPEN** |
| m6 | `appointments.py:38-51` | No server-side past date / duplicate booking guard | **OPEN** |
| m7 | `security.py:83` | int(admin_id) ValueError → 500 | **OPEN** (only with compromised secret) |
| m8 | `config.py:10` | Dead config ACCESS_TOKEN_EXPIRE_MINUTES | **OPEN** |
| m9 | `appointment_service.py` | Raw status string → Postgres error → 500 | **FIXED** — validation added |
| m10 | `admin_stats.py:40-46` | Today count includes wrong statuses | **FIXED** (prior session) |
| m11 | `admin_prescriptions.py` | Prescriptions on wrong-status appointments | **FIXED** (prior session) |
| m12 | `alembic/versions/0001_initial_tables.py:86` | arrived_at added in-place to published migration | **OPEN** — needs follow-up migration |
| m13 | `auth_service.py` | Refresh tokens: no rotation/revocation | **OPEN** |
| m14 | `admin_auth.py:39-51` | Logout only deletes cookie, not bearer token | **OPEN** |
| m15 | `requirements.txt:7` | python-jose unmaintained with CVEs | **OPEN** |
| m16 | `HANDOFF.md` | Documentation drift (sync vs async) | **OPEN** |

---

## Frontend Findings

### MAJOR

#### M1. "Today" admin page shows ALL accepted — **FIXED** (prior session)
- `AdminTodayPage.tsx:51`: Now sends `&date=${localDateISO(new Date())}`.

#### M2. Broken debounce in patient search — **FIXED** (prior session)
- `AdminPatientsPage.tsx:40`: Now uses `useRef` + cleanup.

#### M3. Stale auth state when refresh fails — **FIXED** (2026-08-03)
- `client.ts:88-93`: On failed refresh, all tokens cleared from localStorage.

#### M4. Patient token shadows admin token — **FIXED** (2026-08-03)
- `client.ts:27-31`: `getAuthToken` now returns only `admin_token` for admin paths.

#### M5. Booking calendar silent failure — **OPEN**
- `BookingPage.tsx:44`: `.catch(() => {})` swallows errors, no AbortController.

#### M6. Footer links all dead — **OPEN**
- `/services`, `/about`, `/contact`, `/privacy`, `/terms` routes don't exist.

#### M7. No mid-session admin auth expiry — **FIXED** (2026-08-03)
- `AdminRoute.tsx`: 5-minute interval re-validates admin auth.

#### M8. No error boundary around lazy admin chunk — **FIXED** (2026-08-03)
- `App.tsx`: `<ErrorBoundary>` wraps `<Suspense>`. New `ErrorBoundary.tsx` created.

#### M9. TimeSlotPicker false availability — **PARTIALLY FIXED**
- `AdminRequestsPage.tsx`: bookedSlots/unavailableSlots now fetched dynamically.
- `TimeSlotPicker.tsx:12-15`: Hours changed to 09:00-19:00.

### NEW MAJOR (found 2026-08-03)

#### N-M1. AuthContext no loading during initial refresh — **FIXED** (2026-08-03)
- `AuthContext.tsx:56`: `loading` initialized to `true`, set `false` after refresh.

#### N-M2. CrowdMeter is static legend — **PARTIALLY FIXED** (2026-08-03)
- `CrowdMeter.tsx`: Now accepts `level` prop and highlights matching row. But BookingPage doesn't pass the selected date's crowd level yet.

#### N-M3. No client-side validation on RegisterPage — **OPEN**

### MINOR

| ID | Location | Issue | Status |
|----|----------|-------|--------|
| m1 | `AdminAuthContext.tsx:67` | Admin login never shows loading | **OPEN** |
| m2 | `DarkModeToggle.tsx:14` | Dead component, no CSS responds | **OPEN** |
| m3 | `useScrollReveal.ts` | Dead code | **OPEN** |
| m5 | `AdminTodayPage.tsx:94-107` | Prescription POST before complete PATCH | **OPEN** |
| m7 | `client.ts:1` | BASE_URL = '' same-origin assumption | **OPEN** (VERIFY Render topology) |
| m8b | `TimeSlotPicker.tsx:5,30` | `date` prop unused (dead prop) | **OPEN** |
| m9 | `BookingPage.tsx` | Hidden selected date on month nav | **OPEN** |
| m10 | `AdminAuthContext.tsx:45-62` | Network blip logs admin out | **OPEN** |
| m12 | `AdminAuthContext.tsx:27` | Admin token in localStorage (XSS-exposed) | **OPEN** |
| m13 | `ToastContext.tsx:20` | crypto.randomUUID on non-secure origins | **FIXED** — fallback added |
| m14 | `BookingPage.tsx:32, ServiceSelector.tsx:42` | Duplicate services fetch | **OPEN** |
| m16 | `LoginPage.tsx:57` | Blank error span hack | **OPEN** |
| m17 | `AdminLoginPage.tsx` | No redirect for already-authenticated admin | **OPEN** |

---

## Areas Verified OK

- Overlap formula in scheduler.py — half-open [start, end) correct
- Token-type separation — patient vs admin vs refresh strictly distinguished
- Sliding-window cookie max_age consistent with JWT expiry
- Crowd meter thresholds (0-3/4-7/8+) match design
- Session hygiene: get_db closes sessions, no commit/rollback leaks
- Models ↔ migration 0001 match
- 409 on slot conflict correctly returned
- Frontend API shapes match backend Pydantic schemas
- Calendar date logic correct
- PatientRoute/AdminRoute separation correct

---

## Open Questions

1. **Render deployment topology**: are frontend and API served from same origin? Determines if `BASE_URL = ''` works in production.
2. **Prescription payload shape**: double-nested `{medicines: [...]}` intentional?
3. **Admin stats "today"**: should count include pending or only accepted?
4. **Migration m12**: has any env already applied migration 0001 without arrived_at?

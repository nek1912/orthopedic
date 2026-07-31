# Admin Dashboard Overhaul — Design Spec

**Date:** 2026-07-31
**Status:** Approved
**Approach:** Phased (UI → Backend → Features → Hardening)

---

## Executive Summary

Complete overhaul of the admin dashboard for a dental clinic management system. The redesign reorganizes navigation around the doctor's daily workflow (not CRUD entities), adds a dedicated slot assignment intelligence panel, enhances prescriptions with file uploads, and hardens the system for production reliability.

**Scope:** 4 phases, ~15 new/modified pages, ~25 new/modified API endpoints, new database models.

---

## Phase 1: Admin UI Overhaul

### Sidebar Navigation

Ordered by daily workflow priority:

```
Today's Queue        ← DEFAULT landing page
Appointment Requests
Patients
Schedule
Services
Prescriptions
Clinic Settings
```

**Footer:**
```
Dr. Rahul Patel
Administrator
● Clinic Open
---
Sign Out
```

### Mobile Bottom Navigation (5 + More drawer)

```
Queue | Requests | Patients | Settings | More
```

More drawer contains: Schedule, Services, Prescriptions, Logout

### Greeting Banner

```
Good Morning Dr. Patel
Friday, 31 July
12 patients today · 3 pending requests · Clinic closes at 7 PM
```

No dark mode toggle.

### Stat Cards (4)

```
Today's Queue | Pending Requests | Completion Rate | Next Available Day
```

### Today's Queue (Default Page)

Color-coded cards with one-click actions:

| State | Border Color | Available Actions |
|-------|-------------|-------------------|
| Accepted | Teal | Arrived, Start, Complete, No Show, Cancel |
| Arrived | Green | Start, Complete, No Show |
| Waiting | Yellow | Arrived, Cancel |
| Completed | Gray | View Prescription |
| Blocked | Red | Doctor unavailable |
| Available | Light | Open slot |

**Waiting Room panel:** Shows arrived patients with wait time, sorted by longest wait first.

### Appointment Requests (Inbox + Slot Assignment merged)

**Layout:** Gmail-style — left panel (patient list), right panel (patient details)

**Patient Details Panel:**
- Patient info (name, age, phone)
- Service, problem description
- Preferred day
- Previous visits, prescriptions
- Clinical Documents (X-rays, Reports, Scans, Photos)
- **Slot Assignment panel** (inline):
  - Suggested order by urgency/date
  - Conflict check
  - Available slots grid with start + end time
  - One-click assign
- Actions: Accept, Reject, Suggest Another Day

### Patient Timeline

Chronological medical timeline:
```
● Jul 2026 — Cleaning, Prescription
● Jan 2026 — Root Canal
● Sep 2025 — Consultation
```

### Schedule & Availability

- Calendar view
- Availability rules list (date, time range, recurring)
- Utilization info: "20 slots · 16 booked · 4 available · 80% utilization"

### Services (Cards, not table)

Each card:
```
Dental Cleaning
₹500 · 20 mins
Preparation Notes: None
Requires Follow-up: No
Active
[Edit]
```

Service fields: Name, Description, Duration, Default Fee, Preparation Notes, Requires Follow-up, Active status.

### Prescriptions

**Integrated into patient visit flow:**
```
Patient arrives → Click "Start" → Prescription form opens
→ Fill diagnosis, medicines, notes, attach files → Save
→ Auto-appears in patient history
```

**Standalone page:** Templates, Medicine Search, Recent, Drafts

### Activity Log

Audit trail:
```
10:32 — Accepted Appointment
10:34 — Assigned Slot
10:50 — Completed
10:52 — Prescription Added
```

### Notification Center

Bell icon — only action-required items:
- 3 requests pending
- Patient arrived
- Tomorrow blocked
- Backup failed

### Global Search

Command-style search: "Priya", "98765", "Cleaning", "Tomorrow", "Pending", "July"

### Production Features

- Autosave for notes/prescriptions
- Undo for status changes (10-15 sec, selective)
- Optimistic UI with rollback (selective)
- Draft recovery on browser close
- Soft delete for services/records
- Confirmation only for destructive actions

### States

Every page defines: Empty, Loading (skeletons), Network Error, Permission Denied, Session Expired, Backend Unavailable

---

## Phase 2: Backend Fixes & Intelligence Engine

### Phase 2.1 — Data Integrity

**Appointment State Machine:**
```
pending → accepted → arrived → started → completed
pending → rejected
any active state → cancelled
```

Each endpoint validates legal transitions.

**General Audit Log:**
```
audit_logs
├── id (UUID)
├── actor_id (UUID)
├── actor_type (patient/admin/system)
├── action (string)
├── entity_type (string)
├── entity_id (UUID)
├── old_values (JSON)
├── new_values (JSON)
├── ip_address (string)
├── user_agent (string)
├── timestamp (datetime)
```

**Optimistic Concurrency:** `updated_at` + version check on all writes.

**Centralized Validators:** `AppointmentValidator`, `ServiceValidator`, `PrescriptionValidator`, `SlotValidator`

### Phase 2.2 — Scheduling Engine

**Duration-aware scheduling:** Service model gets `duration_minutes` and `priority` fields.

**Intelligence Scoring:**
```
score = (urgency * 3) + (days_waiting * 1) + (service_priority * 2) + (follow_up_bonus * 2) - (schedule_gap_penalty * 1)
```

Weights:
- `urgency`: 1 if date is today, 0 otherwise
- `days_waiting`: number of days since appointment was created
- `service_priority`: from service.priority field (1-5)
- `follow_up_bonus`: 2 if appointment is a follow-up (has previous completed appointment for same service)
- `schedule_gap_penalty`: 1 if assigning this slot creates a gap > 30 minutes in doctor's schedule

**Slot Validation:** `SELECT ... FOR UPDATE` for transaction safety (prevents two admins from assigning the same slot).

**Next Available Day:** Considers doctor unavailability, holidays, existing bookings, working hours, service duration.

**Utilization:** Time-based — `booked_minutes`, `available_minutes`, `utilization_percentage`.

### Phase 2.3 — Clinical Data

**Prescriptions:**
- Full CRUD for templates (`GET/POST/PATCH/DELETE`)
- Medicine search endpoint
- Draft management

**Clinical Documents:**
```
documents
├── id (UUID)
├── appointment_id (UUID, FK)
├── patient_id (UUID, FK)
├── document_type (enum: xray/report/scan/prescription_pdf/consent_form/photo)
├── filename (string)
├── mime_type (string)
├── storage_key (string)
├── uploaded_by (UUID)
├── created_at (datetime)
```

**Storage Abstraction:**
```
StorageService → LocalStorage → S3 → Cloudflare R2 → Azure
```

Begin with local storage, abstract interface for future migration.

**Patient Timeline:** Chronological medical history endpoint.

### Phase 2.4 — Operational APIs

**Dashboard Stats:** `GET /api/v1/admin/stats` returns:
- `today_count`
- `pending_count`
- `total_patients`
- `completion_rate`
- `next_available_day`
- `today_appointments`

**Waiting Room:** `GET /api/v1/admin/today/waiting` returns:
- `waiting_time` (minutes since arrival)
- `arrived_at`
- `priority`
- `appointment_time`

**Search API:** `GET /api/v1/admin/search?q=&type=` — searches patients, appointments, prescriptions, services.

**Pagination:** All list endpoints support `page`, `limit`, `cursor`, `sort`, `order`, `search`.

**Notification System:** Event-driven — `AppointmentAccepted` → `NotificationService` → Email/SMS/In-app.

### Phase 2.5 — Infrastructure

**Health Endpoint:** `GET /api/v1/admin/health` — returns database, storage, scheduler, email, disk, version status.

**Background Jobs:** Celery with Redis as broker. Tasks: reminders, SMS, audit logging, PDF generation, backups, reports.

**Rate Limiting:** Per-endpoint rate limits.

**Monitoring:** Request logging, error tracking.

### New Backend Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/services` | List all services (including inactive) |
| POST | `/api/v1/admin/services` | Create service |
| PATCH | `/api/v1/admin/services/{id}` | Update service |
| PATCH | `/api/v1/admin/services/{id}/active` | Activate/deactivate service |
| PATCH | `/api/v1/admin/appointments/{id}/notes` | Add/edit appointment notes |
| GET | `/api/v1/admin/prescriptions` | List all recent prescriptions |
| GET | `/api/v1/admin/prescriptions/templates` | List prescription templates |
| POST | `/api/v1/admin/prescriptions/templates` | Create template |
| PATCH | `/api/v1/admin/prescriptions/templates/{id}` | Update template |
| DELETE | `/api/v1/admin/prescriptions/templates/{id}` | Delete template |
| GET | `/api/v1/admin/prescriptions/{id}` | Get prescription detail |
| POST | `/api/v1/admin/appointments/{id}/documents` | Upload document |
| GET | `/api/v1/admin/appointments/{id}/documents` | List documents |
| DELETE | `/api/v1/admin/documents/{id}` | Delete document |
| GET | `/api/v1/admin/activity` | List audit log entries |
| GET | `/api/v1/admin/today/waiting` | Get waiting room status |
| GET | `/api/v1/admin/search` | Global search |
| GET | `/api/v1/admin/health` | Health check |
| GET | `/api/v1/admin/slots` | Get available slots for date |

---

## Phase 3: Enhanced Time Slot Picker & Prescription Flow

### Time Slot Picker (Enhanced)

**Layout:** Grid + end time selector

- Grid shows 30-min slots from working hours (configurable)
- Admin clicks a start slot → end time selector appears
- End time options: 30m, 45m, 1h, 1.5h, 2h after start time
- Visual: selected range highlighted in teal

**Booked/Unavailable Handling:**
- Slots overlapping existing bookings: greyed out, not clickable
- Slots overlapping doctor unavailability: red border, not clickable
- Hover on blocked slot shows tooltip: "Booked by Priya" or "Doctor unavailable"

**Backend Integration:**
- `GET /api/v1/admin/slots?date=&start=&end=` returns available slots
- Response includes `booked_slots` and `unavailable_slots` with full details
- Frontend renders grid with real-time availability

### Prescription Flow

**Form Fields:**
```
Diagnosis (textarea)
Medicines (dynamic list):
  ├── Name (searchable dropdown)
  ├── Dosage (text)
  ├── Frequency (dropdown: 1x/day, 2x/day, 3x/day, etc.)
  ├── Duration (text: "5 days", "2 weeks")
  └── Notes (optional text)
Additional Notes (textarea)
Clinical Documents (file upload):
  ├── X-ray
  ├── Report
  ├── Scan
  └── Photo
```

**File Upload:**
- Drag & drop zone
- Multiple files supported
- Progress indicator
- Preview for images
- File type validation (images, PDFs only)
- Size limit: 10MB per file
- Max uploads per prescription: 10

**Draft Recovery:**
- Server drafts API (primary storage)
- localStorage fallback (secondary)
- Auto-save every 30 seconds
- Show metadata: "Saved 10:43 AM · 2 min ago · Recover / Discard"
- Clear draft after successful submission

---

## Phase 4: Edge Cases & Production Hardening

### Phase 4.1 — Reliability

**Transactions:** All multi-step operations wrapped in DB transactions.

**Idempotency:** All mutation endpoints accept `Idempotency-Key` header — safe to retry.

**Retry Strategy:**
- Auto-retry: GET requests, dashboard refresh, stats, notifications
- No auto-retry: acceptance, rejection, completion, uploads

**State Validation:** Every endpoint validates legal state transitions.

**Draft Recovery:** Server drafts API with localStorage fallback.

### Phase 4.2 — UX Resilience

**Skeletons:** For all list views (not spinners).

**Error Handling (differentiated):**
- Request timeout → "Request timed out. Retrying..."
- Offline → "You're offline. Check your connection."
- Server error → "Something went wrong. Try again."
- Validation error → Show field-level errors
- Conflict (409) → Show conflict details + suggested slots
- Auth expired → Modal with login form, preserve context

**Autosave:** Server drafts API with localStorage fallback.

**Undo (selective):**
- Undo: Arrived, Waiting, Complete, Note edits
- No undo: Accept, Reject, Slot assignment (externally visible)

**Optimistic Updates (selective):**
- Apply: Arrived, Waiting, Note edits, UI preferences
- Don't apply: Slot assignment, acceptance, rejection, prescription creation

### Phase 4.3 — Security

**Rate Limiting:** Login, upload, appointment creation, search.

**Upload Validation:** Size, MIME type, max uploads, duplicate filenames, preview support.

**Session Handling:**
- Expiry → Modal with login form
- Preserve context across re-login
- Sliding window refresh

**CSRF/CSP:** CSRF tokens for cookie-based auth, Content Security Policy headers.

**Security Headers:** X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security.

### Phase 4.4 — Operations

**Audit Logs:** Append-only, never editable.

**Structured Logging:** Separate logs by purpose (application, audit, scheduler, security).

**Health Monitoring:** API latency, database connectivity, storage availability, scheduler health, queue length.

**Metrics:** Request count, error rate, response time, active users.

### Phase 4.5 — Real-Time

**Background Synchronization:** Server-Sent Events (SSE) for:
- Queue updates (reception marks arrived → doctor's screen updates)
- Appointment changes
- Waiting room updates
- Notifications

SSE chosen over WebSocket for simplicity (unidirectional server→client, auto-reconnect, no additional dependencies).

### Phase 4.6 — Accessibility

**Keyboard Navigation:** All interactive elements accessible via keyboard.

**Screen Reader Labels:** ARIA labels on icons, buttons, forms.

**Focus Management:** Focus trap in modals, return focus on close.

**Color-Independent Status:** Status indicators use icons + text, not just color.

**Touch Targets:** Minimum 44x44px on mobile.

### Additional Production Features

**API Idempotency:** All mutations accept idempotency key.

**Time Handling:** UTC in database, clinic local timezone for display.

**Empty States (professional):**
- "No appointments scheduled for today."
- "No patient records available."
- "No prescriptions have been created yet."

**Conflict Resolution:**
```
Conflict → Reason → Suggested Slots → Assign Anyway (if override allowed) → Cancel
```

**Mid-Workflow Recovery:** Browser crash → reopen → resume exactly where left off (draft + UI context).

---

## Database Changes

### New Tables

**audit_logs:**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    actor_id UUID NOT NULL,
    actor_type VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**prescription_templates:**
```sql
CREATE TABLE prescription_templates (
    id UUID PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    diagnosis TEXT,
    medicines JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Modified Tables

**services:** Add columns:
```sql
ALTER TABLE services ADD COLUMN duration_minutes INTEGER DEFAULT 30;
ALTER TABLE services ADD COLUMN default_fee DECIMAL(10,2);
ALTER TABLE services ADD COLUMN preparation_notes TEXT;
ALTER TABLE services ADD COLUMN requires_followup BOOLEAN DEFAULT FALSE;
ALTER TABLE services ADD COLUMN priority INTEGER DEFAULT 2;
```

**admin_settings:** Fix `id` column type handling (cast to int in queries).

---

## Implementation Order

**Note:** This spec is too large for a single implementation plan. Each phase should be decomposed into its own implementation plan with detailed tasks.

1. **Phase 1** — UI overhaul (sidebar, pages, components, styling)
2. **Phase 2.1** — Data integrity (state machines, audit log, validators)
3. **Phase 2.2** — Scheduling engine (scoring, utilization, next available day)
4. **Phase 2.3** — Clinical data (prescriptions, documents, templates)
5. **Phase 2.4** — Operational APIs (stats, queue, search, notifications)
6. **Phase 2.5** — Infrastructure (health, background jobs, rate limiting)
7. **Phase 3** — Time slot picker + prescription flow enhancements
8. **Phase 4.1** — Reliability (transactions, idempotency, retry)
9. **Phase 4.2** — UX resilience (skeletons, error handling, autosave)
10. **Phase 4.3** — Security (rate limiting, upload validation, session handling)
11. **Phase 4.4** — Operations (audit logs, monitoring, health checks)
12. **Phase 4.5** — Real-Time (WebSocket/SSE)
13. **Phase 4.6** — Accessibility

---

## Success Criteria

- Admin can manage entire daily workflow from Today's Queue
- Time slot assignment shows real conflicts and suggests alternatives
- Prescriptions include diagnosis, medicines, notes, and file attachments
- All edge cases handled gracefully (past dates, overlaps, cancellations, partial failures)
- System is production-ready with audit logging, monitoring, and security hardening
- Mobile experience is smooth with touch-friendly interactions
- UI matches reference design (dark teal sidebar, clean white content, minimal cards)

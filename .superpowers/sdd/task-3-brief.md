# Phase 3: Database Models + Migrations

**Goal:** All SQLAlchemy models and initial Alembic migration.

## Files to Create

```
backend/app/models/
├── __init__.py        # Import all models
├── patient.py         # Patient model
├── appointment.py     # Appointment model + StatusEnum
├── service.py         # Service model
├── prescription.py    # Prescription model
├── document.py        # AppointmentDocument model
├── unavailability.py  # DoctorUnavailability model + RecurringEnum
└── admin.py           # AdminSettings model
```

## Model Details

**Patient**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid4 |
| email | String(255) | Unique, not null, indexed |
| password_hash | String(255) | Not null |
| name | String(255) | Not null |
| phone | String(20) | Nullable |
| dob | Date | Nullable |
| created_at | DateTime(tz) | Default now |

**Appointment**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| patient_id | UUID | FK→patients.id, not null |
| service_id | UUID | FK→services.id, nullable |
| service_description | Text | Nullable (for "Other") |
| requested_date | Date | Not null, indexed |
| status | Enum(pending,accepted,rejected,completed,cancelled) | Default pending |
| rejection_reason | Text | Nullable |
| suggested_date | Date | Nullable |
| time_slot_start | Time | Nullable (set on accept) |
| time_slot_end | Time | Nullable (set on accept) |
| notes | Text | Nullable |
| created_at | DateTime(tz) | Default now |
| updated_at | DateTime(tz) | Default now, onupdate now |

**Service**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | String(255) | Not null |
| description | Text | Nullable |
| is_active | Boolean | Default true |

**Prescription**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| appointment_id | UUID | FK→appointments.id, not null |
| medicines | JSON | Nullable |
| diagnosis | Text | Nullable |
| notes | Text | Nullable |
| created_at | DateTime(tz) | Default now |

**AppointmentDocument**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| appointment_id | UUID | FK→appointments.id, not null |
| file_url | String(500) | Not null |
| file_type | String(50) | Not null |
| uploaded_at | DateTime(tz) | Default now |

**DoctorUnavailability**
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| date | Date | Not null, indexed |
| start_time | Time | Not null |
| end_time | Time | Not null |
| recurring | Enum(none,weekly,weekdays) | Default none |
| reason | Text | Nullable |

**AdminSettings**
| Column | Type | Constraints |
|--------|------|-------------|
| id | Integer | PK, default 1 |
| email | String(255) | Not null |
| password_hash | String(255) | Not null |
| clinic_name | String(255) | Nullable |
| address | Text | Nullable |
| phone | String(20) | Nullable |
| created_at | DateTime(tz) | Default now |
| updated_at | DateTime(tz) | Default now, onupdate now |

## Task: Create Alembic Migration

- Configure `alembic/env.py` to use async engine (already done in Task 2)
- Generate initial migration: `alembic revision --autogenerate -m "initial_tables"`
- Run: `alembic upgrade head`

## Acceptance Criteria

- [ ] `alembic upgrade head` creates all 7 tables
- [ ] All FK relationships valid
- [ ] Indexes on `patients.email`, `appointments.requested_date`, `doctor_unavailability.date`
- [ ] Enums created in PostgreSQL

## Constraints

- No comments in code unless explicitly asked
- Use SQLAlchemy 2.0 style (Mapped, mapped_column, etc.)
- All models inherit from app.core.database.Base
- UUID PKs use uuid4 default

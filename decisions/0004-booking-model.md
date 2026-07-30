# ADR 0004: Date-Only Booking Model with Admin Time Slot Assignment

**Date:** 2026-07-30

## Context

Patients need to book appointments. The standard model (pick a time slot) introduces complexity on the patient side and assumes the doctor's schedule is fully predictable. The doctor prefers to control scheduling.

## Decision

**Patients book a date + service only. No time slots on patient side.** Admin accepts requests and assigns a time slot.

## Booking Flow

1. Patient selects a date (calendar with crowd meter inspired by Indian railway)
2. Patient selects a service (or "Other" with custom description)
3. Patient submits request → status = "pending"
4. Admin reviews → accepts (with time slot) or rejects (with reason + suggested date)
5. Patient sees status update on "My Appointments" page

## Intelligence Engine

When admin accepts and assigns a time slot, the system validates:
1. No overlap with other accepted appointments on the same date
2. No overlap with doctor's unavailability (specific date or recurring)
3. Returns 409 Conflict if overlap detected

## Crowd Meter

- Based on count of pending + accepted appointments per date
- Green = low (0-3), Orange = medium (4-7), Red = high (8+)
- Doctor unavailable dates shown as blocked

## Consequences

- Patient never sees time slots — simpler UX
- Admin controls scheduling completely
- Core complexity shifts from patient booking to admin acceptance flow
- Intelligence Engine is the most critical business logic in the system

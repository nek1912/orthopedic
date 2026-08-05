# Design: Time Slot Picker, Button Simplification, Edit Modal Fix

## Date: 2026-08-03

## Problem Statement

1. Time slot picker hardcodes 30-minute slots with no custom end time
2. Today's Queue has 4 buttons (Arrived, Complete, Edit, Cancel) — too many
3. EditAppointmentModal has broken layout (fields cut off, horizontal scroll)
4. No way to edit completed appointments from the Patients page

## Design Decisions

### 1. Time Slot — Custom End Time

**Approach**: Dropdown after selecting start time.

- Doctor clicks start time on grid
- Dropdown appears showing available end times (30-min increments from start)
- End times that overlap with existing bookings/unavailability are disabled
- After selecting both, Accept button activates

**Overlap check**: For end time `E`, verify no existing booking/unavailability overlaps `[start, E)`.

### 2. Today's Queue — Button Simplification

**Current**: Arrived, Complete, Edit, Cancel (4 buttons)
**New**: Complete, Cancel (2 buttons)

- Remove Arrived button (redundant)
- Remove Edit button from Today's Queue (moved to Patients page)

### 3. Edit Modal — Fixed Layout

Structure:
- Patient Notes (textarea)
- Divider
- Diagnosis (textarea)
- Medicines (dynamic rows with Name/Dosage/Frequency/Duration)
- Doctor Notes (textarea)
- Cancel + Save buttons

**CSS fixes**:
- `.medRow` uses `flex-wrap: wrap` on mobile
- `.medInput` uses `flex: 1 1 45%` for mobile two-column
- Modal uses `maxWidth="wide"`

### 4. Patient Timeline — Edit Button

In Patients page, completed appointments get an "Edit" button that opens EditAppointmentModal.

## Files to Modify

- `frontend/src/admin/components/TimeSlotPicker.tsx` — add end time dropdown
- `frontend/src/admin/components/TimeSlotPicker.module.css` — style dropdown
- `frontend/src/admin/components/AppointmentRow.tsx` — simplify buttons
- `frontend/src/admin/components/AppointmentRow.module.css` — remove unused styles
- `frontend/src/admin/pages/AdminTodayPage.tsx` — remove Edit/Arrive handlers
- `frontend/src/admin/components/EditAppointmentModal.tsx` — fix layout
- `frontend/src/admin/components/EditAppointmentModal.module.css` — fix responsive
- `frontend/src/admin/components/PatientRow.tsx` — add Edit button for completed

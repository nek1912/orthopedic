# DESIGN.md — Dental Clinic Design System

**Date:** 2026-07-30
**Status:** Draft — awaiting review
**Design Read:** Trust-first healthcare landing + patient portal for a single-dentist clinic's non-tech audience. Clean, calming, medical-authoritative language. Soft structuralist aesthetic with restrained motion.

---

## 1. Design Principles

1. **Trust is the product.** Every visual decision serves one goal: the patient feels safe, cared for, and confident in the clinic. No gimmicks, no flash, no sales pressure.
2. **Calm clarity.** The interface is quiet — generous whitespace, soft curves, muted colors. Information is structured so the patient never feels lost or rushed.
3. **Mobile-first is not a feature list; it is the only starting point.** Every component is designed for a 375px viewport first, then enhanced for larger screens.
4. **Bespoke, not templated.** Every component is purpose-built for this clinic. Nothing is pulled from a generic UI kit.
5. **Motion must earn its place.** Animations exist only to guide attention (hierarchy), acknowledge action (feedback), or reveal content (storytelling). Never decoration.
6. **The clinic's brand is the doctor's name and reputation.** The design elevates the doctor, not itself.

---

## 2. Design Dial Values

| Dial | Value | Rationale |
|------|-------|-----------|
| DESIGN_VARIANCE | 5 | Trust-first healthcare — layouts are structured but not rigid. Subtle asymmetry in content blocks keeps the page from feeling templated without creating confusion. |
| MOTION_INTENSITY | 3 | Minimal, purposeful motion. Section reveals on scroll, subtle hover states, smooth page transitions. No parallax, no marquees, no cinematic effects. |
| VISUAL_DENSITY | 4 | Comfortable spacing. Not airy luxury, not cramped cockpit. 16-24px base gaps, 80-120px section padding on desktop. |

---

## 3. Color System

### 3.1 Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-surface` | `#F8F9FA` | Page background (cool off-white) |
| `--color-surface-elevated` | `#FFFFFF` | Card, modal, dropdown backgrounds |
| `--color-surface-muted` | `#F1F3F5` | Secondary surfaces, table striping |
| `--color-primary` | `#1B3A5C` | Primary text, primary buttons, nav — deep navy (trust, authority) |
| `--color-primary-hover` | `#2A5080` | Primary hover state |
| `--color-accent` | `#4A9E8E` | CTAs, interactive elements, success states — soft teal (calm, care) |
| `--color-accent-hover` | `#3D8A7C` | Accent hover state |
| `--color-text` | `#1A1A2E` | Body text (near-black with slight cool tint) |
| `--color-text-secondary` | `#5C6B7A` | Secondary/label text |
| `--color-text-muted` | `#8E9BAE` | Tertiary text, placeholders |
| `--color-border` | `#E2E6ED` | Borders, dividers |
| `--color-border-light` | `#F0F2F5` | Subtle dividers |
| `--color-success` | `#3BA67A` | Accepted, completed status |
| `--color-warning` | `#E8A838` | Pending, medium crowd meter |
| `--color-danger` | `#D45C5C` | Rejected, error, high crowd meter |
| `--color-info` | `#5B8FC9` | Info badges |
| `--color-focus` | `#4A9E8E` | Focus ring color |

### 3.2 Status Colors (for badges, crowd meter)

| Status | Color | Badge Background |
|--------|-------|-----------------|
| pending | `--color-warning` | `rgba(232, 168, 56, 0.12)` |
| accepted | `--color-success` | `rgba(59, 166, 122, 0.12)` |
| rejected | `--color-danger` | `rgba(212, 92, 92, 0.12)` |
| completed | `--color-info` | `rgba(91, 143, 201, 0.12)` |
| cancelled | `--color-text-muted` | `rgba(142, 155, 174, 0.12)` |

### 3.3 Crowd Meter Levels

| Level | Color | Count |
|-------|-------|-------|
| Green | `--color-success` | 0-3 appointments |
| Orange | `--color-warning` | 4-7 appointments |
| Red | `--color-danger` | 8+ appointments |

### 3.4 Shadows

```css
--shadow-sm: 0 1px 3px rgba(27, 58, 92, 0.06), 0 1px 2px rgba(27, 58, 92, 0.04);
--shadow-md: 0 4px 12px rgba(27, 58, 92, 0.08), 0 2px 4px rgba(27, 58, 92, 0.04);
--shadow-lg: 0 12px 36px rgba(27, 58, 92, 0.10), 0 4px 12px rgba(27, 58, 92, 0.06);
```

All shadows tinted to the primary navy hue — never pure black.

---

## 4. Typography

### 4.1 Font Stack

| Role | Font | Fallback | Weight Range |
|------|------|----------|-------------|
| Display / Headings | Satoshi | system-ui, sans-serif | 400, 500, 700, 900 |
| Body | Inter | system-ui, sans-serif | 400, 500, 600 |
| Mono / Data | JetBrains Mono | monospace | 400, 500 |

**Justification for Inter:** This is a medical trust site. Inter's clean neutrality and exceptional readability at small sizes are assets in a healthcare context, not liabilities. The display face (Satoshi) provides character for headings so the overall feel is not generic.

### 4.2 Type Scale

```css
--text-xs: 0.75rem;      /* 12px — labels, metadata */
--text-sm: 0.875rem;     /* 14px — body default */
--text-base: 1rem;        /* 16px — large body */
--text-lg: 1.125rem;      /* 18px — intro text */
--text-xl: 1.25rem;       /* 20px — card titles */
--text-2xl: 1.5rem;       /* 24px — section headings */
--text-3xl: 1.875rem;     /* 30px — page headings */
--text-4xl: 2.25rem;      /* 36px — hero headings (mobile) */
--text-5xl: 3rem;         /* 48px — hero headings (desktop) */

--leading-tight: 1.15;    /* headings */
--leading-normal: 1.5;    /* body */
--heading-weight: 700;    /* default heading weight */
--display-weight: 900;    /* hero weight */
```

### 4.3 Type Usage

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Hero heading (mobile) | `--text-4xl` | 900 | 1.1 | -0.02em |
| Hero heading (desktop) | `--text-5xl` | 900 | 1.1 | -0.02em |
| Section heading | `--text-2xl` | 700 | 1.2 | -0.01em |
| Card title | `--text-xl` | 600 | 1.3 | normal |
| Body text | `--text-base` | 400 | 1.6 | normal |
| Small body | `--text-sm` | 400 | 1.5 | normal |
| Label | `--text-xs` | 500 | 1.4 | 0.04em |
| Status badge | `--text-xs` | 600 | 1.3 | 0.02em |
| Button | `--text-sm` | 600 | 1 | 0.01em |

### 4.4 Font Loading

Fonts self-hosted via `@font-face` with `font-display: swap`. Links to Google Fonts are not used in production.

---

## 5. Spacing & Layout System

### 5.1 Spacing Scale (4px grid)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

### 5.2 Border Radius

```css
--radius-sm: 6px;       /* small inputs, pills */
--radius-md: 10px;      /* buttons, cards (default) */
--radius-lg: 16px;      /* modals, large containers */
--radius-full: 9999px;  /* badges, pill buttons, avatars */
```

All corners use a single radius system (soft, not pill for everything). Everything that is not a pill button or badge uses `--radius-md` (10px) by default.

### 5.3 Layout Max Width

```css
--content-max: 1200px;    /* max content width */
--content-narrow: 720px;  /* form pages, article-like content */
```

### 5.4 Section Padding

```css
--section-padding-y: var(--space-16);    /* 64px mobile */
--section-padding-y-lg: var(--space-24); /* 96px desktop */
--page-padding-x: var(--space-4);        /* 16px mobile */
--page-padding-x-lg: var(--space-8);     /* 32px desktop */
```

### 5.5 Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| mobile | 0-639px | Default (all components designed here first) |
| tablet | 640-1023px | Enhanced layout, multi-column starts |
| desktop | 1024px+ | Full layout, sidebar on admin |

---

## 6. Component Architecture

### 6.1 File Organization

```
frontend/src/
├── styles/
│   ├── tokens.css        # CSS custom properties (colors, spacing, typography)
│   ├── reset.css          # CSS reset / normalize
│   ├── base.css           # HTML element defaults
│   ├── utilities.css      # Utility classes
│   └── admin/
│       └── admin.css      # Admin-specific overrides (loaded lazily with admin routes)
├── shared/
│   └── components/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Calendar.tsx
│       ├── CrowdMeter.tsx
│       ├── StatusBadge.tsx
│       ├── Spinner.tsx
│       └── EmptyState.tsx
├── patient/
│   └── components/
│       ├── HeroSection.tsx
│       ├── ServiceCard.tsx
│       ├── AppointmentCard.tsx
│       └── AuthForm.tsx
└── admin/
    └── components/
        ├── StatCard.tsx
        ├── AppointmentRow.tsx
        ├── TimeSlotPicker.tsx
        ├── PatientRow.tsx
        ├── PrescriptionForm.tsx
        └── Sidebar.tsx
```

### 6.2 Component Standards

- **No comments in source** unless explicitly requested.
- **All CSS in scoped `.module.css` files** per component, plus a `tokens.css` for global custom properties.
- **Components are pure presentational** unless they manage form state. Data fetching lives in page components.
- **Every interactive component has**: default state, hover state, focus state (visible ring), active state, disabled state (where applicable).
- **Every data component has**: loading state (skeleton), empty state (illustration + message), error state (message + retry), populated state.

### 6.3 Component Specifications

#### Button
- Rounded (`--radius-md`)
- Two variants: primary (navy bg, white text), secondary (white bg, navy border, navy text), ghost (no border, navy text on hover)
- Two sizes: default (40px height), small (32px height)
- Loading state: shows spinner, disables interaction
- Active state: `scale(0.97)` for tactile feedback
- Transition: 200ms ease

#### Card
- White background (`--color-surface-elevated`)
- Border: `1px solid var(--color-border)`
- Border radius: `--radius-md`
- Shadow: `--shadow-sm` (only on interactive cards)
- Padding: `--space-5` (20px)
- Variants: static (no shadow), interactive (shadow-sm, hover:shadow-md), elevated (shadow-lg for modals)

#### Badge / StatusBadge
- Inline pill shape
- Text: `--text-xs`, weight 600
- Padding: 4px 10px
- Border radius: `--radius-full`
- Colors: mapped from status token (Section 3.2)
- Dot indicator: 6px circle, same color as text, margin-right 6px

#### Input
- Height: 44px (touch target minimum)
- Border: `1px solid var(--color-border)`, radius `--radius-md`
- Focus: ring `2px solid var(--color-focus)` with 2px offset
- Error: border `1px solid var(--color-danger)`, error text below in `--text-xs --color-danger`
- Label above input, `--text-sm` weight 500
- Placeholder: `--color-text-muted`, never used as label replacement

#### Modal
- Overlay: `rgba(27, 58, 92, 0.4)` with `backdrop-filter: blur(4px)`
- Content: white, `--radius-lg`, `--shadow-lg`
- Max width: 520px (forms), 720px (data)
- Animation: fade in overlay, scale up content (0.95 -> 1, 300ms ease)
- Close button top-right, Escape key closes

#### Calendar
- 7-column grid (Sun-Sat or Mon-Sun per locale)
- Cells: 40x40px tap target minimum
- Today: subtle circle outline
- Selected: filled navy circle, white text
- Blocked (unavailable): gray fill, strikethrough text, cursor not-allowed
- Crowd meter: small colored dot bottom-center of each cell
- Month nav: left/right arrows + month/year label
- Swipeable on mobile

#### CrowdMeter (legend)
- Three horizontal pills: green dot + "Low (0-3)", orange dot + "Medium (4-7)", red dot + "Full (8+)"
- Placed below the calendar

#### TimeSlotPicker (admin only)
- Grid of time slot blocks (30min intervals)
- Available: white bg, navy border, clickable
- Booked: light gray fill, doctor name or "Booked" label, not clickable
- Unavailable (doctor): light red fill, "Unavailable" label, not clickable
- Selected: navy fill, white text
- Current selection highlighted with accent border

---

## 7. Page Designs

### 7.1 Landing Page (`/`)

**Layout:**
```
┌─────────────────────────────────┐
│          Minimal Nav             │  ← logo + Book Appointment CTA
├─────────────────────────────────┤
│  Hero Section                    │
│  "Gentle care. Modern dentistry."│  ← H1 (Satoshi 900)
│  Subtext (max 20 words)          │  ← Inter 400, max-width 55ch
│  [Book Appointment] CTA          │  ← Primary button
│  (professional photo of clinic/  │
│   doctor if available)           │
├─────────────────────────────────┤
│  Services Section                │
│  "Treatments" (section heading)  │  ← Satoshi 700
│  3-4 service cards in grid       │  ← card: icon + name + description
│  Fetched from /api/services      │
├─────────────────────────────────┤
│  Why Choose Us Section           │
│  3 value props (asymmetric grid) │  ← e.g. "Same-day appointments"
│  icon + heading + body           │       "Digital X-rays"
│  Left-aligned content            │       "Insurance handled"
├─────────────────────────────────┤
│  CTA Section                     │
│  "Ready to book?" (heading)      │
│  Subtext + [Book Now] button     │
├─────────────────────────────────┤
│  Footer                          │
│  Clinic name, address, phone,    │
│  hours, social links             │
└─────────────────────────────────┘
```

**Mobile collapse:** Single column, Hero stacks vertically (image below text), services become scroll-snap horizontal row, values stack vertically.

**Key behaviors:**
- Nav: transparent on hero, solid white on scroll with subtle shadow
- Book CTA in nav scrolls or navigates to `/book` (or `/login` if unauthenticated)
- Service cards: `fetch` on mount from `/api/v1/services`
- All sections use `max-width: var(--content-max)` centered

### 7.2 Patient Login (`/login`)

- Centered card layout on clean background
- Clinic logo at top
- "Welcome back" heading
- Email input + Password input + "Remember me" checkbox
- Submit button: "Sign in" (full width)
- "Don't have an account? Register" link below
- Error states: inline error messages below fields
- Redirect to `/book` on success (or return URL)

### 7.3 Patient Register (`/register`)

- Same centered card layout as login
- "Create your account" heading
- Name, Email, Password, Phone (optional), Date of Birth (optional)
- Submit: "Create account"
- "Already have an account? Sign in" link below
- Auto-login on success, redirect to `/book`

### 7.4 Book Appointment (`/book`) — Protected

**Three-step flow in a single page with progress indicator:**

```
Step 1: Select Service       Step 2: Pick Date       Step 3: Confirm
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│ ○ Dental Checkup     │   │   < August 2026 >    │   │ Checkup              │
│ ○ Teeth Cleaning     │   │ Mo Tu We Th Fr Sa Su │   │ August 15, 2026      │
│ ○ Filling            │   │      1  2  3  4  5   │   │                      │
│ ○ Root Canal         │   │  6  7  8  9 10 11 12 │   │ [Confirm Booking]    │
│ ○ Other...           │   │ 13 14 15 16 17 18 19 │   │                      │
│                      │   │ 20 21 22 23 24 25 26 │   │                      │
│ [Continue]           │   │ 27 28 29 30 31       │   │                      │
└──────────────────────┘   │ ● Low ○ Medium ○ Full│   └──────────────────────┘
                           └──────────────────────┘
```

- Step indicator at top: 3 dots or "Service / Date / Confirm" labels
- Calendar cells show crowd meter dot (green/orange/red)
- Blocked dates (doctor unavailable) shown with diagonal line or gray fill, not clickable
- Available dates are clickable
- "Other" service opens a text area for custom description
- On confirm: POST `/api/v1/appointments` -> redirect to `/my-appointments`

### 7.5 My Appointments (`/my-appointments`) — Protected

```
┌─────────────────────────────────────────┐
│ My Appointments             [+ New]     │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Aug 15, 2026  ● Pending            │ │
│ │ Dental Checkup                     │ │
│ │ Requested: Jul 30, 2026            │ │
│ │                         [Cancel]   │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Aug 10, 2026  ● Accepted           │ │
│ │ Teeth Cleaning                      │ │
│ │ Time: 10:30 AM - 11:00 AM          │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Jul 25, 2026  ● Rejected           │ │
│ │ Filling                             │ │
│ │ Reason: Need X-ray first            │ │
│ │ Suggested: Aug 1, 2026             │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

- List sorted newest first
- Each card: date left, status badge right, service name, details below
- Accepted: shows time slot
- Rejected: shows reason + suggested date
- Cancelled: gray badge
- Cancel button only on `pending` appointments
- Confirmation dialog before cancel
- Empty state: illustration + "No appointments yet" + "Book your first appointment" CTA

### 7.6 Admin Login (`/admin/login`)

- Minimal, clean, centered card
- Small lock icon or shield graphic
- No email field (email is pre-known, DB-seeded)
- Single password input + "Remember me" checkbox + "Sign in" button
- Error state: "Invalid credentials" message
- Redirect to `/admin/dashboard`

### 7.7 Admin Dashboard (`/admin/*`) — Protected (lazy-loaded)

**Layout:**
```
Mobile:                    Desktop:
┌──────────────────┐     ┌─────────────┬──────────────────────┐
│ Dashboard Header │     │ Sidebar     │  Main Content Area   │
├──────────────────┤     │ ◉ Home      │  (scrollable)        │
│ Content Area     │     │ ◉ Requests  │                      │
│ (scrollable)     │     │ ◉ Today     │                      │
│                  │     │ ◉ Patients  │                      │
│                  │     │ ◉ Schedule  │                      │
│                  │     │ ◉ Settings  │                      │
├──────────────────┤     └─────────────┴──────────────────────┘
│ Bottom Tab Bar   │
└──────────────────┘
```

**Sections:**

**Home:** 4 metric cards (Today's count, Pending count, Total patients, Today's schedule summary), recent activity list.

**Requests (Pending appointments):** Filtered list of pending appointments. Each row: patient name, date, service, time since created. Action buttons: Accept (opens TimeSlotPicker modal), Reject (opens reason modal).

**Today:** Chronological list of today's accepted appointments. Actions: Arrived (marks arrived_at), Complete (marks completed + opens PrescriptionForm modal).

**Patients:** Search input (filter by name/email) + patient list. Click -> expanded view with appointment history, prescriptions.

**Schedule (Unavailability):** List of unavailability entries with delete. Add form: date, start/end time, recurring dropdown, reason.

**Settings:** Clinic info form (name, address, phone). Change password form (current, new, confirm).

---

## 8. Motion & Interaction

### 8.1 Transition Defaults

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
```

### 8.2 Interaction Patterns

| Element | Hover | Focus | Active | Transition |
|---------|-------|-------|--------|------------|
| Button (primary) | Slightly darker bg | Focus ring 2px | scale(0.97) | 200ms ease-out |
| Button (secondary) | Light navy bg tint | Focus ring 2px | scale(0.97) | 200ms ease-out |
| Card (interactive) | shadow-md, slight -translateY(2px) | Focus ring | shadow-sm | 250ms ease-out |
| Input | Border slightly darker | Focus ring 2px | - | 200ms ease-out |
| Link (inline) | Underline | Focus ring | opacity 0.8 | 150ms ease-out |
| Nav link | bg tint on mobile | Focus ring | - | 200ms ease-out |

### 8.3 Page Transitions

- Route changes: subtle fade (opacity 0->1, 300ms)
- Admin section changes inside dashboard: no page transition (instant, feels like single-page app)

### 8.4 Scroll Reveal

- Sections on patient-facing pages: fade-up on scroll into view (translateY(24px) to 0, opacity 0 to 1, 600ms, 100ms stagger between elements)
- Admin dashboard: no scroll reveal (data density matters more)
- Honor `prefers-reduced-motion`: all animations collapse to instant

### 8.5 Micro-interactions

- Modal open: backdrop fade (300ms), content scale from 0.95 (300ms ease-out)
- Modal close: fade out (200ms)
- Status change (e.g., appointment accepted): brief highlight pulse on the changed row
- Toast notifications: slide in from top-right, auto-dismiss after 4s
- Empty states: subtle floating illustration (CSS animation, 6s loop, only on patient pages)

---

## 9. Light / Dark Mode

### 9.1 Strategy

CSS custom properties swapped via `prefers-color-scheme` media query. No manual toggle initially (can be added later). Both modes tested equally.

### 9.2 Dark Mode Values

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #0F172A;
    --color-surface-elevated: #1E293B;
    --color-surface-muted: #1A2332;
    --color-primary: #E2E8F0;
    --color-primary-hover: #F1F5F9;
    --color-accent: #5BB8A8;
    --color-accent-hover: #6ECFBE;
    --color-text: #E2E8F0;
    --color-text-secondary: #94A3B8;
    --color-text-muted: #64748B;
    --color-border: #334155;
    --color-border-light: #1E293B;
  }
}
```

### 9.3 Dark Mode Notes

- No pure black backgrounds. Deep navy-slate (`#0F172A`) provides a modern, premium dark mode without crushing contrast.
- Brand accent (teal) lightens by +10 lightness to maintain contrast on dark backgrounds.
- Shadows invert: light becomes dark, but reduced in intensity (glow effect rather than shadow).
- Status badges adjust slightly: backgrounds become more opaque to maintain contrast.

---

## 10. Accessibility

### 10.1 Targets

- WCAG 2.1 AA minimum (AAA for body text on patient pages)
- All interactive elements keyboard accessible
- Visible focus indicators on all interactive elements (2px solid accent ring + 2px offset)
- All form inputs have associated labels
- All images have meaningful `alt` text
- Color not used as the only indicator of state (status badges include text, not just color)

### 10.2 Reduced Motion

- All animations respect `prefers-reduced-motion: reduce` — instant transitions, no parallax, no scroll reveals
- Test toggling this OS-level setting before deployment

### 10.3 Touch Targets

- All interactive elements minimum 44x44px (WCAG 2.5.5)
- Adequate spacing between tappable elements (8px minimum)
- No hover-dependent interactions (must work on touch devices)

---

## 11. Responsive Strategy

| Component | Mobile (<640px) | Tablet (640-1023px) | Desktop (1024px+) |
|-----------|----------------|---------------------|-------------------|
| Nav | Logo + hamburger icon | Logo + hamburger icon | Logo + links + CTA button |
| Hero | Stacked (text then image) | Split 50/50 | Split 50/50 or 60/40 |
| Service cards | Horizontal scroll-snap | 2-column grid | 3-column grid |
| Values | Single column | 2-column grid | 3-column grid |
| Booking flow | Full-screen steps | Centered card | Centered card (max 720px) |
| Appointments list | Single column | 2-column grid | 2-column grid |
| Admin dashboard | Single column, bottom tabs | 2-column, sidebar collapsed | Sidebar + content |
| Footer | Stacked | 2-column | 3-column |

---

## 12. Implementation Notes

### 12.1 CSS Architecture

- Single `tokens.css` file with all CSS custom properties (colors, spacing, typography, shadows, radii)
- `reset.css` for normalize (box-sizing, margin removal, font smoothing)
- `base.css` for HTML element defaults (headings, paragraphs, links, lists)
- Component-scoped `.module.css` files for all components
- Admin CSS loaded lazily with admin routes to keep patient bundle lean

### 12.2 Loading States

- **Skeleton components** matching the exact layout shape (no generic spinners)
- Skeleton animation: subtle shimmer (linear gradient sweep, 1.5s loop)
- Skeleton uses `--color-surface-muted` as base with `--color-border-light` as shimmer highlight

### 12.3 Empty States

Each list/collection view has a dedicated empty state:
- Illustration (simple SVG, 120x120px, single color using currentColor)
- Heading: "Nothing here yet" or context-specific
- Subtext: explanation + suggested action
- CTA button when applicable

### 12.4 Error States

- Inline errors below form fields (red text, small)
- Toast for transient errors (API failures, network issues)
- Full-page error only for catastrophic failures (404, 500)
- Error messages are human-readable: "Could not load appointments. Please try again." — never raw error codes

---

## 13. Design Verification Checklist

- [ ] All text meets WCAG AA contrast (4.5:1 body, 3:1 large text)
- [ ] Focus rings visible on all interactive elements
- [ ] Touch targets minimum 44x44px
- [ ] `prefers-reduced-motion` respected
- [ ] Dark mode tested (all sections legible)
- [ ] Mobile-first rendering verified (375px viewport)
- [ ] No Inter as display face (Satoshi for headings)
- [ ] No AI-purple gradients
- [ ] No beige+brass premium-consumer palette
- [ ] No em-dashes in copy
- [ ] No section numbering eyebrows
- [ ] Hero fits viewport (headline max 2 lines, subtext max 20 words, CTA visible)
- [ ] No fake screenshots or div-based mockups
- [ ] One accent color used consistently across all sections
- [ ] All animations justified (hierarchy/feedback/storytelling)
- [ ] Admin code lazy-loaded (verify in network tab)
- [ ] Empty states, loading states, error states present on all data components

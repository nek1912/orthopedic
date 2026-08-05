# Design System — Dental Clinic Website

## 1. Design intent

This website is for a real dental clinic, not a generic SaaS product. The default theme must feel calm, clinical, trustworthy, and easy to navigate on mobile. Every page should communicate three things immediately:

1. This is a professional clinic.
2. Booking is simple.
3. Patient information is handled carefully.

The design should feel premium without looking decorative, flashy, or template-driven. The visual language should be consistent across the entire website: public landing pages, patient flows, login/register, and admin dashboard.

## 2. Core principles

### 2.1 Mobile first

Design for small screens first. Desktop should be an expansion of the same system, not a separate composition.

### 2.2 Calm over loud

Use restrained color, measured spacing, and soft contrast. Avoid bright gradients, neon accents, dense shadows, and oversized decorative shapes.

### 2.3 Trust over novelty

Use familiar interaction patterns. The distinctive part of the site should come from clarity, not gimmicks.

### 2.4 One job per section

Each section should do one thing only. Avoid multi-purpose blocks that mix marketing, navigation, and form logic in the same visual unit.

### 2.5 Booking is the primary action

The site exists to help patients understand the clinic and request an appointment. Booking should always be visually prioritized.

### 2.6 Admin and patient stay visually aligned

The patient side and admin side should share the same design system, but the admin interface may be denser and more operational. The theme must still feel like one product.

## 3. Brand personality

The brand should feel:

* clean
* precise
* quiet
* caring
* competent
* medically trustworthy
* premium, but not luxurious in a showy way

Avoid personalities that feel:

* playful
* tech startup-like
* loud or aggressive
* overdesigned
* “AI-generated”

## 4. Color system

The default theme uses a warm-neutral clinic palette with one disciplined accent.

### 4.1 Base palette

* `#FBFAF7` — page background
* `#F4F0E8` — soft section background
* `#E7DDD1` — subtle border / dividers
* `#D4C6B4` — muted neutral accent
* `#1F3A3A` — primary deep teal
* `#123131` — stronger teal for emphasis
* `#7C6A57` — muted gold / warm text accent
* `#3B4342` — body text
* `#6D7473` — secondary text
* `#FFFFFF` — cards / surfaces

### 4.2 Semantic colors

* Success: `#2E7D6B`
* Warning / busy: `#C8892B`
* Error: `#B54848`
* Info: `#4A6FA5`
* Disabled / inactive: `#A9B0AE`

### 4.3 Usage rules

* Use teal as the primary action color.
* Use gold only as a restrained secondary accent.
* Use red only for errors, rejection, and critical conflict states.
* Never use more than one strong accent in the same component unless it communicates state.
* Keep gradients subtle or avoid them entirely.

## 5. Typography

Typography should feel refined, readable, and medically appropriate.

### 5.1 Type roles

* Display / hero: a high-contrast serif or elegant editorial face
* Body: a clean humanist sans-serif
* Utility / data: a compact monospace or tabular sans

### 5.2 Recommended type behavior

* Headlines may use a serif face for personality.
* Body text must remain highly readable at small sizes.
* Buttons, labels, form inputs, and navigation should use the body face.
* Dates, counts, calendar labels, queue metrics, and appointment status may use tabular numerals.

### 5.3 Type scale

Use a compact and controlled scale.

* Hero headline: 48–64px desktop, 34–40px mobile
* Section title: 28–36px desktop, 22–28px mobile
* Card title: 18–22px
* Body: 15–17px
* Small label: 12–13px with letter spacing
* Data / stats: 18–32px depending on importance

### 5.4 Typographic rules

* Sentence case by default.
* Avoid all-caps paragraphs.
* Use strong hierarchy, not excessive font variation.
* Line length should stay comfortable on desktop.
* Avoid too many font weights.

## 6. Layout system

### 6.1 Grid

* Mobile: single column
* Tablet: 2 columns where useful
* Desktop: 12-column layout with clear gutters

### 6.2 Spacing

Use a consistent spacing scale:

* 4, 8, 12, 16, 24, 32, 40, 48, 64, 80

Preferred section padding:

* Mobile: 20–24px horizontal, 40–56px vertical
* Desktop: 64–96px horizontal section breathing room where needed

### 6.3 Containers

* Max content width: 1200–1320px
* Hero may extend visually wider, but content should remain controlled
* Cards should not span full width unless intentionally functional

### 6.4 Surface hierarchy

Use three surface levels only:

1. Page background
2. Section surface / soft panel
3. Card / elevated surface

Avoid introducing unnecessary layers.

## 7. Shape and depth

### 7.1 Radius

Use one consistent radius system:

* Small controls: 10–12px
* Cards: 18–24px
* Hero panels: 24–32px

### 7.2 Shadow

Shadows must be soft and sparse.

* Prefer subtle border + slight elevation over heavy shadows
* Never use dramatic blurred shadows
* Shadow should indicate hierarchy, not decoration

### 7.3 Borders

Use thin neutral borders for structure.

* Default border: `1px solid #E7DDD1`
* Selected state may use teal border or subtle fill

## 8. Interaction design

### 8.1 Motion

Motion should be calm and useful.

Use motion for:

* page load reveal
* hover lift on cards
* calendar selection transitions
* accordion expansion
* modal open/close
* status changes

Avoid:

* constant floating animation
* unnecessary parallax
* overly bouncy transitions

### 8.2 Motion timing

* Fast UI feedback: 120–160ms
* Normal transitions: 180–240ms
* Larger reveal animations: 240–320ms

### 8.3 Hover behavior

* Cards can lift slightly or gain border emphasis
* Buttons can darken or shift by a subtle amount
* Interactive days in calendar should clearly respond

### 8.4 Reduced motion

Respect reduced-motion preferences. Provide static alternatives where needed.

## 9. Accessibility requirements

* Maintain visible keyboard focus states on all interactive elements
* Ensure sufficient color contrast
* Use semantic headings and landmarks
* Avoid relying on color alone to communicate status
* Ensure touch targets are large enough on mobile
* Never hide essential booking information inside hover-only interactions
* Provide clear empty states and error states

## 10. Voice and content style

Content should sound like a clinic, not a brand campaign.

### 10.1 Writing style

* Plain
* Reassuring
* Direct
* Specific
* Short sentences preferred

### 10.2 Avoid

* hype
* vague claims
* sales language
* dramatic promises
* jargon without explanation

### 10.3 Buttons and actions

Buttons should say exactly what they do.
Examples:

* Book appointment
* Sign in
* Create account
* View my appointments
* Save changes
* Update availability
* Mark as completed

### 10.4 Status labels

Use plain operational language.
Examples:

* Pending review
* Accepted
* Rejected
* Completed
* Cancelled
* Waiting for slot assignment
* Available
* Moderate crowd
* Busy
* Unavailable

## 11. Signature visual idea

The main distinctive element of the website is the appointment-day density calendar.

This should appear in the booking flow and in condensed form on the landing page. It communicates:

* busy days
* moderate days
* available days
* blocked days
* selected day

The calendar should feel like a clinic scheduling tool, not a travel app and not a stock chart. It should be simple enough for patients, but informative enough to build trust.

## 12. Page-level theme rules

### 12.1 Global header

* Clean navigation bar
* Logo on the left
* Primary actions on the right
* Sticky on scroll if it improves usability
* Keep it compact on mobile

### 12.2 Hero section

* Strong headline
* Brief supporting explanation
* One primary CTA
* One secondary CTA
* Strong clinic image or brand visual
* One trust strip below the CTAs

### 12.3 Services section

* Simple service cards
* Each card should show only the service name and a short description
* Use icons sparingly
* Do not overload with decorative graphics

### 12.4 Doctor section

* Professional portrait or clinic-authentic visual
* Focus on experience, care style, and trust
* Keep the copy factual and concise

### 12.5 Booking section

* Explain day-based booking clearly
* Show availability states
* Ask for essential details only
* Keep form steps minimal
* Use a clear confirmation state after submission

### 12.6 Why choose us

* Four concise cards maximum on desktop
* On mobile, stack cleanly
* Focus on practical benefits: minimal waiting, clear communication, modern clinic, transparent care

### 12.7 Footer

* Contact details
* Hours
* Quick links
* Social links if needed
* Legal links
* Keep it dense but readable

## 13. Component system

### 13.1 Core components

* Button
* IconButton
* Input
* Select
* Textarea
* Badge
* StatusBadge
* Card
* Modal
* Toast
* CalendarDay
* CalendarLegend
* AppointmentListItem
* StatTile
* EmptyState
* Skeleton
* Divider
* Tabs
* Accordion

### 13.2 Component rules

* Components should be reusable across patient and admin areas
* Keep states consistent
* One component should serve one primary purpose
* Do not create duplicate versions of the same control

## 14. Patient website theme behavior

### 14.1 Landing page

The landing page must be the most polished public surface.
It should establish:

* clinic identity
* services
* doctor trust
* booking process
* availability concept

### 14.2 Appointment booking

The patient books a day, not a time slot.
The UI should make that explicit.

Required booking states:

* logged out
* signed in
* form editing
* submission pending
* submitted
* accepted
* rejected
* alternate day suggested
* slot assigned later on admin side

### 14.3 Patient account pages

* Login and register should stay visually consistent with the landing page
* Avoid isolated auth screens that feel unrelated
* Keep forms simple and calm

## 15. Admin dashboard theme behavior

The admin dashboard should use the same system but feel denser and more operational.

### 15.1 Admin design goals

* Fast scanning
* Clear status hierarchy
* Compact information architecture
* No decorative clutter
* High clarity for today’s patients, requests, availability, and notes

### 15.2 Admin-specific emphasis

* Appointment queue
* Today’s schedule
* Accepted / rejected requests
* Patient history
* Prescription notes
* Unavailability management
* Time slot assignment

### 15.3 Admin density rules

* More data per screen is acceptable
* The interface must remain readable and not feel crowded
* Use tables, lists, and split panels where appropriate

## 16. Status and density language

The design must use status consistently.

Examples:

* Busy day: warm amber tint, dense calendar dot, clear label
* Moderate day: muted neutral or softer amber
* Available day: teal or green tint
* Unavailable day: greyed out with strike or block state
* Selected day: strong outline and filled highlight

Do not overcomplicate status colors.

## 17. Imagery and illustration

### 17.1 Photography style

If using photographs, they should be:

* bright but not overexposed
* clinical and tidy
* authentic, not stock-photo looking
* clean dental environment
* professional doctor portrait

### 17.2 Illustration style

If using illustrations or icons:

* keep them minimal
* use outline style or light filled style, not mixed sets
* avoid cartoonish imagery

### 17.3 Do not use

* random abstract art that does not support the clinic theme
* oversized hero decorations that compete with the booking message

## 18. Responsive behavior

### 18.1 Mobile

* Single column
* Large CTAs
* Compressed navigation
* Stacked cards
* Calendar should be easy to tap
* Avoid side-by-side content unless it improves usability

### 18.2 Tablet

* Balanced two-column layouts where useful
* Maintain ample spacing

### 18.3 Desktop

* Use wider compositions carefully
* Hero can become split layout
* Booking/calendar sections can use paired panels
* Do not make the page feel sparse

## 19. SEO and content structure

The theme must support SEO-friendly pages.

* One H1 per page
* Clear H2 and H3 hierarchy
* Real text content, not text embedded in images
* Metadata support
* Semantic sections
* FAQ blocks where useful
* Local clinic contact details in the footer
* Service pages should be indexable if they exist

## 20. Design do-not-list

Do not use:

* generic SaaS gradient heroes
* bright blue/purple startup themes
* heavy glassmorphism
* loud neumorphism
* cartoon mascots
* excessive motion
* dense neon dashboards
* cluttered card walls
* random icon grids without function
* templates that look like a generic “modern website builder” output

## 21. Implementation guidance for developers

### 21.1 Source of truth

Keep design tokens in a single place and use them throughout the app.

### 21.2 CSS approach

* Use semantic component classes or a disciplined utility layer
* Avoid ad hoc styling patterns that drift across pages
* Keep spacing and color choices tied to tokens

### 21.3 Theme consistency

* The patient site, auth screens, and admin dashboard should all inherit from the same token set
* Only density and layout should change between areas, not the core identity

### 21.4 Default theme rule

This design system is the default theme across the whole website unless a page explicitly requires a denser operational variant. The same colors, typography, controls, radius, and motion rules should apply everywhere.

## 22. Final quality bar

A page is finished only when it is:

* obviously the same product on every screen
* easy to use on mobile
* visually calm and professional
* clearly connected to clinic scheduling
* free of generic AI-template feeling
* strong enough to show a real client without apology

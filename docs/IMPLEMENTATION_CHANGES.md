# Implementation Changes

This document records the UI, responsiveness, accessibility, and authentication work completed during this development session.

## UI, responsiveness, and accessibility

### Public layout alignment

- **Bug fixed:** Public pages did not occupy the full desktop viewport because the public layout shrink-wrapped inside the global `SidebarProvider` flex container.
- **Correction:** Added `w-full min-w-0 flex-1` to `app/(public)/layout.tsx`.
- **Result:** The home page now fills the available viewport width without creating horizontal overflow.

### Authentication layout alignment

- **Bug fixed:** Login and registration pages had the same shrink-wrapping issue, leaving unused space on large screens.
- **Correction:** Added `w-full min-w-0 flex-1` to `app/(auth)/layout.tsx`.
- **Result:** Both authentication pages now fill the viewport on desktop and remain overflow-free on mobile.

### Header and navigation

- **Bug fixed:** The scrolled header used a fixed `600px` width, which overflowed on narrow viewports.
- **Correction:** Replaced the fixed width with `w-full max-w-[600px]`.
- **Bug fixed:** The header gradient used the invalid Tailwind class `from-black.70`.
- **Correction:** Replaced it with `from-black/70`.
- **Accessibility improvements:** Added labels and expanded state to the mobile-menu control, labelled the close and overlay controls, and made the closed drawer inert so it cannot receive keyboard focus.
- **Motion improvements:** Replaced broad `transition-all` declarations with targeted transitions and reduced-motion fallbacks.

### Home page

- **Bug fixed:** The fixed navigation could overlap the hero branding.
- **Correction:** Added responsive top padding to the hero content.
- **Contrast improvement:** Strengthened the hero image overlay from a transparent gradient to dark overlay stops, preserving readable text over every part of the image.
- **Bug fixed:** Buttons wrapped links, creating invalid nested interactive controls.
- **Correction:** Converted all home-page CTA buttons to Shadcn `asChild` links.
- **Contrast improvement:** Updated the light-section “View Full Menu” CTA to `amber-800`, achieving WCAG AA contrast.
- **CTA correction:** Changed hero outline CTAs to transparent ghost buttons so Shadcn’s white outline background cannot hide their labels.

### Product cards and motion

- **Feature added:** Added `components/Home/componenets/MotionCard.tsx` using the installed `motion` library.
- **Behavior:** Product cards fade in once as they enter the viewport and lift by 4px on hover.
- **Accessibility:** Motion is disabled when the user requests reduced motion.
- **Refinement:** Card shadows now use a targeted shadow transition rather than `transition-all`.

### Menu and product-detail responsiveness

- **Bug fixed:** Menu loading skeletons used a different tablet breakpoint than loaded cards, causing a layout shift.
- **Correction:** Skeletons now use `sm:grid-cols-2`, matching the product grid.
- **Bug fixed:** Product feature cards and size/sweetness choices could clip on narrow screens.
- **Correction:** Feature cards stack before the `sm` breakpoint; option groups stack then wrap safely.
- **Accessibility improvement:** Related products use one column on extra-small screens, and truncated product names now expose their full value through a `title` attribute.

### Global reduced-motion support

- **Feature added:** Added a global `prefers-reduced-motion` rule in `app/globals.css` that effectively disables non-essential animation and smooth scrolling.

## Authentication and login verification

### Login origin failure

- **Bug fixed:** Seeded users could not log in because Better Auth was configured with `https://localhost:3000` while the local app was served on `http://localhost:3000`.
- **Observed error:** `403 Invalid origin` from `/api/auth/sign-in/email`.
- **Correction:** Updated the local `BETTER_AUTH_URL` in `.env` to use `http`.
- **Result:** The seeded admin account can now authenticate and receive a session cookie.

### Login smoke test

- **Feature added:** Created `scripts/test-login.ts`.
- **Feature added:** Added `npm run test:login`.
- **Behavior:** The test submits an HTTP request to Better Auth’s email login endpoint and fails on rejected credentials, invalid origin responses, or a missing session cookie.
- **Configuration:** Credentials are supplied through `LOGIN_TEST_EMAIL` and `LOGIN_TEST_PASSWORD`; `LOGIN_TEST_BASE_URL` can override the configured local URL.

Example:

```bash
LOGIN_TEST_EMAIL="your-email" \
LOGIN_TEST_PASSWORD="your-password" \
npm run test:login
```

## Verification completed

- Targeted ESLint and TypeScript checks pass for the implementation changes.
- Playwright confirmed that the home layout fills the desktop viewport and has no horizontal overflow.
- Playwright confirmed that login and registration pages fill a 1440px viewport; login also has no overflow at 375px.
- The login smoke test passes for the seeded admin account and confirms a session cookie is issued.

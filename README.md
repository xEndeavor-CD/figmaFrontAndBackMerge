# STICK LEAGUE Front-End UI / UX / Assets README

## Project Overview

**STICK LEAGUE** is a cream-and-black, hand-drawn e-sport landing experience built as a React front-end. The experience is designed around a full-screen animated sketch scene, clickable environmental objects, video-led transitions, an arena door selection page, feature pages behind each door, and an authentication flow with animated login/logout controls.

The visual direction is intentionally playful, minimal, and sketch-like: off-white paper backgrounds, black ink borders, hand-drawn typography accents, soft shadows, and motion that feels like animated doodles rather than standard SaaS UI.

---

## Tech Stack

- **React 18**
- **TypeScript**
- **Vite / Figma Make runtime**
- **Tailwind CSS**
- **motion/react** for page and UI transitions
- **lucide-react** for interface icons
- Local imported video assets from `src/imports/`
- Custom CSS tokens in `src/styles/theme.css`
- Google Fonts imported in `src/styles/fonts.css`

---

## Main Files

### `src/app/App.tsx`
Main application shell and page state manager.

Contains:
- Landing page layout
- Page transition wrapper
- Login state
- Auth page
- Feature pages
- Login/logout animated buttons
- Shared logo and back button

### `src/app/components/InteractiveBackground.tsx`
Full landing-page animated scene.

Contains:
- Seamless looping background video
- Clickable football hotspot
- Clickable portal hotspot
- Juggling/kicking animation switching
- Portal transition into arena

### `src/app/components/DoorsPage.tsx`
Arena door selection page.

Contains:
- Main doors video loop
- Transition video handoff
- Three clickable door hotspots
- Arena chrome/header
- Auth slot support

### `src/styles/fonts.css`
Google Font imports.

Current fonts:
- `Bebas Neue` — large display titles and STICK LEAGUE branding
- `Caveat` — handwritten notes and sketch captions
- `Space Grotesk` — UI labels, body copy, buttons, forms

### `src/styles/theme.css`
Tailwind-compatible design tokens and component CSS.

Contains:
- Core color tokens
- Dark-mode token block preservation
- Tailwind `@theme inline` mappings
- Base typography defaults
- Animated login/logout button CSS

### `src/imports/`
Asset folder containing video and imported HTML references.

Important imported/reference files:
- `logout-button_prime.html` — source design for animated logout button
- `login__7_.html` — source design reference for login/register panel toggle
- Multiple `.mp4` animation clips used in the experience

---

## Page Structure

The app uses internal React state instead of URL routing.

Current page states:

```ts
type Page = "landing" | "doors" | "login" | "teams" | "matches" | "training";
```

### 1. Landing Page

Purpose:
- Brand introduction
- Interactive animated scene
- Entry point into the arena

Main UX:
- The whole background acts as the interactive scene.
- User can click the football to trigger juggling/kicking animations.
- User can click the portal to trigger portal animation and move to the arena.
- Auth button appears in header:
  - Logged out: **Log In**
  - Logged in: **Log Out**

Visual elements:
- STICK LEAGUE logo
- Navigation labels: Teams, Matches, Arena, About
- Large display title: `STICK LEAGUE`
- Handwritten tagline: `where doodles go pro.`
- CTA buttons: Join the League, Watch Matches
- Footer: season/live status

### 2. Doors / Arena Page

Purpose:
- Let user choose one of three feature paths.

Main UX:
- Background is video-only.
- Main doors video alternates with a transition clip.
- The main video hands off milliseconds before ending so there is no awkward freeze.
- Door hotspots are clickable but subtle.
- Hotspots reveal labels only on hover/focus.

Doors:
- **Teams** → Teams feature page
- **Matches** → Matches feature page
- **Training** → Training feature page

### 3. Feature Pages

Each door opens a simple working feature page.

Shared structure:
- Back button to return to arena
- STICK LEAGUE logo
- Conditional auth button
- Large display heading
- Short description
- Stats cards
- Action list buttons

Feature pages:

#### Teams
Content:
- Build your squad
- Draft players, assign roles, lock formation
- Stats: active squads, tryouts, chemistry
- Actions: create roster, invite captain, set kit colors

#### Matches
Content:
- Match control room
- Queue fixtures, track brackets, publish highlights
- Stats: games today, goals logged, final time
- Actions: schedule match, open bracket, post replay

#### Training
Content:
- Practice the trickbook
- Juggling drills, reaction tests, arena challenges
- Stats: drills ready, session length, form boost
- Actions: start drill, review form, save routine

### 4. Login Page

Purpose:
- Auth UI with only one section visible at a time.

Main UX:
- Login page does **not** show a login button in the header.
- Login page always shows the animated **Log Out** button in the header.
- The page defaults to the Login section.
- User can toggle to Register using the inline link.
- User can toggle back to Login from Register.
- Login/register submit marks the user as logged in and routes to the arena.

Desktop behavior:
- Two-panel design inspired by `login__7_.html`.
- Dark brand panel slides left/right when switching between login and register.
- Form panel moves opposite the brand panel.
- Form content fades/slides during mode change.

Mobile behavior:
- Layout remains stable.
- Form content swaps cleanly without relying on large horizontal panel travel.

Login section fields:
- Email address
- Password
- Remember me checkbox
- Forgot password link
- Demo access note

Register section fields:
- First name
- Last name
- Email address
- Password

---

## Authentication UX State

Authentication is simulated with local React state:

```ts
const [isLoggedIn, setIsLoggedIn] = useState(false);
```

Behavior:
- When `isLoggedIn === false`, pages show **Log In**.
- When `isLoggedIn === true`, pages show **Log Out**.
- Login/register submit sets `isLoggedIn` to `true` and routes to arena.
- Logout sets `isLoggedIn` to `false` and routes to landing.

No backend authentication is currently connected.

---

## Animated Login / Logout Buttons

The animated logout button is adapted from:

```txt
src/imports/logout-button_prime.html
```

Implemented as:
- `PrimeDoorButton`
- `DoorFigure`
- CSS classes in `src/styles/theme.css`

Variants:

```tsx
<PrimeDoorButton variant="login" label="Log In" />
<PrimeDoorButton variant="logout" label="Log Out" />
```

### Logout Animation

Sequence:
1. Door opens.
2. Stick figure walks toward door.
3. Door slams.
4. Figure falls/spins away.
5. Logout completes and user returns to landing.

### Login Animation

Sequence:
1. Door opens.
2. Figure moves inward.
3. User is routed to login page.

The button uses CSS custom properties for limb animation states:
- `--figure-duration`
- `--transform-figure`
- `--walking-duration`
- `--transform-arm1`
- `--transform-wrist1`
- `--transform-leg1`
- etc.

---

## Video Assets

The project relies heavily on local `.mp4` files in `src/imports/`.

### Landing Background

Imported in `InteractiveBackground.tsx`:

```ts
Line-art_background_animation_st__202606140228.mp4
```

Used as the seamless looping ambient scene.

### Football / Juggling Animations

Imported in `InteractiveBackground.tsx`:

```ts
Stickman_juggling_and_kicking_so__202606140242.mp4
Stickman_juggling_and_kicking_so__202606140243.mp4
```

Behavior:
- First football click randomly picks one variant.
- Back-to-back clicks switch to the other variant.
- Animation loops while active.
- Clicking anywhere exits back to the idle scene.

### Portal Animation

Imported in `InteractiveBackground.tsx`:

```ts
Stickman_pulled_into_portal_202606140256.mp4
```

Behavior:
- Portal hotspot triggers this clip.
- Page handoff happens slightly before final frame to avoid freeze.
- User moves to arena page.

### Doors / Arena Videos

Imported in `DoorsPage.tsx`:

```ts
smooth_the_motion_of_this_vide.mp4
video_202606171249.mp4
```

Behavior:
- Main doors video and transition clip alternate.
- Main-to-transition handoff occurs right before the main clip ends.
- Transition-to-main uses a longer crossfade.

---

## Hotspot UX

Hotspots are intentionally subtle to avoid distracting from the sketch animation.

### Football Hotspot

Location class:

```tsx
left-[40.5%] top-[89%] h-[20%] w-[11%]
```

Behavior:
- Sits directly on/inside the football.
- No pulsing effect.
- Border appears only on hover/focus.
- Label appears only on hover/focus.

### Portal Hotspot

Location class:

```tsx
left-[76%] top-[42%] h-[32%] w-[17%]
```

Behavior:
- Sits inside the portal vortex.
- Only active while landing scene is idle.
- Triggers portal video before navigation.

### Door Hotspots

Located in `DoorsPage.tsx`.

Approximate classes:

```tsx
Teams:    left-[24%] top-[54%] h-[48%] w-[20%]
Matches:  left-[50%] top-[52%] h-[52%] w-[22%]
Training: left-[76%] top-[54%] h-[48%] w-[20%]
```

Behavior:
- No pulse.
- Border and label appear on hover/focus.
- Clicking opens the assigned feature page.

---

## Visual Design System

### Color Palette

Primary aesthetic:
- Cream paper background
- Black ink foreground
- Warm muted surfaces
- Occasional muted gold accent

Core tokens in `theme.css`:

```css
--background: #efe9da;
--foreground: #2b2b2b;
--card: #f7f0df;
--primary: #2b2b2b;
--primary-foreground: #f3eee1;
--secondary: #e4d8bd;
--muted: #e8dfcd;
--accent: #d9b45f;
--border: rgba(43, 43, 43, 0.26);
```

### Typography

- Display headings: `Bebas Neue`
- Handwritten captions: `Caveat`
- UI/body text: `Space Grotesk`

Usage examples:
- `font-['Bebas_Neue']` for headings
- `font-['Caveat']` for handwritten notes
- `font-['Space_Grotesk']` for labels/forms/buttons

### Borders and Shadows

Common styling:
- `border-2` or `border-[3px]` using `#2b2b2b`
- Rounded pill buttons
- Chunky offset shadows like:

```tsx
shadow-[4px_4px_0_rgba(43,43,43,0.28)]
```

This gives the UI a physical paper-cutout/sketchbook feel.

---

## Motion Design

Motion principles:
- Smooth fades between pages
- Video-led transitions whenever possible
- No visible freezes or abrupt color flashes
- No distracting pulsing hotspot animations
- Button animations should feel playful but not visually noisy

### Page Transitions

Implemented with `AnimatePresence` and `motion.div`.

Landing and feature pages:
- Fade in/out

Doors page:
- Fade + slight scale-in

### Video Looping

`InteractiveBackground.tsx` uses `SeamlessLoopVideo`.

Reason:
- Native video looping can briefly flash/reseek.
- Seamless loop crossfades two video elements before the end of the clip.

---

## Accessibility Notes

Implemented:
- Buttons use semantic `<button>` elements.
- Hotspots have `aria-label` values.
- Hover states are paired with focus-visible states.
- Text has strong dark-on-light contrast.
- Form inputs have labels.
- Login/register toggles are real buttons.

Potential future improvements:
- Add URL routes for deep linking.
- Add keyboard instructions for scene hotspots.
- Add reduced-motion handling for large panel/video transitions.
- Add real form validation messaging.
- Add backend authentication.

---

## Current Limitations

- Authentication is front-end-only and not persistent.
- Login/register forms do not call an API.
- Navigation uses local component state, not React Router.
- Video files are large and may need compression for production.
- Door hotspot coordinates are tuned to the current video framing and may need adjustment if the video changes.

---

## How to Extend

### Add a New Door

1. Extend the `DoorFeature` type in `DoorsPage.tsx`.
2. Add a new hotspot in `DoorsPage`.
3. Add feature copy to `featureCopy` in `App.tsx`.
4. Update the page state union in `App.tsx` if needed.

### Connect Real Auth

1. Replace `loginSuccess` with an async API call.
2. Store auth token/session.
3. Update `isLoggedIn` from real auth state.
4. Replace logout with API/session cleanup.

### Replace Video Assets

1. Add new `.mp4` files to `src/imports/`.
2. Import them as ES modules in the relevant component.
3. Preserve the handoff timing logic to avoid freezes.
4. Retune hotspot coordinates if the framing changes.

---

## Build Verification

A temporary Vite entry was used to verify the current UI builds successfully.

The normal Figma Make runtime entry uses:

```ts
__figma__entrypoint__.ts
```

The production UI code currently compiles when tested with a temporary React root entry.

---

## Summary

This front-end is a playful, video-driven, line-art e-sport experience. The most important UX rules are:

1. Keep the full background interactive.
2. Keep hotspots subtle and non-pulsing.
3. Keep video transitions smooth with no frozen still frames.
4. Show only one auth action at a time based on login state.
5. Show only one auth form at a time on the login page.
6. Preserve the cream/black sketch identity across every page.

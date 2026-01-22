# 🍇 sNAKr Styles

sNAKr visual identity is mischievous, cozy, and modern.
The UI should feel clean and light, with grape-forward accents and playful moments that never reduce readability.

## Brand anchors

- Primary emoji: 🦝
- Hero fruit: 🍇
- Accent fruits: 🍎 🍓
- Mood: cozy tech, not sterile
- Rule: playful inside the app, calm outside the app

---

## Color system

This palette is designed for accessibility and for twinning with Nimbly without copying it.
Grapes are the hero. Apple and strawberry are accents only.

### Core tokens

#### Grape
- Grape 900: `#2A0A3D`
- Grape 800: `#3B0F57`
- Grape 700: `#4F1A73`
- Grape 600: `#6B2FA0`
- Grape 500: `#8A4BD6`
- Grape 400: `#A56BEE`
- Grape 300: `#C6A2F7`
- Grape 200: `#E3D6FD`
- Grape 100: `#F3EEFF`

#### Apple accent
- Apple 600: `#2E8B57`
- Apple 300: `#A7E4C2`

#### Strawberry accent
- Strawberry 600: `#D72661`
- Strawberry 300: `#F6A7C1`

#### Neutrals
- Ink 900: `#0F172A`
- Ink 700: `#334155`
- Ink 500: `#64748B`
- Ink 300: `#CBD5E1`
- Ink 100: `#F1F5F9`
- White: `#FFFFFF`
- Black: `#000000`

#### Utility
- Success: `#16A34A`
- Warning: `#F59E0B`
- Danger: `#DC2626`
- Info: `#2563EB`

---

## Light mode

- Background: `#FFFFFF`
- Surface: `#F8FAFC`
- Card: `#FFFFFF`
- Border: `#E2E8F0`
- Text primary: `#0F172A`
- Text secondary: `#334155`
- Muted text: `#64748B`

- Primary action: Grape 600 `#6B2FA0`
- Primary action hover: Grape 700 `#4F1A73`
- Primary subtle: Grape 100 `#F3EEFF`

- Accent Apple: Apple 600 `#2E8B57`
- Accent Strawberry: Strawberry 600 `#D72661`

---

## Dark mode

- Background: `#0B0610`
- Surface: `#12081B`
- Card: `#160A22`
- Border: `#2B1638`
- Text primary: `#F8FAFC`
- Text secondary: `#E2E8F0`
- Muted text: `#94A3B8`

- Primary action: Grape 400 `#A56BEE`
- Primary action hover: Grape 300 `#C6A2F7`
- Primary subtle: Grape 900 `#2A0A3D`

Accents remain the same but should be used sparingly in dark mode.

---

## Typography

Keep it modern, friendly, and readable.

- Font family: Inter (or system default)
- Headings: SemiBold
- Body: Regular
- Numbers: tabular where needed for counts and lists

Type scale:
- H1: 32
- H2: 24
- H3: 18
- Body: 16
- Small: 14
- Caption: 12

Line height:
- Headings: 1.2
- Body: 1.5

---

## Layout and spacing

- Max width (desktop content): 1100
- Grid: 12-column for desktop, 4-column for mobile
- Spacing scale: 4, 8, 12, 16, 24, 32, 48

Use whitespace to keep the app calm.

---

## Radius, borders, shadows

- Radius:
  - Buttons: 12
  - Cards: 16
  - Modals: 20
  - Chips: 999

- Borders:
  - 1px default
  - Use borders more than heavy shadows in light mode

- Shadows:
  - Light mode: subtle shadow only on elevated surfaces
  - Dark mode: reduce shadow, rely on contrast and borders

---

## Iconography and illustration

- Icon style: outline icons, rounded ends
- Keep icons simple and legible at 16 to 24px
- Use 🍇 as brand moments, not everywhere
- Avoid busy illustrations that compete with data

---

## Component styling rules

### Buttons
- Primary: Grape 600 (light) or Grape 400 (dark)
- Secondary: neutral surface with border
- Destructive: Danger
- Disabled: reduce opacity and remove shadow

### Chips and tags
Use for fuzzy states and labels.
- Plenty: neutral or subtle success tint
- OK: neutral
- Low: warning tint
- Almost out: stronger warning
- Out: danger tint

### Cards
- Clear hierarchy: title, state, action
- One primary action per card when possible

### Lists
- Show state first, details second
- Keep actions consistent: Used, Restocked, Ran out

### Receipt review
- Show parsed items with confidence indicators
- Default to safe actions
- Make confirm feel calm, not risky

---

## Motion

Motion should feel supportive, not flashy.

- 150 to 220ms transitions
- Ease out curves
- Micro-animations:
  - button press
  - chip state change
  - list item added/confirmed
- Avoid large bouncy motion

---

## Accessibility

Non-negotiables:
- Minimum contrast 4.5:1 for body text
- Do not rely on color alone for state
- Provide text labels for fuzzy states
- Focus rings visible in both modes
- Tap targets 44px minimum

---

## Visual vibe checklist

If the screen feels:
- crowded, reduce elements
- loud, reduce accent colors
- childish, reduce emoji frequency
- sterile, add grape subtle surfaces and warmer microcopy

The goal: mischievous, cozy, modern, trustworthy.

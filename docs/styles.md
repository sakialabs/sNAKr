# 🍇 sNAKr Styles

sNAKr visual identity is mischievous, cozy, and modern.
The UI should feel clean and light, with grape-forward accents and playful moments that never reduce readability.

## Brand anchors

- Primary emoji: 🦝
- Hero fruit: 🍇
- Accent: 🌿 Leaf Green
- Mood: cozy tech, not sterile
- Rule: playful inside the app, calm outside the app

---

## 🎨 Color System - Grape Purple (Logo-Matched)

This palette matches the grape logo exactly for instant brand cohesion.
Feels friendly + smart, not fintech-cold. Scales beautifully to dark mode.

### Core Grape Purples

#### Primary Grape: `#6A33A8`
The hero purple. Use for:
- Cards
- Primary buttons
- Focus states
- Active tabs

#### Deep Grape: `#652FA4`
Slightly darker. Use for:
- Hover states
- Pressed buttons
- Active tabs

#### Shadow Grape: `#622CA1`
Use for:
- Borders
- Subtle outlines
- Elevated card shadows (low opacity)

#### Soft Grape: `#8B5FC7`
Use for:
- Secondary buttons
- Highlights
- Badges
- Selected states in lists

### Accent Colors

#### Leaf Green: `#92C22D`
From the grape stem. Use sparingly for:
- "Good timing" signals
- "In stock" indicators
- Positive signals
- Subtle success states

**Important:** Purple stays boss. Green is seasoning, not the meal.

### Utility Colors

- Success: `#92C22D` (Leaf Green)
- Warning: `#F59E0B` (Soft amber, muted)
- Danger: `#DC2626` (Warm red, reduced saturation)
- Info: `#6A33A8` (Primary Grape)

---

## Light Mode

### Surfaces
- Background: `#FFFFFF`
- Surface: `#F8FAFC`
- Card: `#FFFFFF`
- Border: `#E2E8F0`

### Text
- Primary: `#0F172A`
- Secondary: `#334155`
- Muted: `#64748B`

### Primary Actions
- Default: `#6A33A8` (Primary Grape)
- Hover: `#652FA4` (Deep Grape)
- Active: `#622CA1` (Shadow Grape)
- Text: `#FFFFFF`

### Cards
**Default Card:**
- Background: `#6A33A8`
- Text: `#FFFFFF`
- Border: `rgba(98, 44, 161, 0.4)`
- Shadow: `0 8px 24px rgba(98, 44, 161, 0.25)`

**Soft Card (non-primary content):**
- Background: `#8B5FC7`
- Text: `#FFFFFF`
- Shadow: lighter, more airy

---

## 🌑 Dark Mode - Grape Night

Dark mode feels like a dim kitchen light at midnight: calm, focused, slightly mischievous.
Rich, not pitch black. Ink purple > pure black.

### Base Surfaces
- App Background: `#120B1A` (Deep aubergine-black)
- Elevated Surface: `#1A1026` (Main content containers)
- Card Background: `#231338` (Cards float gently)

### Text Colors
- Primary: `#F4ECFA` (Soft white, never pure white)
- Secondary: `#C9B3E6`
- Muted/Meta: `#9A86B5`

### Primary Actions
**Primary Button:**
- Background: `#6A33A8`
- Hover: `#7A3FC2`
- Active: `#5B2C91`
- Text: `#FFFFFF`
- Shadow: `0 6px 20px rgba(106, 51, 168, 0.35)`

**Secondary Button:**
- Background: `transparent`
- Border: `#6A33A8`
- Text: `#C9B3E6`
- Hover bg: `rgba(106, 51, 168, 0.15)`

### Cards & Lists
**Card:**
- Background: `#231338`
- Border: `rgba(106, 51, 168, 0.35)`
- Shadow: subtle purple glow

**Selected/Active Card:**
- Background: `#2E1B4A`
- Border: `#6A33A8`

### States & Feedback
- Success: `#92C22D` (Leaf Green - use sparingly)
- Warning: Soft amber, muted
- Error: Warm red with reduced saturation

---

## Why This Works

✓ Matches the logo exactly → instant brand cohesion
✓ Feels friendly + smart, not fintech-cold
✓ Scales well to dark mode
✓ Pairs beautifully with grapes 🍇 and the raccoon 🦝
✓ Still serious enough for Samsung / Instacart decks
✓ Says: "We're playful, but we know what we're doing."

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

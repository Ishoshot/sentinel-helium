# Sentinel – Frontend Design System

This document defines the design system for Sentinel’s frontend.
It establishes visual foundations, design tokens, and UI behavior rules.

All frontend interfaces MUST conform to this document.
This is not a style guide. It is a contract.

---

## Design Philosophy

Sentinel follows an **Apple-inspired design philosophy**.

The interface must feel:

- calm
- precise
- neutral
- deliberate
- trustworthy

Visual design must never distract from content or intent.
The product should feel confident, not loud.

---

## Design Foundations

### Grayscale-First Design

Sentinel is designed **without color first**.

- Layout, hierarchy, and spacing must work in pure grayscale
- Color is added only to communicate meaning
- Decorative color is forbidden

If a screen fails without color, it is incorrectly designed.

---

## Color System

### Core Palette (Locked)

#### Backgrounds & Surfaces

- `--color-bg-app`: `#F9FAFB`
- `--color-bg-surface`: `#F3F4F6`
- `--color-bg-elevated`: `#FFFFFF`

---

#### Borders & Dividers

- `--color-border-subtle`: `#E5E7EB`
- `--color-border-muted`: `#D1D5DB`

---

#### Typography

- `--color-text-primary`: `#111827`
- `--color-text-secondary`: `#374151`
- `--color-text-muted`: `#6B7280`

---

### Accent Color (Single)

#### Sentinel Blue

- `--color-accent-primary`: `#2563EB`

Rules:

- One accent color only
- Used for primary actions, focus states, links, and key highlights
- Never used for decoration or large background fills

---

### Semantic Colors

Semantic colors communicate **state**, not style.

- Success: `#16A34A`
- Warning: `#D97706`
- Error: `#DC2626`

Rules:

- Use sparingly
- Prefer icons, dots, or subtle badges
- Never rely on color alone to convey meaning

---

## Typography

### Font Family

- Primary font: **Inter**
- System fallback: `system-ui`, `-apple-system`

No secondary fonts are permitted.

---

### Type Scale

Typography should emphasize **clarity over personality**.

Recommended scale:

- Page title
- Section header
- Body text
- Secondary/meta text

Rules:

- Avoid excessive font sizes
- Use weight and spacing for hierarchy
- Text should be readable at standard sizes

---

## Spacing & Layout

### Spacing System

- Use a consistent spacing scale
- Favor generous whitespace
- Avoid dense layouts

Whitespace is an intentional design tool.

---

### Layout Principles

- Content is vertically oriented
- Scanning is prioritized
- Layouts should feel balanced, not compact

Dashboards should feel breathable, even with data.

---

## Surfaces & Elevation

### Elevation Rules

- Elevation is subtle
- Use elevation only to indicate hierarchy
- Avoid dramatic shadows

Typical usage:

- Base app background (no elevation)
- Cards and panels (light elevation)
- Modals and popovers (highest elevation)

---

## Components

### Component Philosophy

- Components are simple and predictable
- Components do one thing well
- Composition is preferred over configuration complexity

No “magic” components.

---

### PrimeVue Usage

PrimeVue is the primary component library.

Rules:

- Components must be themed using Sentinel tokens
- Default PrimeVue styles must be overridden to match Sentinel
- Avoid introducing parallel UI libraries

---

### Icons

- Icon system: **Iconify**
- Prefer outline-style icons
- Icons are neutral by default

Rules:

- Icons support text; they do not replace it
- Avoid decorative icons
- Icon color follows text color unless semantic meaning is required

---

## Motion & Interaction

### Motion Principles

- Motion is subtle and purposeful
- Used to indicate state changes
- Never used for decoration

Examples:

- fade-in on data load
- subtle transitions on hover or focus

If motion draws attention to itself, it is wrong.

---

## Status & Feedback

### Status Indicators

Prefer:

- small dots
- subtle badges
- text labels

Over:

- loud banners
- large colored blocks

---

### Loading States

- Use skeletons for primary content
- Avoid spinners for large sections
- Loading states must preserve layout stability

---

### Empty States

- Calm and informative
- Explain what the user can do next
- No illustrations unless strictly necessary

---

## Accessibility

Accessibility is a baseline requirement.

Rules:

- Maintain sufficient contrast
- Do not rely on color alone
- Ensure keyboard navigation
- Use semantic HTML elements

If accessibility fails, the design fails.

---

## Platform Neutrality

- Avoid platform-specific language or visuals
- Do not reference provider branding in core UI
- Platform-specific elements are isolated to integration surfaces

---

## Design Token Usage

- All colors, spacing, and typography must be tokenized
- Raw hex values must not be used in components
- Tokens are the single source of truth

Tokens are mapped into:

- Tailwind
- PrimeVue themes
- Custom components

---

## Guiding Principles

When in doubt:

- remove instead of add
- simplify instead of decorate
- clarify instead of impress

Sentinel prioritizes:

- calm over clever
- clarity over density
- trust over novelty

---

This document defines Sentinel’s frontend design system.

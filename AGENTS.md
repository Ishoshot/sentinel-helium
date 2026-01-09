# Sentinel – Frontend Project Context

This document defines the mandatory context and enforcement rules for all AI agents
working on Sentinel’s frontend codebase.

Failure to follow these rules is considered a violation of project standards.

---

## Required Reading

### Frontend Documentation (MANDATORY – EVERY SESSION)

Before making ANY frontend code changes, you MUST read:

- `docs/frontend/DESIGN_SYSTEM.md`

  - Visual foundations
  - Color, typography, spacing, motion rules
  - Apple-inspired restraint principles

- `docs/frontend/FRONTEND_ARCHITECTURE.md`

  - Application structure
  - Responsibilities of pages, components, composables, services, stores

- `docs/frontend/COMPONENT_STANDARDS.md`

  - Component categories
  - Props/emits rules
  - PrimeVue usage constraints

- `docs/frontend/STATE_AND_DATA.md`

  - State ownership hierarchy
  - Data fetching and mutation rules
  - Error and loading handling

- `docs/frontend/CHARTING.md`
  - Charting philosophy
  - ECharts rules
  - Dashboard visualization constraints

These documents define the **authoritative frontend contracts**.

**Never assume. Always verify against these documents.**

---

### Product Documentation (MANDATORY – FIRST SESSION)

On your first interaction with this repository, read:

- `docs/product/PRD.md`
- `docs/product/GLOSSARY.md`
- `docs/product/PLANS_AND_LIMITS.md`
- `docs/product/UX_PRINCIPLES.md`

You may create memory after reading these documents.
If unsure about terminology, UX intent, or product behavior, re-read the relevant document.

---

## Enforcement Rules (Non-Negotiable)

1. **Before creating or modifying components**  
   → Read `COMPONENT_STANDARDS.md`

2. **Before deciding layout, color, spacing, or motion**  
   → Read `DESIGN_SYSTEM.md`

3. **Before fetching or mutating data**  
   → Read `STATE_AND_DATA.md`

4. **Before adding charts or metrics**  
   → Read `CHARTING.md`

5. **Before naming anything user-facing**  
   → Verify terminology in `GLOSSARY.md`

---

## Domain Vocabulary (STRICT)

Frontend code MUST use the **exact domain terms** defined in `GLOSSARY.md`.

No synonyms. No rewording.

Examples:

- **Workspace** (not organization, account)
- **Repository** (not repo in UI copy)
- **Run** (not review or execution)
- **Finding** (not issue or problem)

If a term does not exist in the glossary, it must be added there first.

---

## Frontend Architecture Principles

From `FRONTEND_ARCHITECTURE.md`:

- Pages compose views
- Composables orchestrate logic
- Services fetch data
- Components render UI
- Stores hold minimal global state

Violating this separation is forbidden.

---

## Component Enforcement

From `COMPONENT_STANDARDS.md`:

- Components are presentational by default
- Components receive data via props
- Components emit user intent via emits
- Components MUST NOT fetch data
- Components MUST NOT contain business logic

If a component feels “smart”, it is wrong.

---

## State & Data Enforcement

From `STATE_AND_DATA.md`:

- Backend is the source of truth
- All API calls go through services
- Composables manage loading and error state
- Stores are used sparingly and intentionally
- Optimistic updates are allowed only when safe

Frontend state is **derived**, not authoritative.

---

## Design System Enforcement (CRITICAL)

From `DESIGN_SYSTEM.md`:

- Grayscale-first design
- Single accent color (Sentinel Blue)
- No decorative color
- No arbitrary spacing
- No raw hex values
- Tokens are mandatory

If removing color breaks clarity, the design is wrong.

---

## PrimeVue & UI Libraries

- PrimeVue is the primary UI component library
- Components must be themed using Sentinel tokens
- PrimeVue internals must not leak into pages
- No secondary UI libraries without documentation

---

## Tooling Expectations

Frontend code must comply with:

- **Nuxt 4**
- **Vue 3 Composition API only**
- **TypeScript (no `any`)**
- **Tailwind CSS**
- **pnpm**

Options API is forbidden.

---

## Forbidden Shortcuts

AI agents MUST NOT:

- fetch data inside components
- place orchestration logic in pages
- bypass composables to call services directly from components
- invent new UX patterns without documentation
- introduce decorative UI elements
- diverge from the design system
- assume platform-specific behavior

If a change violates these rules, stop.

---

## Uncertainty Rule

If you are unsure about:

- UX intent
- data ownership
- component responsibility
- naming
- design decisions

You MUST pause and ask for clarification instead of guessing.

---

## Guiding Principles

Sentinel frontend values:

- calm over clever
- clarity over density
- consistency over novelty
- trust over flair

The UI should feel as if it was designed by Apple for developers.

This file is authoritative.

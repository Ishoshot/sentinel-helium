# Sentinel – Frontend Coding Standards

This document defines the coding standards for Sentinel’s frontend.
All frontend code MUST conform to these rules.

These standards exist to ensure:

- long-term maintainability
- predictable structure
- consistent UX implementation
- high-quality AI-assisted development

This document is authoritative.

---

## Language & Framework

- Framework: **Nuxt 4**
- Language: **TypeScript**
- UI Framework: **Vue 3 (Composition API only)**
- Package Manager: **pnpm**

Options API is forbidden.

---

## General Principles

- Explicit over clever
- Predictable over abstract
- Consistency over convenience
- Readability over terseness

Frontend code should be easy to understand without context.

---

## Project Structure

Frontend code follows the structure defined in:

- `FRONTEND_ARCHITECTURE.md`
- `COMPONENT_STANDARDS.md`
- `STATE_AND_DATA.md`

Do not invent new structural patterns without documentation.

---

## Composition API Rules

- Use `setup()` exclusively
- Prefer `ref` and `computed` over complex watchers
- Watchers must be explicit and documented
- Avoid side effects in computed properties

Composition logic belongs in composables, not components.

---

## Components

### Component Rules

- Components are presentational by default
- Components receive data via props
- Components emit user intent via events
- Components do not fetch data

If a component needs data, introduce a composable.

---

### Props

- Props are typed
- Props are explicit
- Avoid passing large objects when smaller shapes suffice

---

### Emits

- Emits represent user actions
- Emit names are descriptive and intentional

---

## Composables

### Purpose

Composables:

- encapsulate reusable logic
- orchestrate data fetching
- manage loading and error state
- compose services for UI consumption

---

### Rules

- One responsibility per composable
- Composables must be framework-agnostic where possible
- Avoid hidden side effects
- Return explicit state and methods

Composables are not mini-stores.

---

## Services

### Services Rules

- Services encapsulate API calls
- Services do not manage UI state
- Services do not contain business logic
- Services normalize backend responses

All backend interaction flows through services.

---

## State Management

- Prefer local state
- Use stores only when truly global
- Never mirror backend models entirely in state

Stores exist to support UI context, not domain logic.

---

## Error Handling

- Errors are handled in services
- Errors are surfaced explicitly to composables
- UI presents errors calmly and clearly

Silent failures are forbidden.

---

## Async & Side Effects

- Async logic must be explicit
- Side effects must be predictable
- Avoid chained promises and implicit flows

Prefer clarity over brevity.

---

## Styling Rules

- Tailwind CSS is mandatory
- Design tokens are required
- Raw hex values are forbidden
- Avoid inline styles

All styling must conform to `DESIGN_SYSTEM.md`, `COLOR_SYSTEM.md`, `TYPOGRAPHY.md`, `MOTION.md`, `COLOR_SYSTEM.md`, `TYPOGRAPHY.md`, `MOTION.md`.

---

## PrimeVue Usage

- PrimeVue is the primary UI component library
- Components must be themed using Sentinel tokens
- Wrap PrimeVue components when Sentinel-specific behavior is needed

Do not leak PrimeVue internals into pages.

---

## Icons

- Icon system: **Iconify**
- Icons are functional, not decorative
- Icon color follows text color unless semantic meaning applies

---

## Formatting & Linting

- Consistent formatting is mandatory
- Linting rules must be enforced
- Code must pass CI checks before merge

Formatting is not optional.

---

## TypeScript Rules

- Avoid `any`
- Prefer explicit interfaces and types
- Narrow types where possible
- Avoid type assertions unless necessary

Types are part of the documentation.

---

## Naming Conventions

- Components: `PascalCase`
- Composables: `useXxx`
- Services: `XxxService`
- Stores: `useXxxStore`

Naming must reflect responsibility.

---

## Testing Expectations (Future)

Frontend testing will include:

- component tests
- composable tests
- critical user-flow tests

Testing strategy will evolve but expectations remain.

---

## LLM Compatibility Rules

- Code must be explicit and readable
- Avoid clever abstractions
- Prefer verbose clarity over compact cleverness
- Stable patterns are preferred

These rules improve both human and AI comprehension.

---

## Forbidden Practices

Frontend code MUST NOT:

- fetch data in components
- mutate props
- rely on implicit globals
- introduce hidden side effects
- diverge from documented architecture

---

## Guiding Principle

If code surprises the next engineer, it is wrong.

---

This document defines Sentinel’s frontend coding contract.

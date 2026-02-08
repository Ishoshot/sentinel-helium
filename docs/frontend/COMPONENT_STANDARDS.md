# Sentinel – Component Standards

This document defines the standards for all UI components in Sentinel’s frontend.
All components MUST conform to these rules.

This is a contract.

---

## Component Philosophy

Components in Sentinel are:

- predictable
- composable
- restrained
- explicit

Components should feel boring in the best possible way.

---

## Component Categories

### Base Components

Base components are low-level UI primitives.

Examples:

- Button
- Input
- Select
- Badge
- Icon

Rules:

- No business logic
- No data fetching
- No domain assumptions
- Fully controlled via props

Base components are reusable across the entire app.

---

### Domain Components

Domain components represent Sentinel concepts.

Examples:

- WorkspaceSwitcher
- RepositoryList
- RunSummary
- FindingsTable

Rules:

- Use canonical domain terminology
- Accept domain-shaped data via props
- Do not fetch data directly
- Emit events for user actions

Domain components must remain presentation-focused.

---

### Layout Components

Layout components define structure.

Examples:

- SideNav
- TopBar
- PageHeader

Rules:

- No domain logic
- No data fetching
- Stable across routes

Layout components should rarely change.

---

## Naming Conventions

- Component files: `PascalCase.vue`
- Component names reflect responsibility
- Avoid generic names (`List`, `Card`) without context

Good:

- `RepositoryTable.vue`
- `RunStatusBadge.vue`

Bad:

- `DataList.vue`
- `ItemCard.vue`

---

## Props & Emits

### Props

- Props are explicit and typed
- Avoid overly generic props
- Avoid passing raw API responses directly

Prefer domain-shaped props.

---

### Emits

- Events represent user intent
- Events are named in past tense or action form

Examples:

- `repositorySelected`
- `runRequested`

Avoid emitting implementation details.

---

## State Management in Components

- Components should be stateless by default
- Local state is allowed for UI-only concerns
- Business state belongs in composables or stores

Components should not coordinate workflows.

---

## PrimeVue Usage

PrimeVue is the primary UI component library.

Rules:

- PrimeVue components must be themed using Sentinel tokens
- Wrap PrimeVue components when Sentinel-specific behavior is required
- Avoid leaking PrimeVue APIs directly into pages

PrimeVue is a foundation, not an abstraction leak.

---

## Styling Rules

- Tailwind CSS is used for styling
- Use design tokens exclusively
- Avoid arbitrary values unless justified
- Avoid inline styles

Consistency is mandatory.

---

## Accessibility

- Components must be keyboard accessible
- Use semantic HTML where possible
- Ensure sufficient contrast
- Provide accessible labels for inputs

Accessibility is not optional.

---

## Loading & Empty States

- Components should support loading states when applicable
- Empty states must be intentional and informative
- Avoid rendering placeholders that shift layout

---

## Error States

- Components surface errors passed to them
- Components do not decide how errors are handled
- Error presentation must be calm and clear

---

## Reusability & Composition

- Favor composition over configuration
- Avoid large, highly-configurable components
- Extract shared behavior deliberately

Small components scale better.

---

## Testing Expectations

- Components should be easy to test in isolation
- Avoid hidden side effects
- Props and emits define the public contract

---

## Anti-Patterns (Forbidden)

Components MUST NOT:

- fetch data directly
- access global stores implicitly
- contain business logic
- mutate props
- depend on page-specific context

---

## Guiding Principles

When in doubt:

- simplify
- extract
- clarify

Components exist to render, not to decide.

---

This document defines Sentinel’s component standards.
---

## Visual Specs

Visual styling and component treatments are defined in `COMPONENTS.md`.
Use this document for visual rules, and keep this file focused on engineering standards.


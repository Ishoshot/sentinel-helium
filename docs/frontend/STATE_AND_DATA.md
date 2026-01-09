# Sentinel – State and Data Management

This document defines how state and data are managed in Sentinel’s frontend.
It establishes clear ownership boundaries between pages, composables, stores, and services.

All frontend data flow MUST conform to this document.

---

## State Management Philosophy

Sentinel follows a **minimal, explicit state model**.

Principles:

- local state first
- global state only when necessary
- backend is the source of truth
- frontend state is derived, not authoritative

State exists to support the UI, not to replace backend logic.

---

## State Ownership Hierarchy

State ownership follows a strict hierarchy:

1. **Backend** – authoritative source of truth
2. **Services** – fetch and normalize data
3. **Composables** – orchestrate data for UI
4. **Pages** – compose data into views
5. **Components** – render state via props

Breaking this hierarchy is forbidden.

---

## Global State (Stores)

### Purpose of Stores

Stores are used sparingly and intentionally.

Valid use cases:

- authenticated user session
- active Workspace context
- feature flags
- UI preferences (theme, layout state)

---

### Store Rules

Stores MUST:

- hold minimal state
- expose explicit getters/actions
- remain framework-agnostic where possible

Stores MUST NOT:

- fetch data directly
- contain business logic
- mirror backend models in full
- coordinate workflows

If a store grows complex, it is likely misused.

---

## Local State

Local state belongs in:

- pages
- composables
- components (UI-only)

Rules:

- local state is preferred by default
- lift state only when shared
- reset state predictably on navigation

---

## Data Fetching

### Services Layer

All API interaction occurs through **services**.

Services:

- encapsulate HTTP calls
- normalize backend responses
- handle errors consistently
- attach authentication headers

Pages, components, and stores MUST NOT call APIs directly.

---

### Composables

Composables are the primary orchestration layer.

Responsibilities:

- call services
- manage loading and error states
- transform raw data into UI-ready shapes
- coordinate multiple service calls if needed

Composables do not perform business logic.

---

## Caching Strategy

- Cache conservatively
- Prefer short-lived caches
- Invalidate aggressively on mutations

Caching is an optimization, not a guarantee.

---

## Data Freshness

- Data is refreshed on navigation where appropriate
- Critical data is revalidated after mutations
- Stale data must be visually distinguishable if shown

Never assume cached data is current.

---

## Error Handling

### Error Sources

Errors may originate from:

- network failures
- authorization issues
- backend validation
- limit enforcement

---

### Error Handling Rules

- Errors are handled centrally in services
- Composables expose error state explicitly
- Pages decide how errors are presented
- Components render error states passed to them

Errors must never fail silently.

---

## Loading States

- Loading state is explicit and observable
- Skeletons are preferred over spinners
- Layout stability must be preserved

Loading is part of the UX, not an afterthought.

---

## Mutations

### Mutation Rules

- All mutations go through services
- Mutations trigger data revalidation
- Optimistic updates are allowed only when safe

Optimistic updates must be reversible.

---

## Pagination & Large Datasets

- Pagination is server-driven
- Cursor or offset strategies are explicit
- Virtualization is used where necessary

Never load unbounded datasets into memory.

---

## Authorization & Visibility

- Backend enforces authorization
- Frontend reflects permissions in the UI
- Unauthorized actions are hidden or disabled

Frontend authorization is advisory, not authoritative.

---

## Synchronization & Consistency

- UI state must reflect backend state
- After mutations, data is refreshed or reconciled
- Conflicts are resolved explicitly

Inconsistent state erodes trust.

---

## Anti-Patterns (Forbidden)

- Fetching data in components
- Global stores for page-specific data
- Implicit side effects in composables
- Hidden mutation of shared state
- Assuming backend behavior

---

## Guiding Principles

- Backend is truth
- Services fetch
- Composables orchestrate
- Pages compose
- Components render

If data flow feels unclear, the design is wrong.

---

This document defines Sentinel’s frontend state and data contract.

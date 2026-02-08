# Sentinel – Frontend Architecture

This document defines the architecture of Sentinel’s frontend application.
It describes structure, responsibilities, data flow, and scaling principles.

All frontend implementation MUST conform to this document.

---

## Technology Stack

- Framework: **Nuxt 4**
- Language: **TypeScript**
- Styling: **Tailwind CSS**
- UI Components: **PrimeVue (themed)**
- Icons: **Iconify**
- Charts: **Chart.js (via PrimeVue)**
- Package Manager: **pnpm**

The frontend is designed as a **modern, scalable SaaS dashboard**.

---

## Architectural Goals

The frontend architecture prioritizes:

- clarity over cleverness
- predictable structure
- testability
- long-term scalability
- alignment with backend domain concepts

The frontend is not a static UI.
It is a **stateful, data-driven application**.

---

## Application Structure

The frontend follows Nuxt 4’s conventions with additional structure
to enforce consistency and separation of concerns.

### High-Level Structure

- `app/`
  - application entry, layouts, routing
- `components/`
  - reusable UI components
- `pages/`
  - route-level views
- `layouts/`
  - app shell layouts
- `composables/`
  - reusable stateful logic
- `services/`
  - API clients and data access
- `stores/`
  - global state management
- `types/`
  - shared TypeScript types
- `utils/`
  - pure utility functions
- `assets/`
  - static assets

Each directory has a single, clear responsibility.

---

## Routing & Pages

### Pages

- Pages represent **navigation endpoints**
- Pages fetch data and compose components
- Pages do not contain business logic

Business logic belongs in composables or services.

---

### Layouts

Layouts define persistent UI structure, such as:

- navigation
- headers
- sidebars

Layouts must remain stable across routes.

---

## State Management

### State Philosophy

- Prefer local state first
- Lift state only when shared
- Avoid global state unless necessary

Global state should be minimal and intentional.

---

### Stores

Stores are used for:

- authenticated user state
- workspace context
- feature flags
- UI preferences

Stores MUST NOT:

- fetch data directly
- contain business logic
- mirror backend models blindly

---

## Data Fetching

### Services Layer

All backend interaction occurs through **services**.

Services:

- encapsulate API calls
- normalize responses
- handle errors consistently

Pages and components MUST NOT call APIs directly.

---

### Composables

Composables:

- orchestrate data fetching
- manage loading and error state
- compose services into UI-ready data

Composables are the primary bridge between backend data and UI.

---

## Component Architecture

### Component Types

- **Base components**  
  Low-level UI primitives (buttons, inputs)

- **Domain components**  
  Represent domain concepts (RepositoryList, RunSummary)

- **Layout components**  
  Structural elements (SideNav, TopBar)

---

### Component Rules

- Components are presentational by default
- Components receive data via props
- Components emit events upward
- Components do not fetch data directly

---

## Domain Alignment

Frontend concepts must align with backend domain terms.

Examples:

- Workspace
- Repository
- Run
- Finding

Naming must match `GLOSSARY.md` exactly.

---

## Error Handling

- Errors are handled centrally in services
- UI displays calm, informative error states
- Errors never fail silently

The user must always understand what happened.

---

## Loading & Empty States

- Use skeletons for primary content
- Preserve layout during loading
- Empty states explain next steps

No abrupt UI jumps.

---

## Authentication & Authorization

- Authentication is handled via OAuth redirects
- Session state is managed centrally
- Authorization is enforced server-side
- UI hides actions the user cannot perform

Frontend authorization is informational, not authoritative.

---

## Platform Neutrality

- Frontend language and UI are platform-agnostic
- Provider-specific UI is isolated to integration views
- Core UI never assumes a specific source control platform

---

## Performance Principles

- Avoid unnecessary re-renders
- Use pagination and virtualization for large lists
- Charts must handle large datasets gracefully

Performance optimizations must not compromise clarity.

---

## Scaling Principles

- New domains add new components and composables
- Avoid deep nesting and coupling
- Shared patterns are extracted deliberately

Consistency is more important than abstraction.

---

## Testing (Future)

Frontend testing will include:

- component tests
- composable tests
- critical flow tests

Testing strategy will be documented separately.

---

## Guiding Principles

- Pages compose
- Composables orchestrate
- Services fetch
- Components render

If a piece of code violates this separation, it must be refactored.

---

This document defines Sentinel’s frontend architecture.

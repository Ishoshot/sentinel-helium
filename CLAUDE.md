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

## Type Safety & Enums (STRICT)

**No magic strings are allowed.** All string literals that represent application state,
status codes, or categories must be defined as TypeScript enums.

### Enum Rules

1. **All enums live in `app/types/enums.ts`**
2. **Enum keys MUST be PascalCase**
3. **Enum values MUST match the API contract** (usually snake_case or lowercase)
4. **Group related enums together** with clear section headers
5. **Add JSDoc comments** to every enum for clarity
6. **Re-export from `app/types/index.ts`** for convenient importing

### Available Enums

| Category | Enum | Example Values |
|----------|------|----------------|
| UI | `ToastType` | `Success`, `Error`, `Warning`, `Info` |
| UI | `EmptyStateVariant` | `Empty`, `Error`, `Success`, `Warning`, `Info`, `Offline` |
| UI | `ButtonVariant` | `Primary`, `Secondary`, `Ghost`, `Danger` |
| UI | `ButtonSize` | `Small`, `Medium`, `Large` |
| UI | `ModalSize` | `Small`, `Medium`, `Large` |
| API | `HttpStatus` | `BadRequest`, `Unauthorized`, `Forbidden`, `NotFound`, etc. |
| API | `ErrorCategory` | `Auth`, `Permission`, `NotFound`, `Validation`, `Server`, `Network` |
| Auth | `OAuthProvider` | `GitHub`, `Google` |
| Auth | `MemberRole` | `Owner`, `Admin`, `Member` |
| GitHub | `ConnectionStatus` | `Pending`, `Active`, `Disconnected`, `Failed` |
| GitHub | `InstallationStatus` | `Active`, `Suspended`, `Uninstalled` |
| GitHub | `GitHubAccountType` | `User`, `Organization` |
| Notifications | `NotificationType` | `WorkspaceInvitation`, `MemberJoined`, etc. |
| Storage | `StorageKey` | `AuthToken`, `Theme`, `Locale` |
| Routes | `RouteName` | `Home`, `Login`, `WorkspaceOverview`, etc. |

### Usage Examples

```typescript
// BAD - Magic string
if (member.role === 'owner') { ... }

// GOOD - Using enum
import { MemberRole } from '~/types'
if (member.role === MemberRole.Owner) { ... }
```

```typescript
// BAD - Magic string
const ERROR_MESSAGES = {
  401: 'Session expired',
  403: 'Forbidden',
}

// GOOD - Using enum
import { HttpStatus } from '~/types'
const ERROR_MESSAGES = {
  [HttpStatus.Unauthorized]: 'Session expired',
  [HttpStatus.Forbidden]: 'Forbidden',
}
```

### Adding New Enums

When you need a new enum:

1. Check if it already exists in `app/types/enums.ts`
2. Add to the appropriate section with JSDoc
3. Re-export from `app/types/index.ts`
4. Update this documentation table

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

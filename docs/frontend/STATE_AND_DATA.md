# Sentinel - State and Data Contract

This file defines ownership for state, fetching, mutations, and revalidation.

---

## Ownership Hierarchy

Source of truth order:

1. Backend
2. Services
3. Composables
4. Pages
5. Components

Violating this order creates hidden coupling.

---

## State Placement Rules

Use local state by default.

Use stores only for:

- authenticated session/user shell context
- current workspace context
- cross-route UI preferences
- feature flags used by multiple areas

Do not place page-specific fetch payloads in global stores.

---

## Service Contract

Services are responsible for:

- making HTTP calls
- auth header usage
- response normalization
- consistent error shape

Services are not responsible for UI state.

---

## Composable Contract

Composables are responsible for:

- orchestrating one use case or closely related use cases
- exposing explicit state: `data`, `isLoading`, `error`
- coordinating multiple service calls when needed
- exposing mutation methods that pages call

Composables should not hide side effects.

---

## Page Contract

Pages are responsible for:

- route params/query interpretation
- selecting composables
- binding state into UI
- handling navigation and page-level UX decisions

Pages should not implement API details.

---

## Component Contract

Components:

- receive state via props
- emit intent upward
- keep only UI-local state

Components must not fetch or own domain workflows.

---

## Mutation and Revalidation Rules

- All writes go through services (invoked by composables).
- After successful writes, revalidate affected reads.
- Optimistic updates are optional and must be reversible.
- Keep mutation side effects explicit in composables.

---

## Loading and Error Rules

- Loading states must be explicit and testable.
- Prefer skeletons for layout-heavy regions.
- Errors must surface with actionable context.
- Never silently swallow API errors.

---

## Performance Rules

- Use server-driven pagination for large lists.
- Avoid unbounded in-memory datasets.
- Move heavy aggregation to backend where possible.
- Cache conservatively and invalidate aggressively after writes.

---

## Forbidden Patterns

- API calls in components or stores
- Business logic in stores
- Shared mutable state without a clear owner
- Implicit fetches triggered by unrelated UI changes


# Sentinel - Frontend Architecture

This file defines structural boundaries and responsibility mapping.
If code does not fit this model, refactor or update docs intentionally.

---

## Primary Goal

Predictable architecture for a stateful SaaS frontend:

- clear ownership
- low coupling
- easy onboarding
- safe scaling

---

## Folder Responsibility Map

- `app/pages`:
  route entrypoints; route-level orchestration
- `app/layouts`:
  persistent shells
- `app/components/base`:
  UI primitives
- `app/components/domain`:
  domain-presentational components
- `app/composables`:
  reusable orchestration/state logic
- `app/services`:
  API access and response normalization
- `app/stores`:
  global UI/session context only
- `app/types`:
  shared contracts
- `app/utils`:
  pure helpers

One folder, one responsibility.

---

## Runtime Flow

1. Page resolves route params and user intent.
2. Page/composable triggers service calls.
3. Service normalizes response and error shape.
4. Composable exposes UI-ready state.
5. Components render state and emit user actions.

Do not skip layers casually.

---

## Route Model

- Public marketing/legal pages: SSR-first.
- Authenticated workspace dashboard routes: SPA mode where configured.

Route rendering strategy must stay explicit in `nuxt.config.ts`.

---

## Component Model

Use `COMPONENTS.md` as the source of truth.

In architecture terms:

- base components are framework-level building blocks
- domain components represent Sentinel concepts
- page files compose domain components and composables

---

## Domain Alignment

Frontend naming must align with the canonical terms in `UX_PRINCIPLE.md`.
Use canonical terms like `Workspace`, `Run`, and `Finding`.

---

## Error and Loading Architecture

- Services normalize errors.
- Composables expose `isLoading` and `error` states.
- Pages decide UX strategy.
- Components render provided states.

No silent failures. No unowned loading states.

---

## Scaling Guardrails

When adding features:

1. Add/extend service APIs first.
2. Add composable orchestration next.
3. Add/compose components last.
4. Introduce global store state only when truly shared.

# Sentinel - Frontend Coding Standards

This file defines coding rules that apply to all frontend code.
Use this with:

- `FRONTEND_ARCHITECTURE.md` for structure and boundaries
- `STATE_AND_DATA.md` for data-flow ownership
- `COMPONENTS.md` for component contracts
- `DESIGN_SYSTEM.md` for visual constraints
- `UX_PRINCIPLE.md` for product-facing UX behavior and terminology

---

## Stack Contract

- Nuxt 4
- Vue 3 Composition API (`<script setup>`)
- TypeScript
- Tailwind CSS
- PrimeVue (themed through Sentinel styles)
- pnpm

Forbidden:

- Options API
- new framework-level patterns without doc updates

---

## Code Quality Rules

- Prefer explicit, readable logic over abstractions.
- Keep side effects explicit and near the caller.
- Keep functions/components single-purpose.
- Avoid hidden coupling across modules.

If code is surprising, simplify it.

---

## TypeScript Rules

- Avoid `any`.
- Type props, emits, composable returns, and service responses.
- Use narrow unions/enums where appropriate.
- Use assertions only when unavoidable and justified.

---

## Reactivity Rules

- Prefer `ref`/`computed` over broad watchers.
- Keep `computed` pure (no side effects).
- Use watchers only for explicit side-effect triggers.
- Cancel/cleanup async side effects on lifecycle boundaries.

---

## Layering Rules

- Pages compose route-level UI and orchestration only.
- Components render and emit intent; they do not fetch.
- Composables orchestrate state and async flows.
- Services own HTTP/API details and normalization.
- Stores hold minimal global UI/session context.

For details, follow the contracts in `FRONTEND_ARCHITECTURE.md` and `STATE_AND_DATA.md`.

---

## Styling Rules

- Use Tailwind + Sentinel tokens.
- Avoid inline styles unless dynamic value injection is required.
- Raw hex values in components are forbidden.
- Reuse established utility patterns before adding new ones.

---

## Naming Rules

- Components: `PascalCase.vue`
- Composables: `useXxx.ts`
- Stores: `useXxxStore.ts`
- Services: `xxxService.ts` or existing project convention

Names must reflect responsibility, not implementation detail.

---

## Lint/Test Gate

Before merge:

1. `pnpm lint`
2. `pnpm typecheck`
3. relevant runtime/build check

No lint disables or type escapes without explicit justification.

---

## Forbidden Patterns

- Data fetching in components
- Business logic in stores
- Mutation of props
- Silent error swallowing
- Page-specific globals leaked into reusable components

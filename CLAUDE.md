# Sentinel - Frontend Agent Contract

This file defines mandatory rules for AI agents working in Sentinel frontend.

---

## Required Docs (Read Before Relevant Changes)

- `docs/frontend/CODING_STANDARDS.md`
- `docs/frontend/FRONTEND_ARCHITECTURE.md`
- `docs/frontend/STATE_AND_DATA.md`
- `docs/frontend/COMPONENTS.md`
- `docs/frontend/DESIGN_SYSTEM.md`
- `docs/frontend/UX_PRINCIPLE.md`
- `docs/frontend/CHARTING.md` (when chart work is involved)

Never guess when a contract exists.

---

## Enforcement Rules

1. Before component changes: follow `COMPONENTS.md`.
2. Before layout/style/motion changes: follow `DESIGN_SYSTEM.md`, `MOTION.md`, `TYPOGRAPHY.md`, `COLOR_SYSTEM.md`.
3. Before data fetching/mutations: follow `STATE_AND_DATA.md`.
4. Before naming or UX copy decisions: follow `UX_PRINCIPLE.md`.
5. Before chart updates: follow `CHARTING.md`.

---

## Architecture Boundaries

- Pages compose route-level UI.
- Composables orchestrate async/domain flows.
- Services own API calls and normalization.
- Components render and emit intent.
- Stores contain minimal global context only.

Violation of these boundaries is a bug.

---

## Canonical Product Terms

Use these terms consistently in frontend copy and naming:

- Workspace
- Repository
- Run
- Finding
- Member
- Plan

UI note: "Review" can be used as UX language for Runs.

---

## Type Safety Rule

- Avoid magic strings for shared state/status/category values.
- Prefer enums or typed constants under `app/types`.
- Reuse existing types before adding new ones.

---

## Design and UX Constraints

- Calm, clear, predictable interfaces.
- Signal over noise.
- Tokenized styling only.
- No decorative UI that does not improve decisions.
- Explicit feedback for loading, success, errors, and limits.

---

## Tooling Contract

- Nuxt 4
- Vue 3 Composition API (`<script setup>`)
- TypeScript
- Tailwind CSS
- PrimeVue
- pnpm

Forbidden: Options API.

---

## Forbidden Patterns

- Data fetching in components
- Business logic in stores
- Prop mutation
- Silent error swallowing
- Hidden side effects that cross ownership boundaries

---

## Uncertainty Rule

If ownership, terminology, or UX behavior is unclear, stop and ask instead of guessing.

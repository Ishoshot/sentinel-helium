# Sentinel - Frontend Agent Contract

This file defines mandatory rules for AI agents working in Sentinel frontend.

---

- **`../../../sentinel-api/`** — Laravel 12 backend (PHP 8.4, PostgreSQL 15+, Redis)

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

---

## Self-Review Before Completion

After writing or modifying code, **pause and critically review your own work** before considering the task done. Specifically check for:

- **Reactivity bugs:** Does every ref, computed, and watcher behave correctly? Are there stale closures or missing dependencies?
- **Layer violations:** Is data fetching happening only in services? Are composables the only orchestrators? Are components stateless?
- **Type safety:** Are there `any` types, unsafe casts, or magic strings where enums exist?
- **Error handling:** Does every async operation expose loading, error, and empty states? Is anything silently swallowed?
- **Token styling:** Are raw hex values or arbitrary values used where design tokens exist?

If you find an issue during self-review, fix it immediately — do not leave it for the user to catch.

---

## Code Review Gate (Required)

Before considering any non-trivial code-writing task complete, run **all 4 reviewers in parallel** from the main conversation:

- `review-correctness` — reactivity bugs, type errors, state flow breaks, error handling
- `review-architecture` — layer boundaries, composable/service/component patterns, naming, design tokens
- `review-tests` — TypeScript strictness, lint compliance, build safety, E2E coverage gaps
- `review-security` — XSS risks, auth token handling, route guard correctness, sensitive data exposure

**Review cycle:**

1. Run all 4 reviewers in parallel after completing your changes
2. Do not rely on nested subagents (a subagent cannot spawn other subagents)
3. Fix reported issues
4. Re-run only the reviewer(s) that requested changes
5. Repeat until all reviewers approve
6. If reviewer resume fails, start a new reviewer run
7. In web/remote workflows, complete this before pushing

All reviewer feedback should be practical and high-signal, not pedantic.

Work is only complete when all reviewer outputs confirm the changes are acceptable.

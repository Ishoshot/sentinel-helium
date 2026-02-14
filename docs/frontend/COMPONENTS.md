# Sentinel - Component Contract

This is the single source of truth for component standards in Sentinel frontend.
It combines engineering rules and visual guidance.

Use this file with:

- `CODING_STANDARDS.md` for project-level code rules
- `DESIGN_SYSTEM.md` for token and design references

---

## Component Layers

### Base Components (`app/components/base`)

Reusable UI primitives only.

Rules:

- No domain logic
- No data fetching
- No implicit store access
- Behavior controlled by props and emits

Core examples:

- `BaseButton.vue`
- `BaseInput.vue`
- `BaseCard.vue`
- `BaseModal.vue`
- `BaseSkeleton.vue`
- `BaseEmptyState.vue`

### Domain Components (`app/components/domain`)

Presentation for Sentinel concepts (runs, repos, billing, members, integrations).

Rules:

- Accept domain-shaped props
- Emit user intent events
- Do not fetch directly
- Keep workflow orchestration in composables/pages

### Layout / Shell Components

Global structure and navigation.

Rules:

- Stable across routes
- No business logic
- No direct API calls

---

## Component API Standards

### Props

- Always typed
- Prefer focused shapes over full API payloads
- Do not expose implementation detail props

### Emits

- Represent user intent, not internal mechanics
- Use descriptive names
- Keep payloads minimal and typed

### State

- Default to stateless
- Local state is only for UI concerns (open/closed, hover, tab)
- Business state belongs in composables or stores

### Accessibility

Every interactive component must support:

- Keyboard navigation
- Focus-visible states
- Accessible label/name
- Semantic HTML before ARIA

### Loading, Empty, Error

- Preserve layout while loading
- Empty states should explain next action
- Errors should be clear and calm
- Components display error state; recovery logic stays outside

---

## Visual Standards (Quick Reference)

Use tokens from `COLOR_SYSTEM.md`, `TYPOGRAPHY.md`, and `MOTION.md`.

### `BaseCard`

- Background: elevated dark surface
- Border: subtle 1px
- Radius: `xl`
- Default padding: `p-6`
- Interactive cards may lift slightly on hover

Use for:

- stats, settings blocks, chart containers, detail groups

Do not use for:

- page-level spacing wrappers (use `BaseContainer`)

### `BaseButton`

Supported variants:

- Primary: highest-emphasis action
- Secondary: medium emphasis
- Ghost: low emphasis or toolbar action

Rules:

- One primary action per local section
- Disabled state must be visually obvious
- Avoid icon-only buttons without `aria-label`

### `BaseInput`

Rules:

- Label and hint/error text must be supported
- Error state must be explicit, not color-only
- Placeholder is guidance, not a label replacement

### `BaseModal`

Rules:

- Trap focus
- Close on Escape unless explicitly unsafe
- Provide title and clear primary/secondary actions
- Do not place complex page workflows inside a modal by default

### Feedback Components

- `BaseSkeleton`: match final content geometry
- `BaseSpinner`: short blocking operations only
- `BaseEmptyState`: communicate what happened and what to do next

---

## Composition Rules

- Prefer composition over heavily configurable mega-components
- Extract shared behavior only after repetition is clear
- Keep component public contracts small and stable

Good:

- Small focused components composed in page/domain containers

Bad:

- One component with many mode flags and branching templates

---

## Anti-Patterns (Forbidden)

Components must not:

- Fetch data directly
- Mutate props
- Depend on page-only globals
- Hide side effects in computed values
- Mix domain orchestration into base components

---

## Review Checklist

Before merging a component change:

1. Is the component in the correct layer (base/domain/layout)?
2. Are props/emits typed and minimal?
3. Is data fetching/orchestration outside the component?
4. Are loading/empty/error states intentional?
5. Is keyboard and screen-reader behavior acceptable?
6. Does styling use Sentinel tokens and existing patterns?


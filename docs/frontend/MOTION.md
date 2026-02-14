# Sentinel - Motion

Motion in Sentinel exists for clarity, feedback, and hierarchy.
Not decoration.

---

## Motion Principles

- Guide attention, do not distract.
- Keep interactions responsive.
- Prefer subtle transitions over dramatic movement.
- Respect reduced-motion preferences.

---

## Timing Tokens

| Token | Duration | Typical Use |
|---|---:|---|
| `fast` | 150ms | hover/focus micro-interactions |
| `default` | 200ms | standard UI transitions |
| `slow` | 300ms | entrance/exit of larger elements |
| `slower` | 500ms | limited stagger or reveal groups |

---

## Easing Tokens

| Token | Curve | Use |
|---|---|---|
| `default` | `cubic-bezier(0.4, 0, 0.2, 1)` | general transitions |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | enter transitions |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | exit transitions |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | selective playful micro-motion |

Use `spring` sparingly.

---

## Approved Patterns

- Fade / fade-up for content entry
- Scale-in for modal/popover surfaces
- Subtle hover lift for interactive cards
- Shimmer for skeleton placeholders

Stagger rules:

- first item has no delay
- 50-100ms per item
- max 8 staggered items
- total reveal budget under 800ms

---

## Accessibility and Performance

- Implement `prefers-reduced-motion` fallback.
- Animate `transform` and `opacity` when possible.
- Avoid animating layout-heavy properties (`width`, `height`, `top`, `left`) unless required.
- Do not block user actions while animation finishes.

---

## Anti-Patterns

- Long decorative animations on core flows
- Multiple competing animations in one viewport region
- Auto-play effects that compete with primary content
- Motion that obscures state change clarity


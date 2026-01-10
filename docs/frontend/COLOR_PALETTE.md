# Sentinel Color Palette

Quick reference for all colors used in Sentinel's frontend.

---

## Backgrounds & Surfaces

| Token                    | Value     | Usage                                      |
| ------------------------ | --------- | ------------------------------------------ |
| `--color-bg-app`         | `#F9FAFB` | Application background                     |
| `--color-bg-surface`     | `#F3F4F6` | Card backgrounds, sections                 |
| `--color-bg-elevated`    | `#FFFFFF` | Modals, popovers, elevated panels          |

---

## Borders & Dividers

| Token                    | Value     | Usage                                      |
| ------------------------ | --------- | ------------------------------------------ |
| `--color-border-subtle`  | `#E5E7EB` | Light borders, card outlines               |
| `--color-border-muted`   | `#D1D5DB` | Stronger borders, input borders            |

---

## Typography

| Token                    | Value     | Usage                                      |
| ------------------------ | --------- | ------------------------------------------ |
| `--color-text-primary`   | `#111827` | Headings, primary content                  |
| `--color-text-secondary` | `#374151` | Body text, descriptions                    |
| `--color-text-muted`     | `#6B7280` | Captions, placeholders, hints              |

---

## Accent Color (Single)

| Token                    | Value     | Usage                                      |
| ------------------------ | --------- | ------------------------------------------ |
| `--color-accent-primary` | `#2563EB` | Primary buttons, links, focus rings, key highlights |

**Rules:**
- Use sparingly for interactive elements
- Never for decoration or large background fills
- Reserved for actions that need emphasis

---

## Semantic Colors

| Token                    | Value     | Usage                                      |
| ------------------------ | --------- | ------------------------------------------ |
| `--color-success`        | `#16A34A` | Success states, positive indicators        |
| `--color-warning`        | `#D97706` | Warnings, caution states                   |
| `--color-error`          | `#DC2626` | Errors, destructive actions, critical findings |

**Rules:**
- Use sparingly (dots, badges, subtle indicators)
- Never rely on color alone for meaning
- Prefer icons alongside color for accessibility

---

## Charts & Data Visualization

| Purpose                  | Color     | Usage                                      |
| ------------------------ | --------- | ------------------------------------------ |
| Primary data series      | `#2563EB` | Main trend line, primary bars              |
| Secondary data           | Grayscale | Supporting data, muted series              |
| Critical severity        | `#DC2626` | Error-level findings in charts             |
| Warning severity         | `#D97706` | Warning-level findings in charts           |
| Success/Resolved         | `#16A34A` | Resolved items, positive trends            |

**Rules:**
- Default to grayscale for non-critical data
- Single accent color per chart maximum
- No rainbow palettes

---

## Tailwind Mappings

```
bg-gray-50      → --color-bg-app
bg-gray-100     → --color-bg-surface
bg-white        → --color-bg-elevated

border-gray-200 → --color-border-subtle
border-gray-300 → --color-border-muted

text-gray-900   → --color-text-primary
text-gray-700   → --color-text-secondary
text-gray-500   → --color-text-muted

text-blue-600   → --color-accent-primary
bg-blue-600     → --color-accent-primary

text-green-600  → --color-success
text-amber-600  → --color-warning
text-red-600    → --color-error
```

---

## Forbidden

- Raw hex values in components
- Multiple accent colors
- Decorative color usage
- Color as the only indicator of state
- Arbitrary Tailwind color classes outside this palette

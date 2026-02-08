# Sentinel – Color System

This document defines Sentinel’s color tokens, usage rules, and quick reference.
All UI must use these tokens. Raw hex values are forbidden in components.

---

## Backgrounds & Surfaces

| Token | Value | Usage |
| --- | --- | --- |
| `--color-bg-app` | `#09090b` | Root application background |
| `--color-bg-surface` | `#0f0f11` | Sidebar, secondary surfaces |
| `--color-bg-elevated` | `#18181b` | Cards, panels, primary content |
| `--color-bg-hover` | `#1f1f23` | Hover states |
| `--color-bg-active` | `#27272a` | Active/pressed states |

---

## Borders & Dividers

| Token | Value | Usage |
| --- | --- | --- |
| `--color-border-subtle` | `#27272a` | Default card borders, dividers |
| `--color-border-muted` | `#3f3f46` | Emphasized borders, inputs |
| `--color-border-accent` | `rgba(20, 184, 166, 0.3)` | Accent highlights |

---

## Typography

| Token | Value | Usage |
| --- | --- | --- |
| `--color-text-primary` | `#fafafa` | Headings, primary content |
| `--color-text-secondary` | `#a1a1aa` | Body text |
| `--color-text-muted` | `#71717a` | Captions, hints |
| `--color-text-faint` | `#52525b` | Disabled text |

---

## Accent

| Token | Value | Usage |
| --- | --- | --- |
| `--color-accent` | `#14b8a6` | Primary interactive elements |
| `--color-accent-hover` | `#0d9488` | Hover state |
| `--color-accent-light` | `#0f766e` | Subtle backgrounds |
| `--color-accent-bright` | `#2dd4bf` | Emphasis |
| `--color-accent-glow` | `rgba(20, 184, 166, 0.15)` | Glow effects |

---

## Semantic Colors

| Token | Value | Usage |
| --- | --- | --- |
| `--color-success` | `#22c55e` | Success states |
| `--color-warning` | `#f59e0b` | Warning states |
| `--color-error` | `#ef4444` | Error states |
| `--color-info` | `#3b82f6` | Info states |

---

## Chart Colors (Primary)

| Name | Hex | Usage |
| --- | --- | --- |
| `chart-teal` | `#14b8a6` | Primary data |
| `chart-blue` | `#3b82f6` | Secondary data |
| `chart-violet` | `#8b5cf6` | Tertiary data |
| `chart-pink` | `#ec4899` | Highlights |

---

## Rules

- One accent color per chart
- No decorative color usage
- No pure white (`#ffffff`) or pure black (`#000000`) in components

---

This document defines Sentinel’s color system.

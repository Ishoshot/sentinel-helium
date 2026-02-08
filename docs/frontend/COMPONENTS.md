# Sentinel – Component Specifications

## Overview

This document specifies the visual treatment of each core component.
Components follow the design system tokens defined in COLOR_SYSTEM.md and TYPOGRAPHY.md.

---

## BaseCard

The foundational container for all content blocks.

### Specifications

| Property | Value |
|----------|-------|
| Background | `bg-elevated` (#18181b) |
| Border | 1px solid `border-subtle` (#27272a) |
| Border Radius | `xl` (1rem / 16px) |
| Shadow | `shadow-elevated` |
| Padding | `p-6` (24px) default |

### Hover State

```css
.card:hover {
  border-color: rgba(20, 184, 166, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 0 30px -10px rgba(20, 184, 166, 0.15);
}
```

### Variants

| Variant | Border | Shadow |
|---------|--------|--------|
| Default | `border-subtle` | `shadow-elevated` |
| Highlighted | `border-accent` | `shadow-glow` |
| Interactive | `border-subtle` → `border-accent` on hover | Lifts on hover |

### Inner Glow (Optional)

For extra polish, add subtle top edge highlight:

```css
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 50%
  );
  pointer-events: none;
}
```

---

## StatCard

Hero metric display card.

### Structure

```
┌─────────────────────────────────┐
│ [Icon]              Label       │
│                                 │
│         1,247                   │  ← Hero number
│                                 │
│   +12% from last week          │  ← Trend/description
└─────────────────────────────────┘
```

### Specifications

| Element | Style |
|---------|-------|
| Container | BaseCard with `p-6` |
| Icon | 40x40px, `bg-bg-hover` rounded-xl, icon `text-accent` |
| Label | `text-sm text-text-muted` |
| Value | `text-4xl font-bold font-mono text-text-primary` |
| Description | `text-xs text-text-muted` |
| Trend (positive) | `text-success` with ↑ icon |
| Trend (negative) | `text-error` with ↓ icon |

### Animation

- Stagger entrance: 75ms delay per card
- Number count-up animation (optional)

---

## AnalyticsChart

Wrapper for all chart visualizations.

### Structure

```
┌─────────────────────────────────┐
│  Title                          │
│  Description                    │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │      [Chart Area]       │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  ○ Legend 1  ○ Legend 2        │
└─────────────────────────────────┘
```

### Specifications

| Element | Style |
|---------|-------|
| Container | BaseCard |
| Title | `text-lg font-semibold text-text-primary` |
| Description | `text-sm text-text-muted` |
| Chart height | 300-400px default |
| Legend | Bottom, point style, `text-sm` |

### Chart.js Theme

```javascript
const chartTheme = {
  // Colors
  backgroundColor: 'transparent',

  // Grid
  grid: {
    color: 'rgba(63, 63, 70, 0.3)', // border-muted with opacity
    drawBorder: false,
  },

  // Ticks
  ticks: {
    color: '#71717a', // text-muted
    font: { size: 11 },
  },

  // Tooltip
  tooltip: {
    backgroundColor: '#18181b',
    titleColor: '#fafafa',
    bodyColor: '#a1a1aa',
    borderColor: '#27272a',
    borderWidth: 1,
    cornerRadius: 8,
    padding: 12,
  },

  // Legend
  legend: {
    labels: {
      color: '#a1a1aa',
      usePointStyle: true,
      padding: 20,
    },
  },
}
```

---

## Navigation Sidebar

Fixed left navigation.

### Specifications

| Property | Value |
|----------|-------|
| Width | 240px (expanded), 72px (collapsed) |
| Background | `bg-surface` (#0f0f11) |
| Border | Right border `border-subtle` |

### Nav Item

| State | Background | Text | Icon |
|-------|------------|------|------|
| Default | transparent | `text-secondary` | `text-muted` |
| Hover | `bg-hover` | `text-primary` | `text-secondary` |
| Active | `bg-accent` | `text-white` | `text-white` |

### Active Item Style

```css
.nav-item-active {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border-radius: 0.75rem;
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.4);
}
```

---

## BaseButton

### Variants

#### Primary

```css
.btn-primary {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  font-weight: 500;
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.3);
  transition: all 200ms ease;
}

.btn-primary:hover {
  box-shadow: 0 0 30px -5px rgba(20, 184, 166, 0.5);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

#### Secondary

```css
.btn-secondary {
  background: transparent;
  color: #a1a1aa;
  border: 1px solid #3f3f46;
  border-radius: 0.75rem;
  padding: 0.625rem 1rem;
  font-weight: 500;
  transition: all 200ms ease;
}

.btn-secondary:hover {
  background: #1f1f23;
  border-color: #52525b;
  color: #fafafa;
}
```

#### Ghost

```css
.btn-ghost {
  background: transparent;
  color: #a1a1aa;
  border: none;
  padding: 0.625rem 1rem;
  font-weight: 500;
  transition: all 150ms ease;
}

.btn-ghost:hover {
  background: #1f1f23;
  color: #fafafa;
}
```

---

## BaseBadge

Small status indicators.

### Variants

| Variant | Background | Text |
|---------|------------|------|
| Default | `bg-bg-hover` | `text-secondary` |
| Accent | `bg-accent-glow` | `text-accent` |
| Success | `bg-success-light` | `text-success` |
| Warning | `bg-warning-light` | `text-warning` |
| Error | `bg-error-light` | `text-error` |

### Style

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px; /* full */
  font-size: 0.75rem;
  font-weight: 500;
}
```

---

## BaseInput

Text inputs and form fields.

### Specifications

| Property | Value |
|----------|-------|
| Background | `bg-elevated` |
| Border | `border-muted` |
| Border Radius | `xl` (1rem) |
| Padding | `py-2.5 px-4` |
| Text | `text-text-primary` |
| Placeholder | `text-text-faint` |

### States

| State | Style |
|-------|-------|
| Default | `border-muted` |
| Hover | `border-text-muted` |
| Focus | `border-accent`, ring glow |
| Error | `border-error` |
| Disabled | 50% opacity, no hover |

### Focus Style

```css
.input:focus {
  border-color: #14b8a6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}
```

---

## BaseAvatar

User avatars.

### Sizes

| Size | Dimensions |
|------|------------|
| xs | 24x24px |
| sm | 32x32px |
| md | 40x40px |
| lg | 48x48px |
| xl | 64x64px |

### Style

```css
.avatar {
  border-radius: 9999px;
  border: 2px solid #27272a;
  object-fit: cover;
}

.avatar-with-status {
  position: relative;
}

.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  border: 2px solid #18181b;
}

.avatar-status-online { background: #22c55e; }
.avatar-status-away { background: #f59e0b; }
.avatar-status-offline { background: #71717a; }
```

---

## BaseModal

Overlay dialogs.

### Specifications

| Property | Value |
|----------|-------|
| Backdrop | `bg-black/60` with `backdrop-blur-sm` |
| Container | `bg-elevated`, `border-subtle`, `rounded-2xl` |
| Shadow | `shadow-modal` |
| Max width | Varies (sm: 400px, md: 500px, lg: 600px) |
| Padding | `p-6` |

### Animation

```css
/* Backdrop */
.modal-backdrop-enter { opacity: 0; }
.modal-backdrop-enter-active { transition: opacity 200ms ease; }

/* Content */
.modal-content-enter { opacity: 0; transform: scale(0.95) translateY(10px); }
.modal-content-enter-active { transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1); }
```

---

## Empty States

When no data is available.

### Structure

```
┌─────────────────────────────────┐
│                                 │
│           [Icon]                │
│                                 │
│       No data available         │
│                                 │
│   Run some reviews to see data  │
│                                 │
│        [Action Button]          │
│                                 │
└─────────────────────────────────┘
```

### Style

| Element | Style |
|---------|-------|
| Icon | 48x48px, `text-text-faint`, `bg-bg-hover` rounded container |
| Title | `text-base font-medium text-text-secondary` |
| Description | `text-sm text-text-muted` |
| Action | Primary or secondary button |

---

## Loading Skeletons

### Style

```css
.skeleton {
  background: #1f1f23;
  border-radius: 0.5rem;
  animation: shimmer 2s linear infinite;
  background-image: linear-gradient(
    90deg,
    #1f1f23 0%,
    #27272a 50%,
    #1f1f23 100%
  );
  background-size: 200% 100%;
}
```

### Shapes

- Text: `h-4 rounded`
- Heading: `h-6 rounded w-1/3`
- Avatar: `rounded-full`
- Card: `h-32 rounded-xl`
- Chart: `h-64 rounded-xl`

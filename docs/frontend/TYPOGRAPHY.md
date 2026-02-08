# Sentinel – Typography

## Philosophy

Typography creates:
1. **Clear hierarchy** – Instantly scannable
2. **Bold confidence** – Numbers are heroes
3. **Technical precision** – Monospace for data

---

## Font Stack

### Primary: Instrument Sans

Used for all UI text. Modern, clean, slightly geometric.

```css
font-family: "Instrument Sans", ui-sans-serif, system-ui, sans-serif;
```

### Monospace: JetBrains Mono

Used for code, numbers, and technical data.

```css
font-family: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
```

---

## Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| `display` | 3.5rem (56px) | 1.1 | 700 | Hero numbers, key metrics |
| `5xl` | 3rem (48px) | 1.1 | 700 | Large headings |
| `4xl` | 2.25rem (36px) | 2.5rem | 700 | Page titles |
| `3xl` | 1.875rem (30px) | 2.25rem | 600 | Section headings |
| `2xl` | 1.5rem (24px) | 2rem | 600 | Card titles |
| `xl` | 1.25rem (20px) | 1.75rem | 600 | Subsection titles |
| `lg` | 1.125rem (18px) | 1.75rem | 500 | Large body text |
| `base` | 1rem (16px) | 1.5rem | 400 | Body text |
| `sm` | 0.875rem (14px) | 1.25rem | 400 | Secondary text |
| `xs` | 0.75rem (12px) | 1rem | 400 | Captions, labels |

---

## Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Emphasis, labels |
| Semibold | 600 | Headings, important text |
| Bold | 700 | Display numbers, key metrics |

---

## Hierarchy Examples

### Dashboard Header

```html
<h1 class="text-2xl font-semibold text-text-primary">
  Overview
</h1>
<p class="mt-1 text-sm text-text-secondary">
  Welcome to Hydrogenn Workspace
</p>
```

### Stat Card

```html
<p class="text-sm text-text-muted">Total Runs</p>
<p class="text-4xl font-bold text-text-primary font-mono">
  1,247
</p>
<p class="text-xs text-text-muted">+12% from last week</p>
```

### Section Header

```html
<h2 class="text-lg font-semibold text-text-primary">
  Analytics
</h2>
<p class="mt-1 text-sm text-text-muted">
  Insights from your code reviews
</p>
```

### Card Header

```html
<h3 class="text-base font-semibold text-text-primary">
  Run Activity
</h3>
<p class="text-sm text-text-muted">
  Successful and failed runs over time
</p>
```

---

## Numbers as Heroes

In a data-driven dashboard, numbers are the most important content.

### Rules for Numbers

1. **Size**: Numbers should be larger than surrounding text
2. **Weight**: Bold (700) for key metrics
3. **Font**: Monospace for alignment and technical feel
4. **Color**: `text-primary` for main value, `text-accent` for highlights

### Example: Stat Card Number

```html
<span class="text-4xl font-bold font-mono tracking-tight text-text-primary">
  13
</span>
```

### Example: Chart Value

```html
<span class="text-2xl font-semibold font-mono text-accent">
  +24%
</span>
```

---

## Letter Spacing

| Context | Tracking | Tailwind Class |
|---------|----------|----------------|
| Display/Hero | -0.02em | `tracking-tight` |
| Headings | -0.01em | `tracking-tight` |
| Body | 0 | (default) |
| All caps labels | 0.05em | `tracking-wider` |
| Monospace numbers | -0.02em | `tracking-tight` |

---

## Text Colors by Context

| Context | Color Token | Example |
|---------|-------------|---------|
| Page title | `text-primary` | "Overview" |
| Section title | `text-primary` | "Analytics" |
| Card title | `text-primary` | "Run Activity" |
| Body text | `text-secondary` | Descriptions |
| Captions | `text-muted` | Timestamps, hints |
| Disabled | `text-faint` | Inactive items |
| Links | `text-accent` | Interactive text |
| Success text | `text-success` | "+12%" |
| Error text | `text-error` | "3 failed" |

---

## Line Heights

Generous line heights for readability on dark backgrounds.

| Text Size | Line Height | Ratio |
|-----------|-------------|-------|
| Display | 1.1 | Tight for impact |
| Headings | 1.2-1.3 | Balanced |
| Body | 1.5-1.6 | Comfortable reading |
| Small text | 1.4 | Compact but readable |

---

## Responsive Typography

Text scales down slightly on mobile:

```css
/* Mobile */
.text-display { font-size: 2.5rem; }
.text-4xl { font-size: 1.875rem; }

/* Desktop (lg+) */
.text-display { font-size: 3.5rem; }
.text-4xl { font-size: 2.25rem; }
```

---

## Anti-Patterns

| Don't | Why |
|-------|-----|
| Use more than 3 font sizes per component | Creates visual noise |
| Mix font families arbitrarily | Breaks consistency |
| Use light weights (300) on dark backgrounds | Poor readability |
| Center-align body text | Hard to scan |
| Use ALL CAPS for long text | Hard to read |
| Forget monospace for numbers | Misses alignment opportunity |

---

## Tailwind Classes Reference

```
/* Sizes */
text-xs, text-sm, text-base, text-lg, text-xl
text-2xl, text-3xl, text-4xl, text-5xl, text-display

/* Weights */
font-normal (400), font-medium (500)
font-semibold (600), font-bold (700)

/* Families */
font-sans (Instrument Sans)
font-mono (JetBrains Mono)

/* Tracking */
tracking-tighter, tracking-tight, tracking-normal, tracking-wider

/* Colors */
text-text-primary, text-text-secondary
text-text-muted, text-text-faint
text-accent, text-success, text-warning, text-error
```

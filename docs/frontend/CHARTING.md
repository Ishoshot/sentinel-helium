# Sentinel – Charting & Analytics

This document defines standards for charts and analytics visualizations
in Sentinel’s frontend.

All charting and dashboard implementations MUST conform to this document.

---

## Charting Philosophy

Charts in Sentinel exist to:

- communicate trends
- surface signals
- support decision-making

Charts are not decorative.
If a chart does not help the user make a decision, it should not exist.

---

## Charting Library

- Charting library: **ECharts**
- ECharts is the single charting solution for Sentinel
- No secondary charting libraries are permitted

ECharts is chosen for:

- performance
- flexibility
- large dataset handling
- enterprise-grade control

---

## Visual Principles

### Calm by Default

- Charts use neutral colors by default
- Accent color is used sparingly
- Avoid visual noise (heavy grids, excessive labels)

Charts should feel quiet and confident.

---

### Clarity Over Density

- Prefer fewer data series
- Avoid overcrowded charts
- Favor trends over raw values

If interpretation requires explanation, the chart is too complex.

---

## Color Usage in Charts

### Default Palette

- Grayscale for non-critical data
- Sentinel Blue (`#2563EB`) for primary focus
- Semantic colors only for state or severity

Rules:

- Never use multiple accent colors in a single chart
- Avoid rainbow palettes
- Color must reinforce meaning

---

## Chart Types & Usage

### Line Charts

Used for:

- trends over time
- comparisons across periods

Rules:

- Emphasize the primary series
- Secondary series are muted
- Avoid excessive markers

---

### Bar Charts

Used for:

- categorical comparisons
- distribution summaries

Rules:

- Bars should be evenly spaced
- Labels must be legible
- Avoid stacked bars unless necessary

---

### Area Charts

Used sparingly for:

- cumulative trends
- volume over time

Rules:

- Subtle fills only
- Do not obscure gridlines or labels

---

### Tables vs Charts

If exact values matter more than trends:

- use tables

Charts are for patterns, not precision.

---

## Data Handling

### Aggregation

- Charts consume pre-aggregated backend data
- Frontend must not perform heavy aggregation
- Rollups are preferred for dashboards

Frontend aggregation is limited to light formatting.

---

### Time Series Rules

- Time ranges are explicit
- Defaults are conservative (e.g. last 7 or 30 days)
- Timezone handling is consistent and documented

---

## Interaction Patterns

### Hover & Tooltips

- Tooltips are concise
- Show only relevant values
- Avoid cluttered tooltip content

---

### Zoom & Filtering

- Zooming is allowed where it adds value
- Filters must be explicit and reversible
- Hidden interactions are forbidden

---

## Loading & Empty States

### Loading States

- Use skeletons or placeholders
- Preserve layout
- Avoid flashing or abrupt transitions

---

### Empty States

- Clearly explain why no data is shown
- Indicate what action produces data
- Avoid decorative illustrations

---

## Performance Guidelines

- Charts must handle large datasets gracefully
- Avoid rendering unnecessary points
- Prefer backend-side downsampling if needed

Performance issues in charts degrade trust.

---

## Accessibility

- Charts must not rely on color alone
- Use labels and legends clearly
- Ensure sufficient contrast
- Provide textual summaries when necessary

Accessibility is mandatory.

---

## Anti-Patterns (Forbidden)

- Charts without context
- Decorative or purely aesthetic charts
- Client-side heavy aggregation
- Overlapping or unreadable labels
- Excessive animation

---

## Guiding Principles

- Trends over trivia
- Calm over colorful
- Signal over noise
- Clarity over cleverness

---

This document defines Sentinel’s charting standards.

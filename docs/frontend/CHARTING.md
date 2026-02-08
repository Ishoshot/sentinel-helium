# Sentinel – Charting & Data Visualization

This document defines standards for charts and analytics visualizations in Sentinel’s frontend.
All charting implementations MUST conform to these rules.

---

## Charting Library

- **Chart.js** via PrimeVue’s `<Chart>` component
- `AnalyticsChart.vue` is the shared wrapper for consistent styling

No secondary charting libraries are permitted.

---

## Visual Principles

- Calm by default
- Clarity over density
- Single accent per chart
- No decorative charts

---

## Color Usage

Primary series order:
1. Teal `#14b8a6`
2. Blue `#3b82f6`
3. Violet `#8b5cf6`
4. Pink `#ec4899` (avoid if possible)

Semantic usage:
- Success: `#10b981`
- Warning: `#f97316`
- Error: `#f43f5e`
- Neutral: `#71717a`

Fills and hover states should use subtle opacity (10–30%).

---

## Chart Types

- **Line**: trends over time
- **Bar**: categorical comparisons
- **Doughnut**: distribution
- **Area**: volume/cumulative (use sparingly)

---

## Data Handling

- Charts consume pre-aggregated backend data
- Frontend does not perform heavy aggregation
- Prefer rollups for dashboards

---

## Interaction & UX

- Tooltips are concise
- Filters are explicit and reversible
- Hidden interactions are forbidden

---

## Loading & Empty States

- Preserve layout
- Loading uses skeletons
- Empty states explain how to generate data

---

## Accessibility

- Charts must not rely on color alone
- Provide labels or textual summaries when needed

---

## Performance

- Avoid rendering unnecessary points
- Prefer backend downsampling for large datasets

---

This document defines Sentinel’s charting standards.

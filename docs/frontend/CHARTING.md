# Sentinel - Charting

This file defines charting standards for frontend data visualization.

---

## Library Contract

- Use Chart.js via PrimeVue `<Chart>`.
- Reuse shared wrappers/patterns before introducing chart-specific shells.
- Do not add secondary charting libraries.

---

## Chart Type Guidance

- Line: trends over time
- Bar: category comparisons
- Doughnut: composition/distribution
- Area: cumulative/volume trends (limited use)

Choose the simplest chart that answers the question.

---

## Data Contract

- Prefer backend-aggregated datasets.
- Keep frontend transformations lightweight.
- Use server-driven pagination/downsampling for large series.

---

## Visual Rules

- Use Sentinel color tokens from `COLOR_SYSTEM.md`.
- Keep one dominant accent per chart.
- Use semantic colors only for semantic meaning (success/warn/error).
- Tooltips should be concise and readable.

---

## UX Rules

- Loading: preserve chart footprint with skeleton state.
- Empty: explain why there is no data and next action.
- Interactions: discoverable, reversible, and not hidden behind obscure gestures.

---

## Accessibility Rules

- Do not rely on color alone.
- Provide labels/legends that map clearly to data series.
- Provide textual summary when visual interpretation is non-trivial.

---

## Performance Rules

- Avoid rendering unnecessary points.
- Disable expensive visual effects on dense charts.
- Prefer backend downsampling over client-heavy rendering.


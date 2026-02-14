# Sentinel - UX Principle

This file defines the product-facing UX contract for the frontend.
It is intentionally concise and should be used by humans and AI agents when making UI decisions.

---

## Product Intent

Sentinel helps teams ship quality code with confidence.
UX should reduce review friction, increase trust, and keep focus on actionable signal.

---

## Core Principles

### Clarity Over Density

- Show less, but make it meaningful.
- Use progressive disclosure for advanced detail.
- Prefer summaries with drill-down over long noisy lists.

### Signal Over Noise

- Prioritize high-confidence, actionable information.
- Limit badges, alerts, and inline comments to meaningful events.
- Avoid visual or copy noise that does not change user decisions.

### Predictability Over Novelty

- Use familiar patterns and explicit controls.
- Avoid surprising interactions and hidden affordances.
- Keep behavior consistent across pages and workflows.

### Calm, Deliberate Experience

- Keep tone professional and concise.
- Use motion and color with purpose only.
- Avoid decorative effects that distract from work.

### Explainability and Trust

- Make state, outcomes, and limits obvious.
- Never fail silently.
- Explain what happened and what to do next.

---

## Interaction Rules

- Every user action must have visible feedback.
- Loading, success, warning, and failure states must be explicit.
- Destructive actions must be deliberate and clearly labeled.
- Manual triggers (for example review actions) should feel intentional, not reactive.

---

## Review Experience Rules

- Focus reviews on correctness, security, and maintainability.
- Structure findings for scanning: severity, context, and rationale.
- Prioritize confidence and usefulness over total coverage.
- Not every finding should become an inline annotation.

---

## Dashboard and Data Rules

- Optimize for readability first.
- Highlight trends and changes, not raw count overload.
- Keep charts interpretable at a glance.
- Empty states must explain why there is no data and what to do next.

---

## Configuration and Limits Rules

- Keep settings grouped, explicit, and conservative by default.
- If limits are reached, explain the reason and next action clearly.
- Show precedence and override behavior where multiple config layers exist.

---

## Copy and Tone Rules

- Tone: calm, direct, professional.
- Avoid exaggerated claims and anthropomorphic language.
- Prefer specific statements over marketing phrasing.
- Respect user time: short labels, clear actions, concise messages.

---

## Accessibility Baseline

- Sufficient contrast is mandatory.
- Do not rely on color alone for meaning.
- Keyboard navigation is required for interactive flows.
- Motion must respect reduced-motion preferences.

---

## Canonical Product Terms (Frontend)

Use these terms consistently in UI and copy:

- Workspace
- Repository
- Run
- Finding
- Member
- Plan

UI label note:

- "Review" may be used as user-facing language for Runs.
- "Run" remains the canonical system term in data and engineering contexts.

---

## Decision Check

Before shipping a UI change, verify:

1. Does this reduce cognitive load?
2. Does it improve decision quality for the user?
3. Is feedback explicit for success/failure/limits?
4. Is terminology consistent with the canonical product language?
5. Is the behavior predictable on first use?


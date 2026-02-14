# Sentinel - Typography

Typography should make technical information easy to scan.

---

## Font Families

- Primary UI text: `Instrument Sans`
- Code, numeric-heavy values: `JetBrains Mono`

Use monospace for metrics, IDs, tokens, and code-like strings.

---

## Type Scale

| Token | Size | Weight | Primary Use |
|---|---:|---:|---|
| `display` | 56px | 700 | hero metrics |
| `5xl` | 48px | 700 | large hero headings |
| `4xl` | 36px | 700 | page titles |
| `3xl` | 30px | 600 | section headings |
| `2xl` | 24px | 600 | card headings |
| `xl` | 20px | 600 | subsection headings |
| `lg` | 18px | 500 | emphasized body |
| `base` | 16px | 400 | default body |
| `sm` | 14px | 400 | supporting text |
| `xs` | 12px | 400 | labels/captions |

---

## Hierarchy Rules

- One clear heading level per visual block.
- Keep paragraph text left-aligned for readability.
- Avoid excessive size variance inside a single component.
- Use `tracking-tight` for display/hero values where appropriate.

---

## Numeric Emphasis Rules

For key metrics:

- larger than surrounding text
- semibold/bold weight
- monospace when alignment matters
- semantic color only when the value implies status

---

## Color Usage

Use text tokens from `COLOR_SYSTEM.md`:

- primary: headings and key values
- secondary: body content
- muted/faint: metadata and hints
- semantic colors: status values only

---

## Responsive Rules

- Scale display and heading sizes down on mobile.
- Preserve hierarchy proportions across breakpoints.
- Do not let large titles wrap into unreadable stacks.

---

## Anti-Patterns

- arbitrary font family mixing
- long all-caps body text
- light weights on low-contrast backgrounds
- using color alone to indicate semantic meaning


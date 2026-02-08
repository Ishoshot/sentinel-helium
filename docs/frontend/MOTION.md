# Sentinel – Motion & Animation

## Philosophy

Motion serves to:
1. **Guide attention** – Draw eyes to what matters
2. **Provide feedback** – Acknowledge user actions
3. **Create life** – Make the interface feel responsive
4. **Establish hierarchy** – Staggered reveals show importance

Motion should never:
- Distract from content
- Delay user actions
- Feel gratuitous or showy

---

## Timing & Easing

### Duration Scale

| Token | Duration | Usage |
|-------|----------|-------|
| `fast` | 150ms | Micro-interactions, hover states |
| `default` | 200ms | Standard transitions |
| `slow` | 300ms | Page transitions, reveals |
| `slower` | 500ms | Staggered animations |

### Easing Functions

| Name | Value | Usage |
|------|-------|-------|
| `default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, playful |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |

---

## Core Animations

### Fade In

Simple opacity transition for subtle appearances.

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
```

### Fade In Up

Content rises as it appears. Primary entrance animation.

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}
```

### Scale In

Subtle scale for modals and popovers.

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}
```

### Slide In Left/Right

For side panels and drawers.

```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Pulse Glow

Subtle breathing effect for live indicators.

```css
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.3);
  }
  50% {
    box-shadow: 0 0 30px -5px rgba(20, 184, 166, 0.5);
  }
}

.animate-pulse-glow {
  animation: pulseGlow 2s ease-in-out infinite;
}
```

### Shimmer

Loading state effect.

```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.05) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}
```

---

## Staggered Reveals

The signature animation pattern for. Content appears sequentially.

### Implementation

```vue
<template>
  <div class="space-y-4">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="animate-fade-in-up"
      :style="{ animationDelay: `${index * 100}ms` }"
    >
      {{ item.content }}
    </div>
  </div>
</template>
```

### Stagger Timing

| Context | Delay per item |
|---------|----------------|
| Stat cards (4 items) | 75ms |
| List items | 50ms |
| Grid cards | 100ms |
| Large sections | 150ms |

### Rules

1. First item: No delay (immediate)
2. Max total duration: 800ms (don't make users wait)
3. Max items to stagger: 8 (beyond this, batch them)

---

## Hover States

### Card Hover

Cards lift and glow on hover.

```css
.card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.2);
}
```

### Button Hover

Buttons brighten and may scale slightly.

```css
.button {
  transition: background-color 150ms ease, transform 150ms ease;
}

.button:hover {
  background-color: var(--color-accent-hover);
}

.button:active {
  transform: scale(0.98);
}
```

### Link Hover

Links change color smoothly.

```css
.link {
  transition: color 150ms ease;
}

.link:hover {
  color: var(--color-accent-bright);
}
```

### Nav Item Hover

Navigation items slide slightly right.

```css
.nav-item {
  transition: transform 150ms ease, background-color 150ms ease;
}

.nav-item:hover {
  transform: translateX(2px);
  background-color: var(--color-bg-hover);
}
```

---

## Loading States

### Skeleton Loading

Preserve layout with animated placeholders.

```vue
<template>
  <div class="space-y-4">
    <div
      v-for="i in 4"
      :key="i"
      class="h-24 bg-bg-hover rounded-xl animate-shimmer"
    />
  </div>
</template>
```

### Spinner

For inline loading (buttons, small areas).

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

### Chart Loading

Charts show skeleton with subtle pulse.

---

## Page Transitions

### Enter

```css
.page-enter-active {
  transition: opacity 300ms ease, transform 300ms ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
```

### Leave

```css
.page-leave-active {
  transition: opacity 200ms ease;
}

.page-leave-to {
  opacity: 0;
}
```

---

## Micro-Interactions

Small details that add polish.

### Focus Ring Pulse

```css
input:focus {
  animation: focusPulse 200ms ease;
}

@keyframes focusPulse {
  0% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); }
  100% { box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1); }
}
```

### Toggle Switch

```css
.toggle-thumb {
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-on .toggle-thumb {
  transform: translateX(20px);
}
```

### Checkbox Check

```css
.checkbox-check {
  transform: scale(0);
  transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.checkbox-checked .checkbox-check {
  transform: scale(1);
}
```

---

## Animation Utilities (Tailwind)

```
/* Entrance */
animate-fade-in
animate-fade-in-up
animate-fade-in-down
animate-scale-in
animate-slide-in-left
animate-slide-in-right

/* Continuous */
animate-pulse-glow
animate-shimmer
animate-spin

/* Delays */
animation-delay: 100ms, 200ms, 300ms, etc.
(use inline style)
```

---

## Performance Rules

1. **Use `transform` and `opacity`** – GPU accelerated
2. **Avoid animating `width`, `height`, `margin`** – Causes reflows
3. **Use `will-change` sparingly** – Only on frequently animated elements
4. **Respect `prefers-reduced-motion`** – Disable animations for users who prefer it

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Anti-Patterns

| Don't | Why |
|-------|-----|
| Animate everything | Creates visual chaos |
| Use long durations (>500ms) | Feels sluggish |
| Block user actions during animation | Frustrating UX |
| Use complex easing everywhere | Save for special moments |
| Animate on page load without stagger | Jarring |
| Forget reduced motion support | Accessibility issue |

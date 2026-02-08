# Sentinel – Implementation Plan

## Overview

This document outlines the step-by-step implementation of the design system.
Follow this plan sequentially for best results.

---

## Phase 1: Foundation (Design System)

### 1.1 Tailwind Configuration ✅
- [x] Update `tailwind.config.ts` with colors
- [x] Add animation keyframes
- [x] Add shadow utilities
- [x] Add font configurations

**File**: `tailwind.config.ts`

### 1.2 CSS Variables
- [ ] Update `main.css` with dark theme variables
- [ ] Add component utility classes
- [ ] Add animation utilities

**File**: `app/assets/css/main.css`

### 1.3 Base Components
- [ ] Update `BaseCard.vue` with dark styling and hover effects
- [ ] Update `BaseButton.vue` with new variants
- [ ] Update `BaseBadge.vue` with semantic colors
- [ ] Update `BaseInput.vue` with dark styling
- [ ] Update `BaseSpinner.vue` with accent color
- [ ] Update `BaseAvatar.vue` with dark borders
- [ ] Update `BaseEmptyState.vue` with dark styling

**Files**: `app/components/base/*.vue`

---

## Phase 2: Layout

### 2.1 Default Layout
- [ ] Update sidebar to dark theme
- [ ] Update nav items with new active state (accent gradient)
- [ ] Update header with dark styling
- [ ] Add subtle animations to nav

**File**: `app/layouts/default.vue`

### 2.2 Auth Layout
- [ ] Update login page background
- [ ] Update card styling

**File**: `app/layouts/auth.vue`

---

## Phase 3: Dashboard Page

### 3.1 Page Structure
- [ ] Update page header styling
- [ ] Add staggered animation to sections

**File**: `app/pages/[workspace]/index.vue`

### 3.2 Stat Cards
- [ ] Update `StatCard.vue` with hero number styling
- [ ] Add icon background with accent
- [ ] Add trend indicators

**File**: `app/components/domain/workspace/StatCard.vue`

### 3.3 Analytics Overview
- [ ] Update `AnalyticsOverview.vue` with stagger animation
- [ ] Ensure responsive grid

**File**: `app/components/domain/analytics/AnalyticsOverview.vue`

### 3.4 Getting Started Card
- [ ] Update `GettingStartedCard.vue` with dark styling
- [ ] Add progress animation

**File**: `app/components/domain/workspace/GettingStartedCard.vue`

---

## Phase 4: Charts

### 4.1 Chart Wrapper
- [ ] Update `AnalyticsChart.vue` with global dark theme options
- [ ] Configure tooltip, legend, grid styles

**File**: `app/components/domain/analytics/AnalyticsChart.vue`

### 4.2 Individual Charts
Update each with color palette:

- [ ] `TimelineChart.vue` - Emerald/Rose for success/fail
- [ ] `FindingsDistributionChart.vue` - Severity colors
- [ ] `TopCategoriesChart.vue` - Teal gradient bars
- [ ] `TokenUsageChart.vue` - Teal with gradient fill
- [ ] `SuccessRateChart.vue` - Emerald line
- [ ] `QualityScoreChart.vue` - Teal line
- [ ] `DurationTrendsChart.vue` - Multi-line with colors
- [ ] `ResolutionRateChart.vue` - Stacked with colors
- [ ] `VelocityChart.vue` - Multi-line with colors

**Files**: `app/components/domain/analytics/*.vue`

### 4.3 Tables
- [ ] `DeveloperLeaderboardTable.vue` - Dark table styling
- [ ] `RepositoryActivityTable.vue` - Dark table styling

---

## Phase 5: Dashboard Secondary Sections

### 5.1 Activity Feed
- [ ] Update `ActivityItem.vue` with dark styling
- [ ] Add timeline connector styling

**File**: `app/components/domain/workspace/ActivityItem.vue`

### 5.2 Team Section
- [ ] Update `MemberPreview.vue` with dark styling

**File**: `app/components/domain/members/MemberPreview.vue`

---

## Phase 6: Polish & Animation

### 6.1 Page Load Animation
- [ ] Add staggered fade-in-up to all dashboard sections
- [ ] Ensure smooth loading states

### 6.2 Hover States
- [ ] Verify all cards have hover lift
- [ ] Verify buttons have proper feedback
- [ ] Verify nav items animate correctly

### 6.3 Accessibility Check
- [ ] Verify color contrast
- [ ] Test keyboard navigation
- [ ] Check reduced motion support

---

## Phase 7: End-to-End (After Dashboard)

### 7.1 Auth Pages
- [ ] Login page
- [ ] Error page
- [ ] Callback page

### 7.2 Workspace Pages
- [ ] Repositories page
- [ ] Repository detail page
- [ ] Code Reviews page
- [ ] Run detail page
- [ ] Briefings page
- [ ] Briefing detail page
- [ ] Members page
- [ ] Settings pages
- [ ] Billing page
- [ ] Learn page

### 7.3 Public Pages
- [ ] Landing page (consider keeping light?)
- [ ] Pricing page
- [ ] Terms page
- [ ] Privacy page

### 7.4 Modals & Overlays
- [ ] All modals
- [ ] Dropdowns
- [ ] Notifications
- [ ] Toast messages

---

## File Change Summary

### Config Files
- `tailwind.config.ts` ✅
- `app/assets/css/main.css`
- `nuxt.config.ts` (if needed for fonts)

### Base Components (8 files)
- `app/components/base/BaseCard.vue`
- `app/components/base/BaseButton.vue`
- `app/components/base/BaseBadge.vue`
- `app/components/base/BaseInput.vue`
- `app/components/base/BaseSpinner.vue`
- `app/components/base/BaseAvatar.vue`
- `app/components/base/BaseEmptyState.vue`
- `app/components/base/BaseModal.vue`

### Layout (2 files)
- `app/layouts/default.vue`
- `app/layouts/auth.vue`

### Dashboard Components (15+ files)
- `app/pages/[workspace]/index.vue`
- `app/components/domain/workspace/StatCard.vue`
- `app/components/domain/workspace/GettingStartedCard.vue`
- `app/components/domain/workspace/ActivityItem.vue`
- `app/components/domain/analytics/AnalyticsOverview.vue`
- `app/components/domain/analytics/AnalyticsChart.vue`
- `app/components/domain/analytics/TimelineChart.vue`
- `app/components/domain/analytics/FindingsDistributionChart.vue`
- `app/components/domain/analytics/TopCategoriesChart.vue`
- `app/components/domain/analytics/TokenUsageChart.vue`
- `app/components/domain/analytics/SuccessRateChart.vue`
- `app/components/domain/analytics/QualityScoreChart.vue`
- `app/components/domain/analytics/DurationTrendsChart.vue`
- `app/components/domain/analytics/ResolutionRateChart.vue`
- `app/components/domain/analytics/VelocityChart.vue`
- `app/components/domain/analytics/DeveloperLeaderboardTable.vue`
- `app/components/domain/analytics/RepositoryActivityTable.vue`
- `app/components/domain/members/MemberPreview.vue`

---

## Estimated Scope

| Phase | Components | Effort |
|-------|------------|--------|
| Phase 1 | 9 files | Foundation |
| Phase 2 | 2 files | Layout |
| Phase 3 | 4 files | Dashboard structure |
| Phase 4 | 12 files | Charts |
| Phase 5 | 2 files | Secondary sections |
| Phase 6 | Polish | Refinement |
| **Total** | ~30 files | Dashboard complete |

---

## Success Criteria

Dashboard is complete when:

1. [ ] All surfaces are dark themed
2. [ ] Accent color is consistently teal
3. [ ] Typography hierarchy is clear
4. [ ] Charts use cohesive color palette
5. [ ] Stagger animations work on page load
6. [ ] Hover states provide feedback
7. [ ] Loading states are smooth
8. [ ] Empty states are styled
9. [ ] Contrast meets accessibility standards
10. [ ] Looks premium and distinctive

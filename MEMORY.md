# Sentinel Project Memory

> Living document for AI context persistence. Update after each significant session.

**Last Updated:** 2026-01-09

---

## Product Identity

**Name:** Sentinel
**Type:** Source-control-native code review platform
**Tagline:** Calm, high-signal code reviews for engineering teams

### Core Problem
Engineering teams face pressure to move fast while maintaining quality. Existing tools are noisy, opaque, or hard to configure. Human reviewers experience fatigue and inconsistency.

### Solution
Automated code review that:
- Integrates into existing workflows (GitHub, future GitLab)
- Surfaces only high-confidence findings
- Provides explainable, actionable feedback
- Offers long-term code health insights

---

## Product Goals

| Goal | Description |
|------|-------------|
| **Trust** | Earn developer trust through accuracy and explainability |
| **Signal** | High-confidence findings only, no noise |
| **Calm** | UI feels quiet, professional, Apple-inspired |
| **Control** | Teams configure policies, thresholds, behavior |
| **Enterprise** | Multi-tenant, BYOK AI, audit trails |

---

## Target Users

| Role | Needs |
|------|-------|
| Software Engineers | Quick, accurate feedback on PRs |
| Tech Leads | Consistent review quality across team |
| Engineering Managers | Visibility into code health trends |
| Platform/Security Engineers | Policy enforcement, security insights |

---

## Domain Vocabulary (Canonical)

Use these exact terms. No synonyms.

| Term | Definition |
|------|------------|
| **Workspace** | Primary tenant boundary (not "organization") |
| **Team** | Membership container within Workspace |
| **Member** | User belonging to a Team |
| **Provider** | Source control platform (GitHub, GitLab) |
| **Connection** | Link between Workspace and Provider |
| **Installation** | Sentinel instance within Provider account |
| **Repository** | Connected source code repo |
| **Run** | Single review execution (immutable) |
| **Finding** | Discrete issue from a Run |
| **Annotation** | Finding surfaced to source control |
| **Policy** | Rules/thresholds governing reviews |
| **Plan** | Subscription tier |
| **Provider Key** | BYOK credential for AI provider |

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | Nuxt 4 |
| Language | TypeScript (strict, no `any`) |
| UI Framework | Vue 3 Composition API only |
| Styling | Tailwind CSS + Design Tokens |
| Components | PrimeVue (themed) |
| Icons | Iconify (outline style) |
| Charts | ECharts |
| Package Manager | pnpm |

**Forbidden:** Options API, raw hex colors, arbitrary values, `any` type

---

## Architecture Pattern

```
┌─────────────────────────────────────────────────┐
│                    Pages                        │
│            (compose views, route endpoints)     │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│                 Composables                     │
│     (orchestrate logic, manage loading/error)   │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│                  Services                       │
│         (API calls, data normalization)         │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│                 Components                      │
│      (presentational, props in, events out)     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                   Stores                        │
│   (minimal: user session, workspace, flags)     │
└─────────────────────────────────────────────────┘
```

**Rules:**
- Components NEVER fetch data
- Services NEVER manage UI state
- Stores are minimal, not mirrors of backend
- Backend is source of truth

---

## Design Principles

| Principle | Meaning |
|-----------|---------|
| Grayscale-first | Interface works without color |
| Single accent | Sentinel Blue `#2563EB` only |
| Semantic color | Success/Warning/Error sparingly |
| Whitespace | Generous, intentional spacing |
| Calm motion | Subtle transitions, never decorative |
| Signal over noise | Show only what matters |

---

## Color Palette (Quick Reference)

| Purpose | Token | Value |
|---------|-------|-------|
| App background | `--color-bg-app` | `#F9FAFB` |
| Surface | `--color-bg-surface` | `#F3F4F6` |
| Elevated | `--color-bg-elevated` | `#FFFFFF` |
| Border subtle | `--color-border-subtle` | `#E5E7EB` |
| Border muted | `--color-border-muted` | `#D1D5DB` |
| Text primary | `--color-text-primary` | `#111827` |
| Text secondary | `--color-text-secondary` | `#374151` |
| Text muted | `--color-text-muted` | `#6B7280` |
| Accent | `--color-accent-primary` | `#2563EB` |
| Success | `--color-success` | `#16A34A` |
| Warning | `--color-warning` | `#D97706` |
| Error | `--color-error` | `#DC2626` |

---

## MVP Features (v0.1)

| Feature | Status | Notes |
|---------|--------|-------|
| Automated Code Reviews | 🔲 Pending | Core feature |
| Manual Review Triggers | 🔲 Pending | `/review` comment |
| Review Governance | 🔲 Pending | Policies, thresholds |
| Findings Display | 🔲 Pending | Severity, category |
| Dashboards | 🔲 Pending | Trends, analytics |
| Workspace Management | ✅ Complete | Multi-tenant, OAuth auth |
| Repository Connection | 🔲 Pending | GitHub first |
| BYOK Configuration | 🔲 Pending | Provider keys |

---

## Project Stages

### Stage 1: Foundation ✅ COMPLETE
- [x] Project initialized (Nuxt 4)
- [x] Documentation complete
- [x] Design system tokens configured
- [x] Base components created
- [x] Layout structure established

### Stage 2: Core UI ✅ COMPLETE
- [x] Authentication flow (OAuth GitHub/Google)
- [x] Workspace selection/switching
- [x] Members management
- [x] Basic navigation

### Stage 3: Review Experience
- [ ] Run listing and details
- [ ] Findings display
- [ ] Finding detail view
- [ ] Annotations preview

### Stage 4: Dashboards
- [ ] Overview dashboard
- [ ] Repository insights
- [ ] Trends visualization
- [ ] Findings analytics

### Stage 5: Settings & Configuration
- [ ] Workspace settings
- [ ] Repository settings
- [ ] Policy configuration
- [ ] Provider key management

### Stage 6: Polish & Enterprise
- [ ] Error states
- [ ] Empty states
- [ ] Loading skeletons
- [ ] Accessibility audit

---

## Current State

**Stage:** 3 - Review Experience (Next)
**Focus:** Run and Findings UI
**Branch:** `dev`

### Completed This Session
- [x] Tailwind CSS configured with design tokens
- [x] PrimeVue configured in unstyled mode
- [x] Pinia stores created (user, workspace)
- [x] API client and services created
- [x] Composables created (useAuth, useWorkspaces, useMembers, useInvitations)
- [x] Layouts created (auth, default)
- [x] Base components created (Button, Input, Card, Badge, Avatar, Dropdown, Modal, Spinner, Skeleton)
- [x] Domain components created (WorkspaceSwitcher, UserMenu, MemberRow, InvitationRow, InviteForm, OAuthButton)
- [x] Pages created (login, auth callback/error, workspace dashboard/members/settings, invitations)
- [x] Middleware created (auth, guest, workspace)
- [x] Build verified successfully

### Next Actions
1. Implement Repository connection feature
2. Build Run listing and details pages
3. Create Findings display components
4. Add dashboard analytics

---

## File Structure (Actual)

```
app/
├── assets/
│   └── css/
│       └── main.css              # Tailwind + design tokens
├── components/
│   ├── base/
│   │   ├── BaseAvatar.vue
│   │   ├── BaseBadge.vue
│   │   ├── BaseButton.vue
│   │   ├── BaseCard.vue
│   │   ├── BaseDropdown.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   ├── BaseSkeleton.vue
│   │   └── BaseSpinner.vue
│   └── domain/
│       ├── InvitationRow.vue
│       ├── InviteForm.vue
│       ├── MemberRoleBadge.vue
│       ├── MemberRow.vue
│       ├── OAuthButton.vue
│       ├── UserMenu.vue
│       └── WorkspaceSwitcher.vue
├── composables/
│   ├── useAuth.ts
│   ├── useInvitations.ts
│   ├── useMembers.ts
│   └── useWorkspaces.ts
├── layouts/
│   ├── auth.vue
│   └── default.vue
├── middleware/
│   ├── auth.ts
│   ├── guest.ts
│   └── workspace.ts
├── pages/
│   ├── index.vue
│   ├── login.vue
│   ├── auth/
│   │   ├── callback.vue
│   │   └── error.vue
│   ├── invitations/
│   │   └── [token].vue
│   └── [workspace]/
│       ├── index.vue
│       ├── members.vue
│       └── settings.vue
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── invitationsService.ts
│   ├── membersService.ts
│   └── workspaceService.ts
├── stores/
│   ├── useUserStore.ts
│   └── useWorkspaceStore.ts
├── types/
│   └── index.ts
└── app.vue
```

---

## Key Documentation Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | AI agent rules (read first) |
| `MEMORY.md` | This file - project context |
| `docs/product/PRD.md` | Product requirements |
| `docs/product/GLOSSARY.md` | Domain vocabulary |
| `docs/frontend/DESIGN_SYSTEM.md` | Visual foundations |
| `docs/frontend/FRONTEND_ARCHITECTURE.md` | Code structure |
| `docs/frontend/COMPONENT_STANDARDS.md` | Component rules |
| `docs/frontend/STATE_AND_DATA.md` | Data flow |
| `docs/frontend/COLOR_PALETTE.md` | Color quick reference |
| `llms-full.txt` | PrimeVue full documentation for AI agents |

---

## PrimeVue Reference

The `llms-full.txt` file at the project root contains comprehensive PrimeVue documentation optimized for AI agents. Use this file when:

- Implementing PrimeVue components
- Configuring theming and presets
- Understanding Pass Through (PT) options
- Looking up component props, events, and slots

**Key PrimeVue concepts:**
- Using **unstyled mode** with Tailwind CSS
- Design tokens for theming
- Pass Through API for DOM customization
- Aura preset as base theme

---

## Session Log

| Date | Summary |
|------|---------|
| 2026-01-09 | Initial session: Read docs, created COLOR_PALETTE.md and MEMORY.md |
| 2026-01-09 | Identity & Workspace Foundation: Implemented full auth flow (OAuth), workspace management, members, invitations. Created 47 files including types, services, stores, composables, components, pages, middleware. Build verified. |
| 2026-01-09 | Landing Page Redesign: Transformed dark mode landing to award-winning light mode design. Implemented Apple-inspired grayscale-first design with Sentinel Blue accent. Added hero with staggered animations, product mockup, features grid, pricing tiers, testimonial, and CTAs. Added PrimeVue llms-full.txt reference to project memory. |

---

## Notes for Future Sessions

1. **Always read CLAUDE.md first** - Contains enforcement rules
2. **Check current stage** - See "Current State" section above
3. **Update this file** - After significant work, update status and session log
4. **Use exact terminology** - Domain vocabulary is strict
5. **Follow architecture** - Components don't fetch, services don't hold state

---

*Update this document after each session to maintain continuity.*

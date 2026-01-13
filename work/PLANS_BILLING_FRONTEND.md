# Frontend Handover: Plans & Billing System

> **Target**: Nuxt 4 application
> **Purpose**: Complete context for implementing Plans & Billing features in the frontend.
> This document provides all backend context, APIs, data structures, and business logic. Use existing frontend patterns and components.

---

## Business Context

### What This System Does

Sentinel uses a subscription-based model where:

1. **Workspaces** have a **Plan** that defines their capabilities
2. **Plans** control limits (reviews per month, team size) and feature access
3. **Usage** is tracked monthly (runs, findings, annotations)
4. **Billing** is handled externally via Polar (checkout redirects, customer portal)

### Plan Tiers

| Tier                         | Description                                                                             | Monthly | Yearly |
| ---------------------------- | --------------------------------------------------------------------------------------- | ------- | ------ |
| **Foundation** (free)        | For individual developers and small projects getting started with trusted code review.  | $0      | $0     |
| **Illuminate**               | For growing teams that want deeper insight and consistent code quality across projects. | $20     | $210   |
| **Orchestrate**              | For professional teams coordinating code quality at scale across multiple repositories. | $50     | $450   |
| **Sanctum**                  | For organizations that require governance, security, and reliability guarantees.        | $200    | $2,100 |

### Feature Flags

These boolean flags control what users can access:

| Key                 | What It Controls                                               |
| ------------------- | -------------------------------------------------------------- |
| `byok_enabled`      | Can add their own AI provider API keys                         |
| `custom_guidelines` | Can define custom review guidelines in `.sentinel/config.yaml` |
| `priority_queue`    | Gets faster review processing                                  |
| `api_access`        | Can use REST API with tokens                                   |
| `sso_enabled`       | Can use enterprise Single Sign-On                              |
| `audit_logs`        | Gets extended audit logging                                    |

### Subscription Statuses

| Status     | Meaning                                |
| ---------- | -------------------------------------- |
| `active`   | Normal paid/Foundation subscription    |
| `trialing` | In trial period                        |
| `past_due` | Payment failed, grace period           |
| `canceled` | Subscription cancelled, will downgrade |

---

## API Reference

All endpoints are authenticated. Replace `{workspace}` with the workspace UUID.

---

### GET `/api/plans`

**Purpose**: List all available subscription plans for display on pricing/upgrade pages.

**When to call**: When showing plan comparison, upgrade options, or pricing page.

**Response** `200 OK`:

```json
{
    "data": [
        {
            "id": 1,
            "tier": "foundation",
            "description": "For individual developers and small projects getting started with trusted code review.",
            "monthly_runs_limit": 20,
            "team_size_limit": 2,
            "features": {
                "byok_enabled": true,
                "custom_guidelines": false,
                "priority_queue": false,
                "api_access": false,
                "sso_enabled": false,
                "audit_logs": false
            },
            "price_monthly_cents": 0,
            "price_monthly": "0.00",
            "price_yearly_cents": 0,
            "price_yearly": "0.00",
            "yearly_savings_percent": 0,
            "currency": "USD"
        },
        {
            "id": 2,
            "tier": "illuminate",
            "description": "For growing teams that want deeper insight and consistent code quality across projects.",
            "monthly_runs_limit": 500,
            "team_size_limit": 5,
            "features": {
                "byok_enabled": true,
                "custom_guidelines": true,
                "priority_queue": true,
                "api_access": false,
                "sso_enabled": false,
                "audit_logs": false
            },
            "price_monthly_cents": 2000,
            "price_monthly": "20.00",
            "price_yearly_cents": 21000,
            "price_yearly": "210.00",
            "yearly_savings_percent": 12,
            "currency": "USD"
        },
        {
            "id": 3,
            "tier": "orchestrate",
            "description": "For professional teams coordinating code quality at scale across multiple repositories.",
            "monthly_runs_limit": 2000,
            "team_size_limit": null,
            "features": {
                "byok_enabled": true,
                "custom_guidelines": true,
                "priority_queue": true,
                "api_access": true,
                "sso_enabled": false,
                "audit_logs": false
            },
            "price_monthly_cents": 5000,
            "price_monthly": "50.00",
            "price_yearly_cents": 45000,
            "price_yearly": "450.00",
            "yearly_savings_percent": 25,
            "currency": "USD"
        },
        {
            "id": 4,
            "tier": "sanctum",
            "description": "For organizations that require governance, security, and reliability guarantees.",
            "monthly_runs_limit": null,
            "team_size_limit": null,
            "features": {
                "byok_enabled": true,
                "custom_guidelines": true,
                "priority_queue": true,
                "api_access": true,
                "sso_enabled": true,
                "audit_logs": true
            },
            "price_monthly_cents": 20000,
            "price_monthly": "200.00",
            "price_yearly_cents": 210000,
            "price_yearly": "2100.00",
            "yearly_savings_percent": 12,
            "currency": "USD"
        }
    ]
}
```

**Important notes**:

-   `null` for `monthly_runs_limit` or `team_size_limit` means **unlimited**
-   `null` for price fields means **contact sales / custom pricing**
-   `yearly_savings_percent` is the percent saved vs monthly pricing

---

### GET `/api/workspaces/{workspace}/subscription`

**Purpose**: Get the current workspace's subscription status and plan details.

**When to call**: On workspace load, settings pages, anywhere you need to check current plan or limits.

**Response** `200 OK`:

```json
{
    "data": {
        "workspace_id": "01942d8a-aaaa-7abc-8def-123456789abc",
        "plan": {
            "id": 2,
            "tier": "illuminate",
            "description": "For growing teams that want deeper insight and consistent code quality across projects.",
            "monthly_runs_limit": 500,
            "team_size_limit": 5,
            "features": {
                "byok_enabled": true,
                "custom_guidelines": true,
                "priority_queue": true,
                "api_access": false,
                "sso_enabled": false,
                "audit_logs": false
            },
            "price_monthly_cents": 2000,
            "price_monthly": "20.00",
            "price_yearly_cents": 21000,
            "price_yearly": "210.00",
            "yearly_savings_percent": 12,
            "currency": "USD"
        },
        "status": "active",
        "trial_ends_at": null
    }
}
```

**Response when no plan assigned** (shouldn't happen, but handle it):

```json
{
    "data": {
        "workspace_id": "...",
        "plan": null,
        "status": null,
        "trial_ends_at": null
    }
}
```

**Field notes**:

-   `status` is one of: `active`, `trialing`, `past_due`, `canceled`
-   `trial_ends_at` is ISO 8601 timestamp or `null`
-   `plan` contains full plan details (same structure as `/api/plans` response items)

---

### GET `/api/workspaces/{workspace}/usage`

**Purpose**: Get current billing period usage statistics.

**When to call**: Dashboard, billing page, anywhere showing usage meters.

**Response** `200 OK`:

```json
{
    "data": {
        "workspace_id": "01942d8a-aaaa-7abc-8def-123456789abc",
        "period_start": "2026-01-01",
        "period_end": "2026-01-31",
        "runs_count": 47,
        "findings_count": 156,
        "annotations_count": 142
    }
}
```

**Field notes**:

-   `period_start` and `period_end` are `YYYY-MM-DD` format
-   `runs_count` is what counts against `monthly_runs_limit`
-   `findings_count` and `annotations_count` are informational (no limit)

---

### POST `/api/workspaces/{workspace}/subscription/upgrade`

**Purpose**: Initiate an upgrade to a different plan. Returns a Polar checkout URL.

**When to call**: User clicks "Upgrade" or selects a new plan.

**Request body**:

```json
{
    "plan_tier": "illuminate",
    "billing_interval": "yearly",
    "promo_code": "LAUNCH2026"
}
```

**Fields**:

-   `plan_tier` (required): `illuminate`, `orchestrate`, or `sanctum`
-   `billing_interval` (optional, default `monthly`): `monthly` or `yearly`
-   `promo_code` (optional): Promotion code to apply at checkout

**Response** `200 OK`:

```json
{
    "data": {
        "checkout_url": "https://buy.polar.sh/checkout/abc123...",
        "billing_interval": "yearly",
        "promotion": {
            "code": "LAUNCH2026",
            "discount": "20% off"
        }
    }
}
```

**What to do**: Redirect the user to `checkout_url`. After payment, Polar will redirect back to your app and the backend receives a webhook to activate the subscription.

**Error responses**:

`422 Unprocessable Entity` - Invalid plan or already on this plan:

```json
{
    "message": "You are already on this plan.",
    "errors": {
        "plan_tier": ["You are already on this plan."]
    }
}
```

`422 Unprocessable Entity` - Invalid billing interval:

```json
{
    "message": "Billing interval must be monthly or yearly.",
    "errors": {
        "billing_interval": ["Billing interval must be monthly or yearly."]
    }
}
```

`403 Forbidden` - Not authorized:

```json
{
    "message": "Only workspace owners can manage subscriptions."
}
```

---

### POST `/api/workspaces/{workspace}/subscription/cancel`

**Purpose**: Cancel the current subscription. Workspace will downgrade to Foundation at end of billing period.

**When to call**: User confirms they want to cancel.

**Request body**: None required.

**Response** `200 OK`:

```json
{
    "message": "Subscription cancelled. You will be downgraded to Foundation at the end of your billing period."
}
```

**Error responses**:

`422 Unprocessable Entity` - Already on Foundation:

```json
{
    "message": "You are already on the Foundation plan."
}
```

`403 Forbidden` - Not authorized:

```json
{
    "message": "Only workspace owners can manage subscriptions."
}
```

---

### POST `/api/workspaces/{workspace}/subscription/portal`

**Purpose**: Get a URL to the Polar customer portal where users can manage payment methods, view invoices, etc.

**When to call**: User clicks "Manage Billing" or similar.

**Request body**: None required.

**Response** `200 OK`:

```json
{
    "data": {
        "portal_url": "https://polar.sh/portal/abc123..."
    }
}
```

**What to do**: Open `portal_url` in a new tab or redirect. This is Polar's hosted billing management UI.

**Error responses**:

`500 Internal Server Error` - Polar not configured:

```json
{
    "message": "Billing portal is not available."
}
```

---

## Environment Variables (Backend)

Yearly checkout URLs are configured via environment variables:

```env
# Monthly checkout URLs
POLAR_CHECKOUT_ILLUMINATE_MONTHLY_URL=
POLAR_CHECKOUT_ORCHESTRATE_MONTHLY_URL=
POLAR_CHECKOUT_SANCTUM_MONTHLY_URL=

# Yearly checkout URLs
POLAR_CHECKOUT_ILLUMINATE_YEARLY_URL=
POLAR_CHECKOUT_ORCHESTRATE_YEARLY_URL=
POLAR_CHECKOUT_SANCTUM_YEARLY_URL=
```

---

## Backend Enforcement Behavior

The backend enforces limits. When limits are reached, relevant API calls return errors:

### When monthly review limit is reached

Any attempt to create a new review run returns:

```json
{
    "message": "Monthly review limit reached. Upgrade your plan to continue.",
    "code": "runs_limit"
}
```

### When team size limit is reached

Attempting to invite a new team member returns:

```json
{
    "message": "Team size limit reached. Upgrade your plan to invite more members.",
    "code": "team_size_limit"
}
```

### When a feature is not available

Attempting to use a feature not in the plan returns:

```json
{
    "message": "Custom guidelines are not available on your current plan.",
    "code": "custom_guidelines"
}
```

Other feature codes: `byok_enabled`, `priority_queue`, `api_access`, `sso_enabled`, `audit_logs`

---

## TypeScript Types

```typescript
// Plan tier values
type PlanTier = "foundation" | "illuminate" | "orchestrate" | "sanctum";
type BillingInterval = "monthly" | "yearly";

// Subscription status values
type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

// Feature flag keys
type PlanFeatureKey =
    | "byok_enabled"
    | "custom_guidelines"
    | "priority_queue"
    | "api_access"
    | "sso_enabled"
    | "audit_logs";

// Features object shape
interface PlanFeatures {
    byok_enabled: boolean;
    custom_guidelines: boolean;
    priority_queue: boolean;
    api_access: boolean;
    sso_enabled: boolean;
    audit_logs: boolean;
}

// Plan object from API
interface Plan {
    id: number;
    tier: PlanTier;
    description: string | null;
    monthly_runs_limit: number | null; // null = unlimited
    team_size_limit: number | null; // null = unlimited
    features: PlanFeatures;
    price_monthly_cents: number | null; // null = custom pricing
    price_monthly: string | null; // formatted price or null
    price_yearly_cents: number | null; // null = custom pricing
    price_yearly: string | null; // formatted price or null
    yearly_savings_percent: number;
    currency: string | null; // "USD" or null
}

// Subscription object from API
interface Subscription {
    workspace_id: string;
    plan: Plan | null;
    status: SubscriptionStatus | null;
    trial_ends_at: string | null; // ISO 8601 or null
}

// Usage object from API
interface Usage {
    workspace_id: string;
    period_start: string; // YYYY-MM-DD
    period_end: string; // YYYY-MM-DD
    runs_count: number;
    findings_count: number;
    annotations_count: number;
}

// Upgrade request
interface UpgradeRequest {
    plan_tier: Exclude<PlanTier, "foundation">;
    billing_interval?: BillingInterval;
    promo_code?: string | null;
}

// Checkout response
interface CheckoutResponse {
    checkout_url: string;
    billing_interval: BillingInterval;
    promotion?: {
        code: string;
        discount: string;
    } | null;
}

// Portal response
interface PortalResponse {
    portal_url: string;
}

// Limit error from backend
interface LimitError {
    message: string;
    code?: string;
}
```

---

## Frontend Responsibilities

Based on this backend, the frontend should:

### Display & Information

-   Show current plan and subscription status
-   Display usage statistics with progress toward limits
-   List available plans for comparison
-   Show which features are available/locked based on current plan

### User Actions

-   Allow upgrading to a higher plan (redirect to Polar checkout)
-   Allow cancelling subscription (confirm dialog recommended)
-   Allow accessing billing portal (Polar hosted)

### Limit Handling

-   Show warnings when approaching limits (e.g., 80%+ usage)
-   Display clear messaging when limits are reached
-   Provide upgrade path from limit error states

### Feature Gating

-   Check `plan.features[featureKey]` before showing/enabling features
-   Show upgrade prompts when users try to access locked features

---

## Key Implementation Notes

1. **`null` means unlimited** - For both `monthly_runs_limit` and `team_size_limit`, a `null` value means no limit. Display as "Unlimited" or "∞".

2. **`null` price means custom** - If pricing fields are null, display "Contact Sales" or "Custom".

3. **Limits are enforced server-side** - The frontend should display limits but cannot bypass them. Always handle limit errors from API responses.

4. **Billing is external** - Upgrades and billing management redirect to Polar. After Polar processes payment, it sends a webhook to our backend which updates the subscription.

5. **Subscription is on Workspace** - The subscription status lives on the workspace model, not a separate subscription table. A workspace always has a plan (defaults to Foundation).

6. **Only owners can manage billing** - The backend enforces that only workspace owners can upgrade, cancel, or access the billing portal.

7. **Yearly billing** - The `billing_interval` field controls whether checkout uses monthly or yearly pricing. Yearly usually includes a savings percentage.

8. **Promo codes** - `promo_code` is optional and validated by the backend. Surface validation errors from `errors.promo_code[0]`.

---

_Generated: 2026-01-12_

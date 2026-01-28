/**
 * Billing, Plans, and Subscription types
 */

export type PlanTier = "foundation" | "illuminate" | "orchestrate" | "sanctum";
export type PaidPlanTier = Exclude<PlanTier, "foundation">;

export type BillingInterval = "monthly" | "yearly";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled";

export type PlanFeatureKey =
  | "byok_enabled"
  | "custom_guidelines"
  | "priority_queue"
  | "api_access"
  | "sso_enabled"
  | "audit_logs";

export interface PlanFeatures {
  byok_enabled: boolean;
  custom_guidelines: boolean;
  priority_queue: boolean;
  api_access: boolean;
  sso_enabled: boolean;
  audit_logs: boolean;
}

export interface Plan {
  id: number;
  tier: PlanTier;
  description: string | null;
  monthly_runs_limit: number | null;
  monthly_commands_limit: number | null;
  team_size_limit: number | null;
  features: PlanFeatures;
  price_monthly_cents: number | null;
  price_monthly: string | null;
  price_yearly_cents: number | null;
  price_yearly: string | null;
  yearly_savings_percent: number;
  currency: string | null;
}

export interface Subscription {
  workspace_id: string;
  plan: Plan | null;
  status: SubscriptionStatus | null;
  trial_ends_at: string | null;
}

export interface Usage {
  workspace_id: string;
  period_start: string;
  period_end: string;
  runs_count: number;
  findings_count: number;
  annotations_count: number;
}

export interface ChangeRequest {
  plan_tier: PlanTier;
  billing_interval?: BillingInterval;
  promo_code?: string | null;
}

export interface Promotion {
  code: string;
  discount: string;
}

export interface CheckoutResponse {
  checkout_url: string;
  billing_interval: BillingInterval;
  promotion?: Promotion | null;
}

export interface DirectChangeResponse {
  plan: Plan;
  status: SubscriptionStatus;
  billing_interval?: BillingInterval;
}

export type ChangeResponse = CheckoutResponse | DirectChangeResponse;

export function isCheckoutResponse(response: ChangeResponse): response is CheckoutResponse {
  return "checkout_url" in response;
}

export interface PortalResponse {
  portal_url: string;
}

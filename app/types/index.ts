// Re-export enums for convenience
export {
  ToastType,
  EmptyStateVariant,
  ButtonVariant,
  ButtonSize,
  ModalSize,
  HttpStatus,
  ErrorCategory,
  OAuthProvider,
  MemberRole,
  ConnectionStatus,
  InstallationStatus,
  GitHubAccountType,
  NotificationType,
  StorageKey,
  RouteName,
  RunStatus,
  FindingSeverity,
} from "./enums";

// Import enums for use in interfaces
import {
  MemberRole,
  ConnectionStatus,
  InstallationStatus,
  GitHubAccountType,
  NotificationType,
  RunStatus,
  FindingSeverity,
} from "./enums";

export type AiProvider = "anthropic" | "openai";

export interface ProviderKey {
  id: number;
  provider: AiProvider;
  provider_label: string;
  created_at: string;
  updated_at: string;
}

export interface StoreProviderKeyRequest {
  provider: AiProvider;
  key: string;
}

export const AI_PROVIDERS: { value: AiProvider; label: string }[] = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
];

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Workspace types
export interface Workspace {
  id: number;
  name: string;
  slug: string;
  settings: Record<string, unknown> | null;
  owner: User;
  team: Team;
  members_count: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
}

// Team member types
export interface TeamMember {
  id: number;
  user_id: number;
  team_id: number;
  workspace_id: number;
  role: MemberRole;
  role_label: string;
  user: User;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

// Invitation types
export interface Invitation {
  id: number;
  email: string;
  workspace_id: number;
  team_id: number;
  role: Exclude<MemberRole, "owner">;
  role_label: string;
  invited_by: User;
  workspace: Workspace;
  is_expired: boolean;
  is_accepted: boolean;
  is_pending: boolean;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

// Billing & plans types
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

export interface UpgradeRequest {
  plan_tier: PaidPlanTier;
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

export interface PortalResponse {
  portal_url: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

/**
 * Laravel API Resource pagination format
 * Used when returning paginated data via API Resources
 */
export interface ApiResourcePaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// Form data types
export interface CreateWorkspaceData {
  name: string;
}

export interface UpdateWorkspaceData {
  name: string;
}

export interface CreateInvitationData {
  email: string;
  role: Exclude<MemberRole, "owner">;
}

export interface UpdateMemberRoleData {
  role: Exclude<MemberRole, "owner">;
}

// Activity types
export interface Activity {
  id: number;
  type: string;
  type_label: string;
  type_icon: string;
  type_category: string;
  description: string;
  actor: User | null;
  subject_type: string | null;
  subject_id: number | null;
  metadata: Record<string, unknown> | null;
  is_system_action: boolean;
  created_at: string;
  updated_at: string;
}

// GitHub Integration types
export interface Provider {
  id: number;
  type: string;
  name: string;
  label: string;
  icon: string;
  is_active: boolean;
}

export interface Installation {
  id: number;
  installation_id: number;
  account_type: "User" | "Organization";
  account_login: string;
  account_avatar_url: string;
  status: InstallationStatus;
  status_label: string;
  is_active: boolean;
  is_organization: boolean;
  repositories_count?: number;
  suspended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: number;
  status: ConnectionStatus;
  status_label: string;
  is_active: boolean;
  provider: Provider;
  installation: Installation | null;
  created_at: string;
  updated_at: string;
}

export type SentinelConfigTone =
  | "strict"
  | "constructive"
  | "educational"
  | "minimal";

export type SentinelConfigAnnotationStyle = "review" | "comment" | "check_run";

export interface SentinelConfigTriggers {
  target_branches?: readonly string[];
  skip_source_branches?: readonly string[];
  skip_labels?: readonly string[];
  skip_authors?: readonly string[];
}

export interface SentinelConfigPaths {
  ignore?: readonly string[];
  include?: readonly string[];
  sensitive?: readonly string[];
}

export interface SentinelConfigReviewCategories {
  security?: boolean;
  correctness?: boolean;
  performance?: boolean;
  maintainability?: boolean;
  style?: boolean;
}

export interface SentinelConfigReview {
  min_severity?: FindingSeverity;
  max_findings?: number;
  categories?: SentinelConfigReviewCategories;
  tone?: SentinelConfigTone;
  language?: string;
  focus?: readonly string[];
}

export interface SentinelConfigGuideline {
  path: string;
  description?: string;
}

export interface SentinelConfigAnnotations {
  style?: SentinelConfigAnnotationStyle;
  post_threshold?: FindingSeverity;
  grouped?: boolean;
  include_suggestions?: boolean;
}

export interface SentinelConfigProvider {
  preferred?: string;
  model?: string;
  fallback?: boolean;
}

export interface SentinelConfig {
  version: string;
  triggers?: SentinelConfigTriggers;
  paths?: SentinelConfigPaths;
  review?: SentinelConfigReview;
  guidelines?: readonly SentinelConfigGuideline[];
  annotations?: SentinelConfigAnnotations;
  provider?: SentinelConfigProvider;
}

export interface RepositorySettings {
  id: number;
  auto_review_enabled: boolean;
  sentinel_config?: SentinelConfig | null;
  config_synced_at?: string | null;
  config_error?: string | null;
  has_sentinel_config?: boolean;
  has_config_error?: boolean;
  updated_at: string;
}

export interface Repository {
  id: number;
  github_id: number;
  name: string;
  full_name: string;
  owner: string;
  private: boolean;
  default_branch: string;
  language: string | null;
  description: string | null;
  auto_review_enabled: boolean;
  settings: RepositorySettings | null;
  installation?: Installation;
  created_at: string;
  updated_at: string;
}

// GitHub API response types
export interface ConnectResponse {
  data: Connection;
  installation_url?: string;
  message?: string;
}

export interface SyncRepositoriesResponse {
  message: string;
  summary: {
    added: number;
    updated: number;
    removed: number;
  };
}

export interface UpdateRepositoryData {
  auto_review_enabled?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationListResponse {
  data: Notification[];
  unread_count: number;
}

export interface UnreadCountResponse {
  count: number;
}

// Review System types
export interface Annotation {
  id: number;
  provider_id: number | null;
  external_id: string | null;
  type: string;
  created_at: string;
}

export interface FindingMetadata {
  current_code?: string;
  replacement_code?: string;
  explanation?: string;
  impact?: string;
  references?: readonly string[];
  [key: string]: unknown;
}

export interface Finding {
  id: number;
  run_id: number;
  severity: FindingSeverity | string;
  category: string;
  title: string;
  description: string;
  file_path: string | null;
  line_start: number | null;
  line_end: number | null;
  confidence: number | null;
  metadata: FindingMetadata | null;
  annotations: readonly Annotation[];
  created_at: string;
}

// Pull Request Metadata Types
export interface GitHubUser {
  login: string;
  avatar_url: string | null;
}

export interface Label {
  name: string;
  color: string;
}

export interface PullRequest {
  number: number;
  title: string | null;
  body: string | null;
  base_branch: string | null;
  head_branch: string | null;
  head_sha: string | null;
  is_draft: boolean;
  author: GitHubUser;
  assignees: readonly GitHubUser[];
  reviewers: readonly GitHubUser[];
  labels: readonly Label[];
}

export type RunVerdict = "approve" | "request_changes" | "comment";

export interface RunSummary {
  overview: string;
  verdict?: RunVerdict;
  risk_level?: string;
  strengths?: readonly string[];
  concerns?: readonly string[];
  recommendations?: readonly string[];
}

export interface Run {
  id: number;
  repository_id: number;
  external_reference: string;
  status: RunStatus;
  started_at: string | null;
  completed_at: string | null;
  metrics: {
    files_changed: number;
    lines_added: number;
    lines_deleted: number;
    tokens_used_estimated: number;
    model: string;
    provider: string;
    duration_ms: number;
  } | null;
  policy_snapshot: {
    policy_version: number;
    enabled_rules: readonly string[];
    severity_thresholds: Record<string, string>;
    comment_limits: Record<string, number>;
    ignored_paths: readonly string[];
  } | null;
  pull_request: PullRequest | null;
  summary: RunSummary | null;
  metadata: {
    pull_request_number?: number;
    pull_request_title?: string;
    sender_login?: string;
    sender_avatar_url?: string;
    head_branch?: string;
    base_branch?: string;
    repository_full_name?: string;
    skip_reason?: string;
    skip_message?: string;
    /** @deprecated Use run.summary instead */
    review_summary?: RunSummary;
    [key: string]: unknown;
  } | null;
  repository?: Repository;
  findings?: readonly Finding[];
  created_at: string;
}

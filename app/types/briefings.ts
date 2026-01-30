/**
 * Briefings domain types
 *
 * AI-powered narrative reports that transform engineering data into compelling stories.
 */

import type { ParameterSchema, SchemaProperty } from "./schema";

// ============================================================================
// Enums
// ============================================================================

export enum BriefingGenerationStatus {
  Pending = "pending",
  Processing = "processing",
  Completed = "completed",
  Failed = "failed",
}

export enum BriefingSchedulePreset {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
}

export enum BriefingOutputFormat {
  Html = "html",
  Pdf = "pdf",
  Markdown = "markdown",
  Slides = "slides",
}

export enum BriefingDeliveryChannel {
  Email = "email",
  Slack = "slack",
  Push = "push",
}

export enum AchievementType {
  Milestone = "milestone",
  Streak = "streak",
  PersonalBest = "personal_best",
}

// ============================================================================
// Core Types
// ============================================================================

/**
 * Briefing template - defines a type of report
 */
export interface Briefing {
  id: number;
  workspace_id: number | null;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  target_roles: readonly string[] | null;
  parameter_schema: ParameterSchema | null;
  requires_ai: boolean;
  eligible_plan_ids: readonly number[] | null;
  output_formats: readonly BriefingOutputFormat[];
  is_schedulable: boolean;
  is_system: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  can_generate?: boolean;
  restriction_reason?: string | null;
}

export interface BriefingWorkspaceEligibility {
  can_generate: boolean;
  restriction_reason: string | null;
}

/**
 * Briefing generation instance
 */
export interface BriefingGeneration {
  id: number;
  workspace_id: number;
  briefing_id: number;
  generated_by_id: number;
  parameters: Record<string, unknown>;
  status: BriefingGenerationStatus;
  progress: number;
  progress_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  narrative?: string | null;
  structured_data?: BriefingStructuredData | null;
  achievements?: readonly Achievement[];
  excerpts?: BriefingExcerpts | null;
  output_formats?: readonly BriefingOutputFormat[];
  ai_generation?: BriefingAiGeneration | null;
  error_message: string | null;
  expires_at: string | null;
  created_at: string;
  // Relationships
  briefing?: Briefing;
  generated_by?: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

/**
 * Structured data for visualizations
 */
export interface BriefingStructuredData {
  period?: BriefingPeriod;
  summary?: BriefingSummary;
  top_contributor?: BriefingTopContributor | null;
  data_quality?: BriefingDataQuality;
  evidence?: BriefingEvidence;
  runs?: readonly BriefingRunSummary[];
  repositories?: readonly BriefingRepositorySummary[];
  velocity?: BriefingVelocity;
  engineers?: readonly BriefingEngineerSummary[];
  code_health?: BriefingCodeHealth;
  slides?: BriefingSlideDeck;
  metrics?: Record<string, number | string>;
  charts?: readonly BriefingChart[];
  tables?: readonly BriefingTable[];
  highlights?: readonly string[];
  [key: string]: unknown;
}

export interface BriefingPeriod {
  start: string;
  end: string;
}

export interface BriefingSummary {
  total_runs?: number;
  completed?: number;
  in_progress?: number;
  failed?: number;
  prs_merged?: number;
  active_days?: number;
  review_coverage?: number;
  repository_count?: number;
  [key: string]: number | string | null | undefined;
}

export interface BriefingTopContributor {
  name: string;
  pr_count: number;
  completed?: number | null;
}

export interface BriefingDataQuality {
  is_sparse: boolean;
  total_runs: number;
  active_days: number;
  period_days: number;
  review_coverage: number;
  notes: readonly string[];
}

export interface BriefingEvidence {
  run_ids: readonly number[];
  finding_ids: readonly number[];
  repository_names: readonly string[];
  notes: readonly string[];
}

export interface BriefingRunSummary {
  id: number;
  pr_number: number | null;
  pr_title: string | null;
  status: string;
  created_at: string | null;
}

export interface BriefingRepositorySummary {
  id: number;
  name: string | null;
  full_name: string | null;
}

export interface BriefingVelocity {
  prs_per_day: number;
  total_days: number;
}

export interface BriefingEngineerSummary {
  name: string;
  pr_count: number;
  completed?: number | null;
}

export interface BriefingCodeHealth {
  total_findings: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  info_issues: number;
  severity_breakdown: Record<string, number>;
  category_breakdown: Record<string, number>;
  top_critical_findings: readonly BriefingCriticalFinding[];
}

export interface BriefingCriticalFinding {
  id: number;
  title: string;
  severity: string | null;
  category: string | null;
  file_path: string | null;
  line_start: number | null;
}

export interface BriefingSlideDeck {
  version: string;
  title: string;
  period: BriefingPeriod;
  generated_at: string;
  slides: readonly BriefingSlide[];
  meta: Record<string, unknown>;
}

export interface BriefingSlide {
  id: string;
  type: string;
  title: string;
  subtitle?: string | null;
  blocks: readonly BriefingSlideBlock[];
}

export type BriefingSlideBlock =
  | BriefingSlideTextBlock
  | BriefingSlideListBlock
  | BriefingSlideMetricsBlock;

export interface BriefingSlideTextBlock {
  type: "text";
  text: string;
}

export interface BriefingSlideListBlock {
  type: "list";
  title?: string;
  items: readonly string[];
}

export interface BriefingSlideMetricsBlock {
  type: "metrics";
  items: readonly BriefingSlideMetric[];
}

export interface BriefingSlideMetric {
  label: string;
  value: number | string;
  unit?: string;
}

export interface BriefingChart {
  type: "line" | "bar" | "pie" | "doughnut" | "radar";
  title: string;
  data: {
    labels: readonly string[];
    datasets: readonly {
      label: string;
      data: readonly number[];
      backgroundColor?: string | readonly string[];
      borderColor?: string | readonly string[];
    }[];
  };
}

export interface BriefingTable {
  title: string;
  headers: readonly string[];
  rows: readonly (readonly (string | number)[])[];
}

/**
 * Achievement detected in briefing
 */
export interface Achievement {
  id?: string;
  type: AchievementType;
  title: string;
  description: string;
  value?: number | string;
  icon?: string;
  celebrated_at?: string;
}

/**
 * Pre-formatted excerpts for sharing
 */
export interface BriefingExcerpts {
  short?: string;
  slack?: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
}

/**
 * AI generation telemetry
 */
export interface BriefingAiGeneration {
  provider: string | null;
  model: string | null;
  duration_ms: number | null;
}

/**
 * Briefing subscription for scheduled generation
 */
export interface BriefingSubscription {
  id: number;
  workspace_id: number;
  user_id: number;
  briefing_id: number;
  schedule_preset: BriefingSchedulePreset;
  schedule_day: number | null;
  schedule_hour: number;
  parameters: Record<string, unknown>;
  delivery_channels: readonly BriefingDeliveryChannel[];
  slack_webhook_url?: string | null;
  last_generated_at: string | null;
  next_scheduled_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relationships
  briefing?: Briefing;
}

/**
 * External share link
 */
export interface BriefingShare {
  id: number;
  briefing_generation_id: number;
  token: string;
  is_password_protected: boolean;
  access_count: number;
  max_accesses: number | null;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  // Computed
  share_url?: string;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface GenerateBriefingRequest {
  parameters?: Record<string, unknown>;
}

export interface CreateSubscriptionRequest {
  briefing_id: number;
  schedule_preset: BriefingSchedulePreset;
  schedule_day?: number | null;
  schedule_hour?: number;
  parameters?: Record<string, unknown>;
  delivery_channels: readonly BriefingDeliveryChannel[];
  slack_webhook_url?: string | null;
}

export interface UpdateSubscriptionRequest {
  schedule_preset?: BriefingSchedulePreset;
  schedule_day?: number | null;
  schedule_hour?: number;
  parameters?: Record<string, unknown>;
  delivery_channels?: readonly BriefingDeliveryChannel[];
  slack_webhook_url?: string | null;
  is_active?: boolean;
}

export interface CreateShareRequest {
  password?: string | null;
  max_accesses?: number | null;
  expires_in_days?: number;
}

// ============================================================================
// WebSocket Event Types
// ============================================================================

export interface BriefingStartedEvent {
  generation_id: number;
  briefing_id: number;
  status: BriefingGenerationStatus;
}

export interface BriefingProgressEvent {
  generation_id: number;
  briefing_id: number;
  progress: number;
  message: string;
}

export interface BriefingCompletedEvent {
  generation_id: number;
  briefing_id: number;
  briefing_slug: string;
  status: BriefingGenerationStatus;
  has_achievements: boolean;
}

export interface BriefingFailedEvent {
  generation_id: number;
  briefing_id: number;
  status: BriefingGenerationStatus;
  error: string;
}

// ============================================================================
// UI Helper Types
// ============================================================================

export interface BriefingCardData {
  briefing: Briefing;
  latestGeneration?: BriefingGeneration;
  subscription?: BriefingSubscription;
  isEligible: boolean;
  eligibilityReason?: string;
}

export type BriefingStatusColor =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error";

export function getBriefingStatusColor(
  status: BriefingGenerationStatus
): BriefingStatusColor {
  switch (status) {
    case BriefingGenerationStatus.Pending:
      return "default";
    case BriefingGenerationStatus.Processing:
      return "info";
    case BriefingGenerationStatus.Completed:
      return "success";
    case BriefingGenerationStatus.Failed:
      return "error";
    default:
      return "default";
  }
}

export function getBriefingStatusLabel(
  status: BriefingGenerationStatus
): string {
  switch (status) {
    case BriefingGenerationStatus.Pending:
      return "Queued";
    case BriefingGenerationStatus.Processing:
      return "Generating";
    case BriefingGenerationStatus.Completed:
      return "Ready";
    case BriefingGenerationStatus.Failed:
      return "Failed";
    default:
      return "Unknown";
  }
}

export function getSchedulePresetLabel(preset: BriefingSchedulePreset): string {
  switch (preset) {
    case BriefingSchedulePreset.Daily:
      return "Daily";
    case BriefingSchedulePreset.Weekly:
      return "Weekly";
    case BriefingSchedulePreset.Monthly:
      return "Monthly";
    default:
      return preset;
  }
}

export function getDeliveryChannelLabel(
  channel: BriefingDeliveryChannel
): string {
  switch (channel) {
    case BriefingDeliveryChannel.Email:
      return "Email";
    case BriefingDeliveryChannel.Slack:
      return "Slack";
    case BriefingDeliveryChannel.Push:
      return "Push Notification";
    default:
      return channel;
  }
}

// ============================================================================
// Icon & Style Helpers (Re-exported from utils for backwards compatibility)
// ============================================================================

export {
  getDeliveryChannelIcon,
  getAchievementIcon,
  getAchievementColor,
  getAchievementStyle,
  EXCERPT_META,
  type ExcerptMeta,
} from "~/utils/briefing-icons";

export interface AchievementStyle {
  icon: string;
  bg: string;
  border: string;
  glow: string;
}

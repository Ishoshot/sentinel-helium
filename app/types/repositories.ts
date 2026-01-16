/**
 * Repository and Sentinel Configuration types
 */
import type { FindingSeverity } from './enums'
import type { Installation } from './integrations'

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

export interface UpdateRepositoryData {
  auto_review_enabled?: boolean;
}

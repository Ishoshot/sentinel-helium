/**
 * Review System types (Runs, Findings, Annotations)
 */
import type { RunStatus, FindingSeverity } from './enums'
import type { Repository } from './repositories'

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

// Grouped Views Types
export interface PullRequestGroup {
  pull_request_number: number;
  pull_request_title: string | null;
  repository: Repository;
  runs_count: number;
  latest_run: Run;
  latest_status: string;
  runs: readonly Run[];
}

export interface RepositoryGroup {
  repository: Repository;
  pull_requests_count: number;
  runs_count: number;
  pull_requests: readonly PullRequestGroup[];
}

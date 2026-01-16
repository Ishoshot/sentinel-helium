/**
 * Analytics types
 */

export interface OverviewMetrics {
  total_runs: number;
  total_findings: number;
  average_duration_seconds: number;
  active_repositories: number;
}

export interface TimelineData {
  date: string;
  count: number;
  successful: number;
  failed: number;
}

export interface FindingsDistribution {
  severity: string;
  count: number;
}

export interface TopCategory {
  category: string;
  count: number;
}

export interface RepositoryActivity {
  repository_id: number;
  repository_name: string;
  runs_count: number;
  findings_count: number;
  last_run_at: string | null;
}

export interface DeveloperStats {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  runs_count: number;
  successful_runs: number;
  avg_duration: number;
}

export interface DurationTrend {
  date: string;
  avg_duration: number;
  min_duration: number;
  max_duration: number;
}

export interface TokenUsage {
  date: string;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
}

export interface SuccessRate {
  date: string;
  successful: number;
  failed: number;
  total: number;
  success_rate: number;
}

export interface QualityScore {
  date: string;
  quality_score: number;
  runs_count: number;
}

export interface ResolutionRate {
  date: string;
  total_findings: number;
  annotated_findings: number;
  annotation_rate: number;
  avg_time_to_annotation_seconds: number | null;
}

export interface Velocity {
  period: string;
  reviews_count: number;
  completed_count: number;
  avg_duration: number | null;
  active_repositories: number;
}

import type {
  ApiResponse,
  ApiListResponse,
  OverviewMetrics,
  TimelineData,
  FindingsDistribution,
  TopCategory,
  RepositoryActivity,
  DeveloperStats,
  DurationTrend,
  TokenUsage,
  SuccessRate,
  QualityScore,
  ResolutionRate,
  Velocity,
} from "~/types";
import { useApiClient } from "../core/api";

export interface AnalyticsQueryParams {
  days?: number;
  limit?: number;
  group_by?: "day" | "week";
}

/**
 * Analytics service - handles analytics API calls
 */
export function useAnalyticsService() {
  const { $api } = useApiClient();

  /**
   * Get overview metrics
   */
  async function getOverviewMetrics(
    workspaceId: number
  ): Promise<OverviewMetrics> {
    const response = await $api<ApiResponse<OverviewMetrics>>(
      `/workspaces/${workspaceId}/analytics/overview`
    );
    return response.data;
  }

  /**
   * Get run activity timeline
   */
  async function getTimeline(
    workspaceId: number,
    params?: AnalyticsQueryParams
  ): Promise<TimelineData[]> {
    const response = await $api<ApiListResponse<TimelineData>>(
      `/workspaces/${workspaceId}/analytics/timeline`,
      { params }
    );
    return response.data;
  }

  /**
   * Get findings distribution by severity
   */
  async function getFindingsDistribution(
    workspaceId: number
  ): Promise<FindingsDistribution[]> {
    const response = await $api<ApiListResponse<FindingsDistribution>>(
      `/workspaces/${workspaceId}/analytics/findings-distribution`
    );
    return response.data;
  }

  /**
   * Get top finding categories
   */
  async function getTopCategories(
    workspaceId: number,
    params?: AnalyticsQueryParams
  ): Promise<TopCategory[]> {
    const response = await $api<ApiListResponse<TopCategory>>(
      `/workspaces/${workspaceId}/analytics/top-categories`,
      { params }
    );
    return response.data;
  }

  /**
   * Get repository activity
   */
  async function getRepositoryActivity(
    workspaceId: number,
    params?: AnalyticsQueryParams
  ): Promise<RepositoryActivity[]> {
    const response = await $api<ApiListResponse<RepositoryActivity>>(
      `/workspaces/${workspaceId}/analytics/repository-activity`,
      { params }
    );
    return response.data;
  }

  /**
   * Get developer leaderboard
   */
  async function getDeveloperLeaderboard(
    workspaceId: number,
    params?: AnalyticsQueryParams
  ): Promise<DeveloperStats[]> {
    const response = await $api<ApiListResponse<DeveloperStats>>(
      `/workspaces/${workspaceId}/analytics/developer-leaderboard`,
      { params }
    );
    return response.data;
  }

  /**
   * Get review duration trends
   */
  async function getDurationTrends(
    workspaceId: number,
    params?: AnalyticsQueryParams
  ): Promise<DurationTrend[]> {
    const response = await $api<ApiListResponse<DurationTrend>>(
      `/workspaces/${workspaceId}/analytics/duration-trends`,
      { params }
    );
    return response.data;
  }

  /**
   * Get token usage over time
   */
  async function getTokenUsage(
    workspaceId: number,
    params?: AnalyticsQueryParams
  ): Promise<TokenUsage[]> {
    const response = await $api<ApiListResponse<TokenUsage>>(
      `/workspaces/${workspaceId}/analytics/token-usage`,
      { params }
    );
    return response.data;
  }

  /**
   * Get success vs failure rate
   */
  async function getSuccessRate(
    workspaceId: number,
    params?: AnalyticsQueryParams
  ): Promise<SuccessRate[]> {
    const response = await $api<ApiListResponse<SuccessRate>>(
      `/workspaces/${workspaceId}/analytics/success-rate`,
      { params }
    );
    return response.data;
  }

  /**
   * Get code quality score trend
   */
  async function getQualityScore(
    workspaceId: number,
    params?: AnalyticsQueryParams
  ): Promise<QualityScore[]> {
    const response = await $api<ApiListResponse<QualityScore>>(
      `/workspaces/${workspaceId}/analytics/quality-score`,
      { params }
    );
    return response.data;
  }

  /**
   * Get finding resolution rate
   */
  async function getResolutionRate(
    workspaceId: number,
    params?: AnalyticsQueryParams
  ): Promise<ResolutionRate[]> {
    const response = await $api<ApiListResponse<ResolutionRate>>(
      `/workspaces/${workspaceId}/analytics/resolution-rate`,
      { params }
    );
    return response.data;
  }

  /**
   * Get review velocity
   */
  async function getVelocity(
    workspaceId: number,
    params?: AnalyticsQueryParams
  ): Promise<Velocity[]> {
    const response = await $api<ApiListResponse<Velocity>>(
      `/workspaces/${workspaceId}/analytics/velocity`,
      { params }
    );
    return response.data;
  }

  return {
    getOverviewMetrics,
    getTimeline,
    getFindingsDistribution,
    getTopCategories,
    getRepositoryActivity,
    getDeveloperLeaderboard,
    getDurationTrends,
    getTokenUsage,
    getSuccessRate,
    getQualityScore,
    getResolutionRate,
    getVelocity,
  };
}

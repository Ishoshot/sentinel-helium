import type {
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
import {
  useAnalyticsService,
  type AnalyticsQueryParams,
} from "~/services/analytics/analyticsService";

/**
 * Analytics composable - manages analytics data and API calls
 */
export function useAnalytics(workspaceId: Ref<number | null>) {
  const analyticsService = useAnalyticsService();

  // State for each analytics endpoint
  const overviewMetrics = ref<OverviewMetrics | null>(null);
  const timeline = ref<TimelineData[]>([]);
  const findingsDistribution = ref<FindingsDistribution[]>([]);
  const topCategories = ref<TopCategory[]>([]);
  const repositoryActivity = ref<RepositoryActivity[]>([]);
  const developerLeaderboard = ref<DeveloperStats[]>([]);
  const durationTrends = ref<DurationTrend[]>([]);
  const tokenUsage = ref<TokenUsage[]>([]);
  const successRate = ref<SuccessRate[]>([]);
  const qualityScore = ref<QualityScore[]>([]);
  const resolutionRate = ref<ResolutionRate[]>([]);
  const velocity = ref<Velocity[]>([]);

  // Loading states
  const isLoadingOverview = ref(false);
  const isLoadingTimeline = ref(false);
  const isLoadingDistribution = ref(false);
  const isLoadingCategories = ref(false);
  const isLoadingRepositories = ref(false);
  const isLoadingLeaderboard = ref(false);
  const isLoadingDuration = ref(false);
  const isLoadingTokens = ref(false);
  const isLoadingSuccess = ref(false);
  const isLoadingQuality = ref(false);
  const isLoadingResolution = ref(false);
  const isLoadingVelocity = ref(false);

  // Error states
  const error = ref<string | null>(null);

  /**
   * Fetch overview metrics
   */
  async function fetchOverviewMetrics() {
    if (!workspaceId.value) return null;

    isLoadingOverview.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getOverviewMetrics(
        workspaceId.value
      );
      overviewMetrics.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch overview metrics";
      return null;
    } finally {
      isLoadingOverview.value = false;
    }
  }

  /**
   * Fetch run activity timeline
   */
  async function fetchTimeline(params?: AnalyticsQueryParams) {
    if (!workspaceId.value) return [];

    isLoadingTimeline.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getTimeline(
        workspaceId.value,
        params
      );
      timeline.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch timeline";
      return [];
    } finally {
      isLoadingTimeline.value = false;
    }
  }

  /**
   * Fetch findings distribution
   */
  async function fetchFindingsDistribution() {
    if (!workspaceId.value) return [];

    isLoadingDistribution.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getFindingsDistribution(
        workspaceId.value
      );
      findingsDistribution.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Failed to fetch findings distribution";
      return [];
    } finally {
      isLoadingDistribution.value = false;
    }
  }

  /**
   * Fetch top categories
   */
  async function fetchTopCategories(params?: AnalyticsQueryParams) {
    if (!workspaceId.value) return [];

    isLoadingCategories.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getTopCategories(
        workspaceId.value,
        params
      );
      topCategories.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch top categories";
      return [];
    } finally {
      isLoadingCategories.value = false;
    }
  }

  /**
   * Fetch repository activity
   */
  async function fetchRepositoryActivity(params?: AnalyticsQueryParams) {
    if (!workspaceId.value) return [];

    isLoadingRepositories.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getRepositoryActivity(
        workspaceId.value,
        params
      );
      repositoryActivity.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Failed to fetch repository activity";
      return [];
    } finally {
      isLoadingRepositories.value = false;
    }
  }

  /**
   * Fetch developer leaderboard
   */
  async function fetchDeveloperLeaderboard(params?: AnalyticsQueryParams) {
    if (!workspaceId.value) return [];

    isLoadingLeaderboard.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getDeveloperLeaderboard(
        workspaceId.value,
        params
      );
      developerLeaderboard.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Failed to fetch developer leaderboard";
      return [];
    } finally {
      isLoadingLeaderboard.value = false;
    }
  }

  /**
   * Fetch duration trends
   */
  async function fetchDurationTrends(params?: AnalyticsQueryParams) {
    if (!workspaceId.value) return [];

    isLoadingDuration.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getDurationTrends(
        workspaceId.value,
        params
      );
      durationTrends.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch duration trends";
      return [];
    } finally {
      isLoadingDuration.value = false;
    }
  }

  /**
   * Fetch token usage
   */
  async function fetchTokenUsage(params?: AnalyticsQueryParams) {
    if (!workspaceId.value) return [];

    isLoadingTokens.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getTokenUsage(
        workspaceId.value,
        params
      );
      tokenUsage.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch token usage";
      return [];
    } finally {
      isLoadingTokens.value = false;
    }
  }

  /**
   * Fetch success rate
   */
  async function fetchSuccessRate(params?: AnalyticsQueryParams) {
    if (!workspaceId.value) return [];

    isLoadingSuccess.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getSuccessRate(
        workspaceId.value,
        params
      );
      successRate.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch success rate";
      return [];
    } finally {
      isLoadingSuccess.value = false;
    }
  }

  /**
   * Fetch quality score
   */
  async function fetchQualityScore(params?: AnalyticsQueryParams) {
    if (!workspaceId.value) return [];

    isLoadingQuality.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getQualityScore(
        workspaceId.value,
        params
      );
      qualityScore.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch quality score";
      return [];
    } finally {
      isLoadingQuality.value = false;
    }
  }

  /**
   * Fetch resolution rate
   */
  async function fetchResolutionRate(params?: AnalyticsQueryParams) {
    if (!workspaceId.value) return [];

    isLoadingResolution.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getResolutionRate(
        workspaceId.value,
        params
      );
      resolutionRate.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch resolution rate";
      return [];
    } finally {
      isLoadingResolution.value = false;
    }
  }

  /**
   * Fetch review velocity
   */
  async function fetchVelocity(params?: AnalyticsQueryParams) {
    if (!workspaceId.value) return [];

    isLoadingVelocity.value = true;
    error.value = null;

    try {
      const data = await analyticsService.getVelocity(workspaceId.value, params);
      velocity.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch velocity";
      return [];
    } finally {
      isLoadingVelocity.value = false;
    }
  }

  /**
   * Fetch all analytics data
   */
  async function fetchAll(params?: AnalyticsQueryParams) {
    await Promise.all([
      fetchOverviewMetrics(),
      fetchTimeline(params),
      fetchFindingsDistribution(),
      fetchTopCategories(params),
      fetchRepositoryActivity(params),
      fetchDeveloperLeaderboard(params),
      fetchDurationTrends(params),
      fetchTokenUsage(params),
      fetchSuccessRate(params),
      fetchQualityScore(params),
      fetchResolutionRate(params),
      fetchVelocity(params),
    ]);
  }

  return {
    // State
    overviewMetrics: computed(() => overviewMetrics.value),
    timeline: computed(() => timeline.value),
    findingsDistribution: computed(() => findingsDistribution.value),
    topCategories: computed(() => topCategories.value),
    repositoryActivity: computed(() => repositoryActivity.value),
    developerLeaderboard: computed(() => developerLeaderboard.value),
    durationTrends: computed(() => durationTrends.value),
    tokenUsage: computed(() => tokenUsage.value),
    successRate: computed(() => successRate.value),
    qualityScore: computed(() => qualityScore.value),
    resolutionRate: computed(() => resolutionRate.value),
    velocity: computed(() => velocity.value),

    // Loading states
    isLoadingOverview: computed(() => isLoadingOverview.value),
    isLoadingTimeline: computed(() => isLoadingTimeline.value),
    isLoadingDistribution: computed(() => isLoadingDistribution.value),
    isLoadingCategories: computed(() => isLoadingCategories.value),
    isLoadingRepositories: computed(() => isLoadingRepositories.value),
    isLoadingLeaderboard: computed(() => isLoadingLeaderboard.value),
    isLoadingDuration: computed(() => isLoadingDuration.value),
    isLoadingTokens: computed(() => isLoadingTokens.value),
    isLoadingSuccess: computed(() => isLoadingSuccess.value),
    isLoadingQuality: computed(() => isLoadingQuality.value),
    isLoadingResolution: computed(() => isLoadingResolution.value),
    isLoadingVelocity: computed(() => isLoadingVelocity.value),

    // Error state
    error: computed(() => error.value),

    // Methods
    fetchOverviewMetrics,
    fetchTimeline,
    fetchFindingsDistribution,
    fetchTopCategories,
    fetchRepositoryActivity,
    fetchDeveloperLeaderboard,
    fetchDurationTrends,
    fetchTokenUsage,
    fetchSuccessRate,
    fetchQualityScore,
    fetchResolutionRate,
    fetchVelocity,
    fetchAll,
  };
}

// Re-export types for convenience
export type { AnalyticsQueryParams } from "~/services/analytics/analyticsService";

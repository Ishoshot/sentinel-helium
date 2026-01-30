import type {
  Run,
  PaginatedResponse,
  PullRequestGroup,
  RepositoryGroup,
} from "~/types";
import {
  useRunsService,
  type WorkspaceRunsParams,
} from "~/services/reviews/runsService";

/**
 * Runs composable - manages review runs state
 */
export function useRuns(workspaceId: Ref<number | null>) {
  const runsService = useRunsService();

  // State
  const runs = ref<Run[]>([]);
  const currentRun = ref<Run | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const prGroups = ref<PullRequestGroup[]>([]);
  const repositoryGroups = ref<RepositoryGroup[]>([]);

  // Pagination state
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
    from: 0,
    to: 0,
  });

  /**
   * Fetch runs for a repository
   */
  async function fetchRuns(repositoryId: number, page = 1) {
    if (!workspaceId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await runsService.listRuns(
        workspaceId.value,
        repositoryId,
        page,
        pagination.value.perPage,
      );

      runs.value = response.data;
      prGroups.value = [];
      repositoryGroups.value = [];

      // Update pagination
      pagination.value = {
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
        perPage: response.per_page,
        from: response.from,
        to: response.to,
      };
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to fetch runs";
      runs.value = [];
      prGroups.value = [];
      repositoryGroups.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch all runs across the workspace
   * Handles API Resource pagination format (meta wrapper)
   */
  async function fetchWorkspaceRuns(params: WorkspaceRunsParams = {}) {
    if (!workspaceId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await runsService.listWorkspaceRuns(workspaceId.value, {
        ...params,
        perPage: params.perPage ?? pagination.value.perPage,
      });

      const groupBy = params.groupBy ?? null;

      if (!groupBy) {
        runs.value = response.data as Run[];
        prGroups.value = [];
        repositoryGroups.value = [];
      } else if (groupBy === "pr") {
        runs.value = [];
        prGroups.value = response.data as unknown as PullRequestGroup[];
        repositoryGroups.value = [];
      } else {
        runs.value = [];
        prGroups.value = [];
        repositoryGroups.value = response.data as unknown as RepositoryGroup[];
      }

      // Update pagination from meta object
      pagination.value = {
        currentPage: response.meta.current_page,
        lastPage: response.meta.last_page,
        total: response.meta.total,
        perPage: response.meta.per_page,
        from: response.meta.from,
        to: response.meta.to,
      };
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to fetch runs";
      runs.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single run detail
   */
  async function fetchRun(runId: number) {
    if (!workspaceId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      currentRun.value = await runsService.getRun(workspaceId.value, runId);
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch run details";
      currentRun.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    runs: readonly(runs),
    currentRun: readonly(currentRun),
    prGroups: readonly(prGroups),
    repositoryGroups: readonly(repositoryGroups),
    pagination: readonly(pagination),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Methods
    fetchRuns,
    fetchWorkspaceRuns,
    fetchRun,
  };
}

// Re-export types for convenience
export type { WorkspaceRunsParams } from "~/services/reviews/runsService";

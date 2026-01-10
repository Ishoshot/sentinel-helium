import type { Run, PaginatedResponse } from "~/types";
import { useRunsService } from "~/services/runsService";

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
        pagination.value.perPage
      );

      runs.value = response.data;

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
    pagination: readonly(pagination),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Methods
    fetchRuns,
    fetchRun,
  };
}

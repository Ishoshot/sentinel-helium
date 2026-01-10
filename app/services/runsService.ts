import type { ApiResponse, PaginatedResponse, Run } from "~/types";
import { useApiClient } from "./api";

/**
 * Runs service - handles review system API calls
 */
export function useRunsService() {
  const { $api } = useApiClient();

  /**
   * List runs for a repository
   */
  async function listRuns(
    workspaceId: number,
    repositoryId: number,
    page = 1,
    perPage = 20
  ): Promise<PaginatedResponse<Run>> {
    const response = await $api<PaginatedResponse<Run>>(
      `/workspaces/${workspaceId}/repositories/${repositoryId}/runs`,
      {
        params: {
          page,
          per_page: perPage,
        },
      }
    );
    // Paginated responses are usually standard, but we return as is
    return response;
  }

  /**
   * Get a single run detail
   */
  async function getRun(workspaceId: number, runId: number): Promise<Run> {
    const response = await $api<ApiResponse<Run> | Run>(
      `/workspaces/${workspaceId}/runs/${runId}`
    );
    return "data" in response ? response.data : response;
  }

  return {
    listRuns,
    getRun,
  };
}

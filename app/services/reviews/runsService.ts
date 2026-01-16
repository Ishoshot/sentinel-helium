import type {
  ApiResponse,
  PaginatedResponse,
  ApiResourcePaginatedResponse,
  Run,
} from "~/types";
import { useApiClient } from "../core/api";

/**
 * Query parameters for workspace runs listing
 */
export interface WorkspaceRunsParams {
  page?: number;
  perPage?: number;
  status?: string | null;
  repositoryId?: number | null;
  riskLevel?: string | null;
  author?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  sortBy?: "created_at" | "completed_at" | "findings_count";
  sortOrder?: "asc" | "desc";
  search?: string | null;
  groupBy?: "pr" | "repository" | null;
}

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
   * List all runs across the workspace
   * Returns API Resource pagination format (with meta wrapper)
   */
  async function listWorkspaceRuns(
    workspaceId: number,
    params: WorkspaceRunsParams = {}
  ): Promise<ApiResourcePaginatedResponse<Run>> {
    const queryParams: Record<string, string | number> = {
      page: params.page ?? 1,
      per_page: params.perPage ?? 20,
    };

    if (params.status) queryParams.status = params.status;
    if (params.repositoryId) queryParams.repository_id = params.repositoryId;
    if (params.riskLevel) queryParams.risk_level = params.riskLevel;
    if (params.author) queryParams.author = params.author;
    if (params.fromDate) queryParams.from_date = params.fromDate;
    if (params.toDate) queryParams.to_date = params.toDate;
    if (params.sortBy) queryParams.sort_by = params.sortBy;
    if (params.sortOrder) queryParams.sort_order = params.sortOrder;
    if (params.search) queryParams.search = params.search;
    if (params.groupBy) queryParams.group_by = params.groupBy;

    const response = await $api<ApiResourcePaginatedResponse<Run>>(
      `/workspaces/${workspaceId}/runs`,
      { params: queryParams }
    );
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
    listWorkspaceRuns,
    getRun,
  };
}

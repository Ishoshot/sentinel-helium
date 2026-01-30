import type {
  ApiResponse,
  ApiResourcePaginatedResponse,
  Connection,
  Repository,
  ConnectResponse,
  SyncRepositoriesResponse,
  UpdateRepositoryData,
  CreateConfigPrResponse,
} from "~/types";
import { useApiClient } from "../core/api";

/**
 * GitHub service - handles GitHub integration API calls
 */
export function useGitHubService() {
  const { $api } = useApiClient();

  /**
   * Get current GitHub connection status
   */
  async function getConnection(
    workspaceId: number,
  ): Promise<Connection | null> {
    const response = await $api<ApiResponse<Connection | null>>(
      `/workspaces/${workspaceId}/github/connection`,
    );
    return response.data;
  }

  /**
   * Initiate GitHub connection
   * Returns installation_url if redirect is needed
   */
  async function connect(workspaceId: number): Promise<ConnectResponse> {
    const response = await $api<ConnectResponse>(
      `/workspaces/${workspaceId}/github/connect`,
      { method: "POST" },
    );
    return response;
  }

  /**
   * Disconnect GitHub integration
   */
  async function disconnect(workspaceId: number): Promise<void> {
    await $api(`/workspaces/${workspaceId}/github/disconnect`, {
      method: "DELETE",
    });
  }

  /**
   * Query parameters for repository listing
   */
  interface ListRepositoriesParams {
    page?: number;
    perPage?: number;
  }

  /**
   * List repositories for the workspace with pagination
   */
  async function listRepositories(
    workspaceId: number,
    params: ListRepositoriesParams = {},
  ): Promise<ApiResourcePaginatedResponse<Repository>> {
    const queryParams: Record<string, number> = {};

    if (params.page) queryParams.page = params.page;
    if (params.perPage) queryParams.per_page = params.perPage;

    const response = await $api<ApiResourcePaginatedResponse<Repository>>(
      `/workspaces/${workspaceId}/repositories`,
      { params: queryParams },
    );
    return response;
  }

  /**
   * Get a single repository by ID
   */
  async function getRepository(
    workspaceId: number,
    repositoryId: number,
  ): Promise<Repository> {
    const response = await $api<ApiResponse<Repository>>(
      `/workspaces/${workspaceId}/repositories/${repositoryId}`,
    );
    return response.data;
  }

  /**
   * Sync repositories from GitHub
   */
  async function syncRepositories(
    workspaceId: number,
  ): Promise<SyncRepositoriesResponse> {
    const response = await $api<SyncRepositoriesResponse>(
      `/workspaces/${workspaceId}/repositories/sync`,
      { method: "POST" },
    );
    return response;
  }

  /**
   * Update repository settings
   */
  async function updateRepository(
    workspaceId: number,
    repositoryId: number,
    data: UpdateRepositoryData,
  ): Promise<Repository> {
    const response = await $api<ApiResponse<Repository>>(
      `/workspaces/${workspaceId}/repositories/${repositoryId}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response.data;
  }

  /**
   * Create a config PR for a repository
   */
  async function createConfigPr(
    workspaceId: number,
    repositoryId: number,
  ): Promise<CreateConfigPrResponse> {
    const response = await $api<CreateConfigPrResponse>(
      `/workspaces/${workspaceId}/repositories/${repositoryId}/create-config-pr`,
      { method: "POST" },
    );
    return response;
  }

  return {
    getConnection,
    connect,
    disconnect,
    listRepositories,
    getRepository,
    syncRepositories,
    updateRepository,
    createConfigPr,
  };
}

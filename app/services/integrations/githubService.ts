import type {
  ApiResponse,
  ApiListResponse,
  Connection,
  Repository,
  ConnectResponse,
  SyncRepositoriesResponse,
  UpdateRepositoryData,
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
    workspaceId: number
  ): Promise<Connection | null> {
    const response = await $api<ApiResponse<Connection | null>>(
      `/workspaces/${workspaceId}/github/connection`
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
      { method: "POST" }
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
   * List all repositories for the workspace
   */
  async function listRepositories(workspaceId: number): Promise<Repository[]> {
    const response = await $api<ApiListResponse<Repository>>(
      `/workspaces/${workspaceId}/repositories`
    );
    return response.data;
  }

  /**
   * Get a single repository by ID
   */
  async function getRepository(
    workspaceId: number,
    repositoryId: number
  ): Promise<Repository> {
    const response = await $api<ApiResponse<Repository>>(
      `/workspaces/${workspaceId}/repositories/${repositoryId}`
    );
    return response.data;
  }

  /**
   * Sync repositories from GitHub
   */
  async function syncRepositories(
    workspaceId: number
  ): Promise<SyncRepositoriesResponse> {
    const response = await $api<SyncRepositoriesResponse>(
      `/workspaces/${workspaceId}/repositories/sync`,
      { method: "POST" }
    );
    return response;
  }

  /**
   * Update repository settings
   */
  async function updateRepository(
    workspaceId: number,
    repositoryId: number,
    data: UpdateRepositoryData
  ): Promise<Repository> {
    const response = await $api<ApiResponse<Repository>>(
      `/workspaces/${workspaceId}/repositories/${repositoryId}`,
      {
        method: "PATCH",
        body: data,
      }
    );
    return response.data;
  }

  return {
    getConnection,
    connect,
    disconnect,
    listRepositories,
    getRepository,
    syncRepositories,
    updateRepository,
  };
}

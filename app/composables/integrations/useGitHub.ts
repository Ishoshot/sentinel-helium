import type { Connection, Repository, UpdateRepositoryData } from "~/types";
import { ConnectionStatus, InstallationStatus } from "~/types";
import { useGitHubService } from "~/services/integrations/githubService";
import { ApiError } from "~/services/core/api";

/**
 * GitHub composable - manages GitHub connection state
 */
export function useGitHub(workspaceId: Ref<number | null>) {
  const githubService = useGitHubService();

  const connection = ref<Connection | null>(null);
  const repositories = ref<Repository[]>([]);
  const isLoading = ref(false);
  const isConnecting = ref(false);
  const isDisconnecting = ref(false);
  const isSyncing = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const isConnected = computed(() => connection.value?.is_active ?? false);
  const isPending = computed(
    () => connection.value?.status === ConnectionStatus.Pending
  );
  const isSuspended = computed(
    () =>
      connection.value?.installation?.status === InstallationStatus.Suspended
  );
  const installation = computed(() => connection.value?.installation ?? null);
  const repositoriesCount = computed(
    () => installation.value?.repositories_count ?? 0
  );

  /**
   * Fetch current connection status
   */
  async function fetchConnection() {
    if (!workspaceId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      connection.value = await githubService.getConnection(workspaceId.value);
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch connection";
      connection.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Connect to GitHub
   * Handles redirect to GitHub if needed
   */
  async function connect() {
    if (!workspaceId.value) {
      error.value = "No workspace selected";
      return;
    }

    isConnecting.value = true;
    error.value = null;

    try {
      const response = await githubService.connect(workspaceId.value);

      if (response.installation_url) {
        // Redirect to GitHub to install the app
        window.location.href = response.installation_url;
        return;
      }

      // Already connected
      connection.value = response.data;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to connect GitHub";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to connect GitHub";
      }
    } finally {
      isConnecting.value = false;
    }
  }

  /**
   * Disconnect from GitHub
   */
  async function disconnect() {
    if (!workspaceId.value) return;

    isDisconnecting.value = true;
    error.value = null;

    try {
      await githubService.disconnect(workspaceId.value);
      connection.value = null;
      repositories.value = [];
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to disconnect GitHub";
      } else if (e instanceof ApiError && e.status === 404) {
        error.value = "No GitHub connection found";
        connection.value = null;
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to disconnect GitHub";
      }
    } finally {
      isDisconnecting.value = false;
    }
  }

  /**
   * List repositories
   */
  async function fetchRepositories() {
    if (!workspaceId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      repositories.value = await githubService.listRepositories(
        workspaceId.value
      );
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch repositories";
      repositories.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Sync repositories from GitHub
   */
  async function syncRepositories() {
    if (!workspaceId.value) return;

    isSyncing.value = true;
    error.value = null;

    try {
      await githubService.syncRepositories(workspaceId.value);
      await fetchRepositories();
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to sync repositories";
    } finally {
      isSyncing.value = false;
    }
  }

  /**
   * Update repository settings
   */
  async function updateRepository(
    repositoryId: number,
    data: UpdateRepositoryData
  ) {
    if (!workspaceId.value) return;

    try {
      const updatedRepo = await githubService.updateRepository(
        workspaceId.value,
        repositoryId,
        data
      );

      // Update local state
      const index = repositories.value.findIndex((r) => r.id === repositoryId);
      if (index !== -1) {
        repositories.value[index] = updatedRepo;
      }

      return updatedRepo;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to update repository";
      throw e;
    }
  }

  /**
   * Refresh connection status
   */
  async function refresh() {
    await fetchConnection();
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null;
  }

  return {
    // State
    connection: readonly(connection),
    repositories: readonly(repositories),
    isLoading: readonly(isLoading),
    isConnecting: readonly(isConnecting),
    isDisconnecting: readonly(isDisconnecting),
    isSyncing: readonly(isSyncing),
    error: readonly(error),

    // Computed
    isConnected,
    isPending,
    isSuspended,
    installation,
    repositoriesCount,

    // Methods
    fetchConnection,
    connect,
    disconnect,
    fetchRepositories,
    syncRepositories,
    updateRepository,
    refresh,
    clearError,
  };
}

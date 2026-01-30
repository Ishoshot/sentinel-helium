import type { Connection, Repository, UpdateRepositoryData, CreateConfigPrResponse } from "~/types";
import { ConnectionStatus, InstallationStatus } from "~/types";
import { useGitHubService } from "~/services/integrations/githubService";
import { useWebSocket } from "~/composables/useWebSocket";
import { useAppToast } from "~/composables/shared/useAppToast";
import { ApiError } from "~/services/core/api";

/**
 * GitHub composable - manages GitHub connection state
 */
export function useGitHub(workspaceId: Ref<number | null>) {
  const githubService = useGitHubService();
  const { subscribeToRepositories, unsubscribeFromRepositories } = useWebSocket(workspaceId);
  const toast = useAppToast();

  const connection = ref<Connection | null>(null);
  const repositories = ref<Repository[]>([]);
  const isLoading = ref(false);
  const isConnecting = ref(false);
  const isDisconnecting = ref(false);
  const isSyncing = ref(false);
  const isCreatingConfigPr = ref(false);
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

  // Computed properties
  const isConnected = computed(() => connection.value?.is_active ?? false);
  const isPending = computed(
    () => connection.value?.status === ConnectionStatus.Pending,
  );
  const isSuspended = computed(
    () =>
      connection.value?.installation?.status === InstallationStatus.Suspended,
  );
  const installation = computed(() => connection.value?.installation ?? null);
  const repositoriesCount = computed(
    () => installation.value?.repositories_count ?? 0,
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
        // Subscribe to repositories channel before opening GitHub
        // This allows us to receive config PR creation events
        subscribeToRepositories({
          onConfigPrCreated: (event) => {
            // Open the PR in a new tab when it's created
            window.open(event.pr_url, '_blank', 'noopener,noreferrer');
            toast.success(`Config PR created for ${event.repository_name}`);
          },
        });

        // Open GitHub in a new tab to install/configure the app
        window.open(response.installation_url, "_blank", "noopener,noreferrer");
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
   * List repositories with pagination
   */
  async function fetchRepositories(page = 1) {
    if (!workspaceId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await githubService.listRepositories(workspaceId.value, {
        page,
        perPage: pagination.value.perPage,
      });

      repositories.value = response.data;

      // Update pagination from meta
      pagination.value = {
        currentPage: response.meta.current_page,
        lastPage: response.meta.last_page,
        total: response.meta.total,
        perPage: response.meta.per_page,
        from: response.meta.from,
        to: response.meta.to,
      };
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
    data: UpdateRepositoryData,
  ) {
    if (!workspaceId.value) return;

    try {
      const updatedRepo = await githubService.updateRepository(
        workspaceId.value,
        repositoryId,
        data,
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
   * Create a config PR for a repository
   */
  async function createConfigPr(repositoryId: number): Promise<CreateConfigPrResponse | null> {
    if (!workspaceId.value) {
      error.value = "No workspace selected";
      return null;
    }

    isCreatingConfigPr.value = true;
    error.value = null;

    try {
      const response = await githubService.createConfigPr(workspaceId.value, repositoryId);
      return response;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to create config PR";
      } else if (e instanceof ApiError && e.status === 404) {
        error.value = "Repository not found";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to create config PR";
      }
      throw e;
    } finally {
      isCreatingConfigPr.value = false;
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
    pagination: readonly(pagination),
    isLoading: readonly(isLoading),
    isConnecting: readonly(isConnecting),
    isDisconnecting: readonly(isDisconnecting),
    isSyncing: readonly(isSyncing),
    isCreatingConfigPr: readonly(isCreatingConfigPr),
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
    createConfigPr,
    refresh,
    clearError,
  };
}

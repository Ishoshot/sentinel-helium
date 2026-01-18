import type {
  CreateWorkspaceData,
  UpdateWorkspaceData,
  Workspace,
} from "~/types";
import { useWorkspaceService } from "~/services/workspace/workspaceService";
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";
import { ApiError } from "~/services/core/api";

/**
 * Workspaces composable - orchestrates workspace management
 */
export function useWorkspaces() {
  const workspaceStore = useWorkspaceStore();
  const workspaceService = useWorkspaceService();

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Get all workspaces from store
   */
  const workspaces = computed(() => workspaceStore.workspaces);

  /**
   * Get current workspace from store
   */
  const currentWorkspace = computed(() => workspaceStore.currentWorkspace);

  /**
   * Fetch all workspaces for the current user
   */
  async function fetchWorkspaces() {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await workspaceService.list();
      workspaceStore.setWorkspaces(data);
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch workspaces";
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single workspace by ID
   */
  async function fetchWorkspace(workspaceId: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await workspaceService.get(workspaceId);
      workspaceStore.setCurrentWorkspace(data);
      return data;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have access to this workspace";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to fetch workspace";
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new workspace
   */
  async function createWorkspace(data: CreateWorkspaceData) {
    isLoading.value = true;
    error.value = null;

    try {
      const workspace = await workspaceService.create(data);
      workspaceStore.addWorkspace(workspace);
      return workspace;
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        error.value = Object.values(e.errors).flat().join(", ");
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to create workspace";
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update a workspace
   */
  async function updateWorkspace(
    workspaceId: number,
    data: UpdateWorkspaceData
  ) {
    isLoading.value = true;
    error.value = null;

    try {
      const workspace = await workspaceService.update(workspaceId, data);
      workspaceStore.updateWorkspace(workspace);
      return workspace;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to update this workspace";
      } else if (e instanceof ApiError && e.errors) {
        error.value = Object.values(e.errors).flat().join(", ");
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to update workspace";
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a workspace
   */
  async function deleteWorkspace(workspaceId: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await workspaceService.remove(workspaceId);
      workspaceStore.removeWorkspace(workspaceId);
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "Only the owner can delete this workspace";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to delete workspace";
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Switch to a different workspace
   */
  async function switchWorkspace(workspaceId: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const workspace = await workspaceService.switchTo(workspaceId);
      workspaceStore.setCurrentWorkspace(workspace);
      return workspace;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to switch workspace";
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Find workspace by slug
   */
  function findBySlug(slug: string) {
    return workspaces.value.find((w: Workspace) => w.slug === slug) ?? null;
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    workspaces,
    currentWorkspace,

    // Methods
    fetchWorkspaces,
    fetchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace,
    findBySlug,
  };
}

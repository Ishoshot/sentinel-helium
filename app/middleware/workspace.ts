import type { Workspace } from "~/types";
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";
import { useWorkspaces } from "~/composables/workspace/useWorkspaces";

/**
 * Workspace middleware - validates workspace access and sets current workspace
 * Runs after auth middleware on workspace routes
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Only check on client side
  if (import.meta.server) return;

  const workspaceSlug = to.params.workspace as string;
  if (!workspaceSlug) return;

  const workspaceStore = useWorkspaceStore();
  const { workspaces, fetchWorkspaces, findBySlug } = useWorkspaces();

  // Ensure workspaces are loaded
  if (workspaces.value.length === 0) {
    await fetchWorkspaces();
  }

  // Find workspace by slug
  let workspace = findBySlug(workspaceSlug);

  // If not found in list, try to fetch it directly (might be a new workspace)
  if (!workspace) {
    // Try to find workspace ID from URL or fetch by slug
    const foundWorkspace = workspaces.value.find(
      (w: Workspace) => w.slug === workspaceSlug
    );
    if (foundWorkspace) {
      workspace = foundWorkspace;
    }
  }

  if (!workspace) {
    // Workspace not found or no access
    return navigateTo("/");
  }

  // Set current workspace if different
  if (workspaceStore.currentWorkspace?.slug !== workspaceSlug) {
    workspaceStore.setCurrentWorkspace(workspace);
  }
});

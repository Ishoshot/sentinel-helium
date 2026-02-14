import { hasToken } from '~/services/core/api'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'

/**
 * Guest middleware - protects routes that should only be accessible to unauthenticated users
 * Redirects to dashboard if user is already authenticated
 */
export default defineNuxtRouteMiddleware(async () => {
  // Only check on client side
  if (import.meta.server) return

  if (hasToken()) {
    const workspaceStore = useWorkspaceStore()

    // If there's a current workspace, go there
    if (workspaceStore.hasCurrentWorkspace) {
      return navigateTo(`/${workspaceStore.currentWorkspaceSlug}`)
    }

    // If workspaces are loaded and available, go to the first one
    if (workspaceStore.workspaces.length > 0) {
      const sortedWorkspaces = [...workspaceStore.workspaces].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      const firstWorkspace = sortedWorkspaces[0]
      if (firstWorkspace) {
        return navigateTo(`/${firstWorkspace.slug}`)
      }
    }

    // Otherwise, still redirect to home (user might need to create a workspace)
    return navigateTo('/')
  }
})

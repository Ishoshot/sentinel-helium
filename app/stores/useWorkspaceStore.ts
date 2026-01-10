import type { Workspace } from '~/types'

/**
 * Workspace store - manages workspace context
 * Minimal store: only holds current workspace and list
 */
export const useWorkspaceStore = defineStore('workspace', () => {
  // State
  const currentWorkspace = ref<Workspace | null>(null)
  const workspaces = ref<Workspace[]>([])

  // Getters
  const hasCurrentWorkspace = computed(() => currentWorkspace.value !== null)
  const currentWorkspaceId = computed(() => currentWorkspace.value?.id ?? null)
  const currentWorkspaceSlug = computed(() => currentWorkspace.value?.slug ?? null)
  const currentWorkspaceName = computed(() => currentWorkspace.value?.name ?? '')

  // Actions
  function setCurrentWorkspace(workspace: Workspace) {
    currentWorkspace.value = workspace
  }

  function setWorkspaces(newWorkspaces: Workspace[]) {
    workspaces.value = newWorkspaces
  }

  function addWorkspace(workspace: Workspace) {
    workspaces.value.push(workspace)
  }

  function updateWorkspace(workspace: Workspace) {
    const index = workspaces.value.findIndex((w: Workspace) => w.id === workspace.id)
    if (index !== -1) {
      workspaces.value[index] = workspace
    }
    if (currentWorkspace.value?.id === workspace.id) {
      currentWorkspace.value = workspace
    }
  }

  function removeWorkspace(workspaceId: number) {
    workspaces.value = workspaces.value.filter((w: Workspace) => w.id !== workspaceId)
    if (currentWorkspace.value?.id === workspaceId) {
      currentWorkspace.value = null
    }
  }

  function clearWorkspaces() {
    currentWorkspace.value = null
    workspaces.value = []
  }

  return {
    // State
    currentWorkspace,
    workspaces,
    // Getters
    hasCurrentWorkspace,
    currentWorkspaceId,
    currentWorkspaceSlug,
    currentWorkspaceName,
    // Actions
    setCurrentWorkspace,
    setWorkspaces,
    addWorkspace,
    updateWorkspace,
    removeWorkspace,
    clearWorkspaces,
  }
})

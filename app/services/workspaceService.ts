import type {
  Workspace,
  ApiResponse,
  ApiListResponse,
  CreateWorkspaceData,
  UpdateWorkspaceData,
} from '~/types'
import { useApiClient } from './api'

/**
 * Workspace service - handles workspace API calls
 */
export function useWorkspaceService() {
  const { $api } = useApiClient()

  /**
   * List all workspaces for the current user
   */
  async function list(): Promise<Workspace[]> {
    const response = await $api<ApiListResponse<Workspace>>('/workspaces')
    return response.data
  }

  /**
   * Get a single workspace by ID
   */
  async function get(workspaceId: number): Promise<Workspace> {
    const response = await $api<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`)
    return response.data
  }

  /**
   * Create a new workspace
   */
  async function create(data: CreateWorkspaceData): Promise<Workspace> {
    const response = await $api<ApiResponse<Workspace>>('/workspaces', {
      method: 'POST',
      body: data,
    })
    return response.data
  }

  /**
   * Update a workspace
   */
  async function update(workspaceId: number, data: UpdateWorkspaceData): Promise<Workspace> {
    const response = await $api<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`, {
      method: 'PATCH',
      body: data,
    })
    return response.data
  }

  /**
   * Delete a workspace
   */
  async function remove(workspaceId: number): Promise<void> {
    await $api(`/workspaces/${workspaceId}`, { method: 'DELETE' })
  }

  /**
   * Switch to a workspace
   */
  async function switchTo(workspaceId: number): Promise<Workspace> {
    const response = await $api<ApiResponse<Workspace>>(`/workspaces/${workspaceId}/switch`, {
      method: 'POST',
    })
    return response.data
  }

  return {
    list,
    get,
    create,
    update,
    remove,
    switchTo,
  }
}

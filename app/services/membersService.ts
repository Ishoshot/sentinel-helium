import type {
  TeamMember,
  ApiResponse,
  ApiListResponse,
  UpdateMemberRoleData,
} from '~/types'
import { useApiClient } from './api'

/**
 * Members service - handles team member API calls
 */
export function useMembersService() {
  const { $api } = useApiClient()

  /**
   * List all members in a workspace
   */
  async function list(workspaceId: number): Promise<TeamMember[]> {
    const response = await $api<ApiListResponse<TeamMember>>(
      `/workspaces/${workspaceId}/members`
    )
    return response.data
  }

  /**
   * Update a member's role
   */
  async function updateRole(
    workspaceId: number,
    memberId: number,
    data: UpdateMemberRoleData
  ): Promise<TeamMember> {
    const response = await $api<ApiResponse<TeamMember>>(
      `/workspaces/${workspaceId}/members/${memberId}`,
      {
        method: 'PATCH',
        body: data,
      }
    )
    return response.data
  }

  /**
   * Remove a member from the workspace
   */
  async function remove(workspaceId: number, memberId: number): Promise<void> {
    await $api(`/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'DELETE',
    })
  }

  return {
    list,
    updateRole,
    remove,
  }
}

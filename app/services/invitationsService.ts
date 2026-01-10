import type {
  Invitation,
  ApiResponse,
  ApiListResponse,
  CreateInvitationData,
} from '~/types'
import { useApiClient } from './api'

/**
 * Invitations service - handles invitation API calls
 */
export function useInvitationsService() {
  const { $api } = useApiClient()

  /**
   * List all pending invitations for a workspace
   */
  async function list(workspaceId: number): Promise<Invitation[]> {
    const response = await $api<ApiListResponse<Invitation>>(
      `/workspaces/${workspaceId}/invitations`
    )
    return response.data
  }

  /**
   * Create a new invitation
   */
  async function create(
    workspaceId: number,
    data: CreateInvitationData
  ): Promise<Invitation> {
    const response = await $api<ApiResponse<Invitation>>(
      `/workspaces/${workspaceId}/invitations`,
      {
        method: 'POST',
        body: data,
      }
    )
    return response.data
  }

  /**
   * Cancel an invitation
   */
  async function cancel(workspaceId: number, invitationId: number): Promise<void> {
    await $api(`/workspaces/${workspaceId}/invitations/${invitationId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Accept an invitation by token
   * Returns the invitation with workspace details on success
   */
  async function accept(token: string): Promise<Invitation> {
    const response = await $api<ApiResponse<Invitation>>(
      `/invitations/${token}/accept`,
      { method: 'POST' }
    )
    return response.data
  }

  return {
    list,
    create,
    cancel,
    accept,
  }
}

import type {
  Invitation,
  ApiResponse,
  ApiListResponse,
  CreateInvitationData,
} from "~/types";
import { useApiClient } from "../core/api";

/**
 * Invitations service - handles invitation API calls
 */
export function useInvitationsService() {
  const { $api } = useApiClient();

  /**
   * List all pending invitations for a workspace
   */
  async function list(workspaceId: number): Promise<Invitation[]> {
    const response = await $api<ApiListResponse<Invitation> | Invitation[]>(
      `/workspaces/${workspaceId}/invitations`
    );
    return "data" in response && Array.isArray(response.data)
      ? response.data
      : Array.isArray(response)
      ? response
      : [];
  }

  /**
   * Create a new invitation
   */
  async function create(
    workspaceId: number,
    data: CreateInvitationData
  ): Promise<Invitation> {
    const response = await $api<ApiResponse<Invitation> | Invitation>(
      `/workspaces/${workspaceId}/invitations`,
      {
        method: "POST",
        body: data,
      }
    );
    return "data" in response ? response.data : response;
  }

  /**
   * Cancel an invitation
   */
  async function cancel(
    workspaceId: number,
    invitationId: number
  ): Promise<void> {
    await $api(`/workspaces/${workspaceId}/invitations/${invitationId}`, {
      method: "DELETE",
    });
  }

  /**
   * Accept an invitation by token
   * Returns the invitation with workspace details on success
   */
  async function accept(token: string): Promise<Invitation> {
    const response = await $api<ApiResponse<Invitation> | Invitation>(
      `/invitations/${token}/accept`,
      { method: "POST" }
    );
    return "data" in response ? response.data : response;
  }

  /**
   * Resend an invitation email
   */
  async function resend(
    workspaceId: number,
    invitationId: number
  ): Promise<Invitation> {
    const response = await $api<ApiResponse<Invitation> | Invitation>(
      `/workspaces/${workspaceId}/invitations/${invitationId}/resend`,
      { method: "POST" }
    );
    return "data" in response ? response.data : response;
  }

  return {
    list,
    create,
    cancel,
    accept,
    resend,
  };
}

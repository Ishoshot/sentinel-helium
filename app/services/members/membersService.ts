import type {
  TeamMember,
  ApiResponse,
  ApiListResponse,
  UpdateMemberRoleData,
} from "~/types";
import { useApiClient } from "../core/api";

/**
 * Members service - handles team member API calls
 */
export function useMembersService() {
  const { $api } = useApiClient();

  /**
   * List all members in a workspace
   */
  async function list(workspaceId: number): Promise<TeamMember[]> {
    const response = await $api<ApiListResponse<TeamMember> | TeamMember[]>(
      `/workspaces/${workspaceId}/members`
    );
    return "data" in response && Array.isArray(response.data)
      ? response.data
      : Array.isArray(response)
      ? response
      : [];
  }

  /**
   * Update a member's role
   */
  async function updateRole(
    workspaceId: number,
    memberId: number,
    data: UpdateMemberRoleData
  ): Promise<TeamMember> {
    const response = await $api<ApiResponse<TeamMember> | TeamMember>(
      `/workspaces/${workspaceId}/members/${memberId}`,
      {
        method: "PATCH",
        body: data,
      }
    );
    return "data" in response ? response.data : response;
  }

  /**
   * Remove a member from the workspace
   */
  async function remove(workspaceId: number, memberId: number): Promise<void> {
    await $api(`/workspaces/${workspaceId}/members/${memberId}`, {
      method: "DELETE",
    });
  }

  return {
    list,
    updateRole,
    remove,
  };
}

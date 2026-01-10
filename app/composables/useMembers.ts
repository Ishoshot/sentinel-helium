import type { TeamMember } from "~/types";
import { MemberRole } from "~/types";
import { useMembersService } from "~/services/membersService";
import { ApiError } from "~/services/api";

/**
 * Members composable - orchestrates team member management
 */
export function useMembers(workspaceId: Ref<number | null>) {
  const membersService = useMembersService();

  const members = ref<TeamMember[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all members for the workspace
   */
  async function fetchMembers() {
    if (!workspaceId.value) return [];

    isLoading.value = true;
    error.value = null;

    try {
      const data = await membersService.list(workspaceId.value);
      members.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to fetch members";
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update a member's role
   */
  async function updateMemberRole(
    memberId: number,
    role: Exclude<MemberRole, "owner">
  ) {
    if (!workspaceId.value) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const updatedMember = await membersService.updateRole(
        workspaceId.value,
        memberId,
        { role }
      );

      // Update local state
      const index = members.value.findIndex((m) => m.id === memberId);
      if (index !== -1 && updatedMember) {
        members.value[index] = updatedMember;
      }

      return updatedMember;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to change this member's role";
      } else if (e instanceof ApiError && e.errors) {
        error.value = Object.values(e.errors).flat().join(", ");
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to update member role";
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Remove a member from the workspace
   */
  async function removeMember(memberId: number) {
    if (!workspaceId.value) return false;

    isLoading.value = true;
    error.value = null;

    try {
      await membersService.remove(workspaceId.value, memberId);

      // Update local state
      members.value = members.value.filter((m) => m.id !== memberId);

      return true;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to remove this member";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to remove member";
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get the owner of the workspace
   */
  const owner = computed(
    () => members.value.find((m) => !!m && m.role === MemberRole.Owner) ?? null
  );

  /**
   * Get admins of the workspace
   */
  const admins = computed(() =>
    members.value.filter((m) => !!m && m.role === MemberRole.Admin)
  );

  /**
   * Get regular members of the workspace
   */
  const regularMembers = computed(() =>
    members.value.filter((m) => !!m && m.role === MemberRole.Member)
  );

  // Watch for workspace changes and refetch
  watch(workspaceId, (newId) => {
    if (newId) {
      fetchMembers();
    } else {
      members.value = [];
    }
  });

  return {
    // State
    members: readonly(members),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    owner,
    admins,
    regularMembers,

    // Methods
    fetchMembers,
    updateMemberRole,
    removeMember,
  };
}

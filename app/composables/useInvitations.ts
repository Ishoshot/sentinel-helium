import type { Invitation, CreateInvitationData } from "~/types";
import { useInvitationsService } from "~/services/invitationsService";
import { ApiError } from "~/services/api";

/**
 * Invitations composable - orchestrates invitation management
 */
export function useInvitations(workspaceId: Ref<number | null>) {
  const invitationsService = useInvitationsService();

  const invitations = ref<Invitation[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all pending invitations for the workspace
   */
  async function fetchInvitations() {
    if (!workspaceId.value) return [];

    isLoading.value = true;
    error.value = null;

    try {
      const data = await invitationsService.list(workspaceId.value);
      invitations.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch invitations";
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new invitation
   */
  async function createInvitation(data: CreateInvitationData) {
    if (!workspaceId.value) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const invitation = await invitationsService.create(
        workspaceId.value,
        data
      );

      // Add to local state
      if (invitation) {
        invitations.value.push(invitation);
      }

      return invitation;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to invite members";
      } else if (e instanceof ApiError && e.status === 422 && e.errors) {
        error.value = Object.values(e.errors).flat().join(", ");
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to send invitation";
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Cancel an invitation
   */
  async function cancelInvitation(invitationId: number) {
    if (!workspaceId.value) return false;

    isLoading.value = true;
    error.value = null;

    try {
      await invitationsService.cancel(workspaceId.value, invitationId);

      // Update local state
      invitations.value = invitations.value.filter(
        (i) => !!i && i.id !== invitationId
      );

      return true;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to cancel invitation";
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Accept an invitation by token (for the accept invitation page)
   */
  async function acceptInvitation(token: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const invitation = await invitationsService.accept(token);
      return invitation;
    } catch (e) {
      if (e instanceof ApiError) {
        switch (e.status) {
          case 401:
            error.value = "Please sign in to accept this invitation";
            break;
          case 404:
            error.value = "This invitation is invalid or has been revoked";
            break;
          case 409:
            error.value = "This invitation has already been accepted";
            break;
          case 410:
            error.value = "This invitation has expired";
            break;
          case 422:
            error.value = "You are already a member of this workspace";
            break;
          default:
            error.value = e.message || "Failed to accept invitation";
        }
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to accept invitation";
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Resend an invitation email
   */
  async function resendInvitation(invitationId: number) {
    if (!workspaceId.value) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const invitation = await invitationsService.resend(
        workspaceId.value,
        invitationId
      );

      // Update local state with refreshed invitation
      const index = invitations.value.findIndex(
        (i) => !!i && i.id === invitationId
      );
      if (index !== -1 && invitation) {
        invitations.value[index] = invitation;
      }

      return invitation;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to resend invitations";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to resend invitation";
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get pending invitations count
   */
  const pendingCount = computed(
    () => invitations.value.filter((i) => !!i && i.is_pending).length
  );

  // Watch for workspace changes and refetch
  watch(workspaceId, (newId) => {
    if (newId) {
      fetchInvitations();
    } else {
      invitations.value = [];
    }
  });

  return {
    // State
    invitations: readonly(invitations),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    pendingCount,

    // Methods
    fetchInvitations,
    createInvitation,
    cancelInvitation,
    resendInvitation,
    acceptInvitation,
  };
}

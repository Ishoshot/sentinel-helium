<script setup lang="ts">
import type { MemberRole } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useMembers } from '~/composables/useMembers'
import { useInvitations } from '~/composables/useInvitations'

/**
 * Workspace members page - manage team members and invitations
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()

// Get workspace ID as ref for composables
const workspaceId = computed(() => workspaceStore.currentWorkspaceId)

const {
  members,
  isLoading: membersLoading,
  error: membersError,
  fetchMembers,
  updateMemberRole,
  removeMember,
} = useMembers(workspaceId)

const {
  invitations,
  isLoading: invitationsLoading,
  error: invitationsError,
  fetchInvitations,
  createInvitation,
  cancelInvitation,
} = useInvitations(workspaceId)

// Check if current user can manage members (owner or admin)
const canManage = computed(() => {
  const currentMember = members.value.find(m => m.user_id === userStore.user?.id)
  return currentMember?.role === 'owner' || currentMember?.role === 'admin'
})

// Invite form ref
const inviteFormRef = ref<{ reset: () => void } | null>(null)

// Fetch data on mount
onMounted(() => {
  fetchMembers()
  fetchInvitations()
})

// Handle role change
async function handleRoleChange(memberId: number, role: Exclude<MemberRole, 'owner'>) {
  await updateMemberRole(memberId, role)
}

// Handle member removal
async function handleRemoveMember(memberId: number) {
  if (confirm('Are you sure you want to remove this member?')) {
    await removeMember(memberId)
  }
}

// Handle invitation
async function handleInvite(email: string, role: Exclude<MemberRole, 'owner'>) {
  const invitation = await createInvitation({ email, role })
  if (invitation) {
    inviteFormRef.value?.reset()
  }
}

// Handle invitation cancellation
async function handleCancelInvitation(invitationId: number) {
  if (confirm('Are you sure you want to cancel this invitation?')) {
    await cancelInvitation(invitationId)
  }
}

// Combined loading state
const isLoading = computed(() => membersLoading.value || invitationsLoading.value)
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-text-primary">
        Team Members
      </h1>
      <p class="mt-1 text-text-secondary">
        Manage who has access to this workspace
      </p>
    </div>

    <!-- Invite form (if can manage) -->
    <BaseCard
      v-if="canManage"
      class="mb-6"
    >
      <h2 class="text-sm font-medium text-text-primary mb-4">
        Invite a new member
      </h2>
      <DomainInviteForm
        ref="inviteFormRef"
        :loading="invitationsLoading"
        :error="invitationsError || ''"
        @submit="handleInvite"
      />
    </BaseCard>

    <!-- Members list -->
    <BaseCard padding="none">
      <div class="px-6 py-4 border-b border-border-subtle">
        <h2 class="text-sm font-medium text-text-primary">
          Members ({{ members.length }})
        </h2>
      </div>

      <!-- Loading state -->
      <div
        v-if="isLoading && members.length === 0"
        class="p-6"
      >
        <div class="space-y-4">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center gap-3"
          >
            <BaseSkeleton
              variant="circular"
              width="40px"
            />
            <div class="flex-1 space-y-2">
              <BaseSkeleton width="150px" />
              <BaseSkeleton width="200px" />
            </div>
          </div>
        </div>
      </div>

      <!-- Members list -->
      <div
        v-else
        class="divide-y divide-border-subtle"
      >
        <DomainMemberRow
          v-for="member in members"
          :key="member.id"
          :member="member"
          :can-manage="canManage"
          :current-user-id="userStore.user?.id || 0"
          @change-role="handleRoleChange"
          @remove="handleRemoveMember"
        />
      </div>

      <!-- Error state -->
      <div
        v-if="membersError"
        class="px-6 py-4 text-sm text-error"
      >
        {{ membersError }}
      </div>
    </BaseCard>

    <!-- Pending invitations -->
    <BaseCard
      v-if="invitations.length > 0 || canManage"
      padding="none"
      class="mt-6"
    >
      <div class="px-6 py-4 border-b border-border-subtle">
        <h2 class="text-sm font-medium text-text-primary">
          Pending Invitations ({{ invitations.length }})
        </h2>
      </div>

      <!-- Empty state -->
      <div
        v-if="invitations.length === 0"
        class="px-6 py-8 text-center text-text-muted"
      >
        <Icon
          name="lucide:mail"
          class="w-8 h-8 mx-auto mb-2 opacity-50"
        />
        <p class="text-sm">
          No pending invitations
        </p>
      </div>

      <!-- Invitations list -->
      <div
        v-else
        class="divide-y divide-border-subtle"
      >
        <DomainInvitationRow
          v-for="invitation in invitations"
          :key="invitation.id"
          :invitation="invitation"
          :can-manage="canManage"
          @cancel="handleCancelInvitation"
        />
      </div>
    </BaseCard>
  </div>
</template>

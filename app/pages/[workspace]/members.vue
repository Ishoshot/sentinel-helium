<script setup lang="ts">
import { MemberRole } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useMembers } from '~/composables/useMembers'
import { useInvitations } from '~/composables/useInvitations'

/**
 * Workspace members page - Premium team management experience
 * Features: Stats header, search, role grouping, rich member cards
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const toast = useAppToast()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()

// Get workspace ID as ref for composables
const workspaceId = computed(() => workspaceStore.currentWorkspaceId)

const {
  members,
  owner,
  admins,
  regularMembers,
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
  resendInvitation,
} = useInvitations(workspaceId)

// UI State
const searchQuery = ref('')
const showInviteModal = ref(false)
const showRemoveMemberModal = ref(false)
const showCancelInvitationModal = ref(false)
const pendingMemberId = ref<number | null>(null)
const pendingInvitationId = ref<number | null>(null)
const isProcessing = ref(false)
const inviteError = ref('')

// Check if current user can manage members (owner or admin)
const canManage = computed(() => {
  const currentMember = members.value.find(m => m.user_id === userStore.user?.id)
  return currentMember?.role === MemberRole.Owner || currentMember?.role === MemberRole.Admin
})

// Stats
const stats = computed(() => [
  {
    label: 'Total Members',
    value: members.value.length,
    icon: 'lucide:users',
    color: 'text-text-primary',
    bg: 'bg-bg-surface',
  },
  {
    label: 'Admins',
    value: admins.value.length + (owner.value ? 1 : 0),
    icon: 'lucide:shield',
    color: 'text-accent',
    bg: 'bg-accent-light',
  },
  {
    label: 'Pending',
    value: invitations.value.filter(i => !!i && !i.is_expired).length,
    icon: 'lucide:mail',
    color: 'text-warning',
    bg: 'bg-warning-light',
  },
])

// Filtered members based on search
const filteredMembers = computed(() => {
  const validMembers = members.value.filter(m => !!m)
  if (!searchQuery.value.trim()) return validMembers

  const query = searchQuery.value.toLowerCase()
  return validMembers.filter(m =>
    m.user.name.toLowerCase().includes(query) ||
    m.user.email.toLowerCase().includes(query)
  )
})

// Grouped filtered members
const groupedMembers = computed(() => {
  const filtered = filteredMembers.value
  return {
    owner: filtered.find(m => m.role === MemberRole.Owner) || null,
    admins: filtered.filter(m => m.role === MemberRole.Admin),
    members: filtered.filter(m => m.role === MemberRole.Member),
  }
})

// Has any filtered results
const hasFilteredResults = computed(() =>
  !!groupedMembers.value.owner ||
  groupedMembers.value.admins.length > 0 ||
  groupedMembers.value.members.length > 0
)

// Filtered invitations based on search
const filteredInvitations = computed(() => {
  const validInvitations = invitations.value.filter(i => !!i)
  if (!searchQuery.value.trim()) return validInvitations

  const query = searchQuery.value.toLowerCase()
  return validInvitations.filter(i =>
    i.email.toLowerCase().includes(query)
  )
})

// Pending member for removal modal
const pendingMember = computed(() =>
  pendingMemberId.value
    ? members.value.find(m => m.id === pendingMemberId.value)
    : null
)

// Pending invitation for cancel modal
const pendingInvitation = computed(() =>
  pendingInvitationId.value
    ? invitations.value.find(i => i.id === pendingInvitationId.value)
    : null
)

// Combined loading state
const isLoading = computed(() => membersLoading.value || invitationsLoading.value)

// Fetch data on mount
onMounted(() => {
  fetchMembers()
  fetchInvitations()
})

// Handle role change
async function handleRoleChange(memberId: number, role: Exclude<MemberRole, MemberRole.Owner>) {
  const result = await updateMemberRole(memberId, role)
  if (result) {
    toast.success('Role updated successfully')
  } else if (membersError.value) {
    toast.error(membersError.value)
  }
}

// Handle member removal - show modal
function handleRemoveMember(memberId: number) {
  pendingMemberId.value = memberId
  showRemoveMemberModal.value = true
}

// Confirm member removal
async function confirmRemoveMember() {
  if (!pendingMemberId.value) return

  isProcessing.value = true
  const success = await removeMember(pendingMemberId.value)
  isProcessing.value = false

  if (success) {
    toast.success('Member removed from workspace')
    showRemoveMemberModal.value = false
    pendingMemberId.value = null
  } else if (membersError.value) {
    toast.error(membersError.value)
  }
}

// Handle invitation
async function handleInvite(email: string, role: Exclude<MemberRole, MemberRole.Owner>) {
  inviteError.value = ''
  const invitation = await createInvitation({ email, role })
  if (invitation) {
    showInviteModal.value = false
    toast.success(`Invitation sent to ${email}`)
  } else if (invitationsError.value) {
    inviteError.value = invitationsError.value
  }
}

// Handle invitation cancellation - show modal
function handleCancelInvitation(invitationId: number) {
  pendingInvitationId.value = invitationId
  showCancelInvitationModal.value = true
}

// Confirm invitation cancellation
async function confirmCancelInvitation() {
  if (!pendingInvitationId.value) return

  isProcessing.value = true
  const success = await cancelInvitation(pendingInvitationId.value)
  isProcessing.value = false

  if (success) {
    toast.success('Invitation cancelled')
    showCancelInvitationModal.value = false
    pendingInvitationId.value = null
  } else if (invitationsError.value) {
    toast.error(invitationsError.value)
  }
}

// Handle resend invitation
async function handleResendInvitation(invitationId: number) {
  const result = await resendInvitation(invitationId)
  if (result) {
    toast.success('Invitation resent')
  } else if (invitationsError.value) {
    toast.error(invitationsError.value)
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-text-primary">
          Team Members
        </h1>
        <p class="mt-1 text-text-secondary">
          Manage who has access to this workspace
        </p>
      </div>

      <BaseButton
        v-if="canManage"
        @click="showInviteModal = true"
      >
        <Icon
          name="lucide:user-plus"
          class="w-4 h-4 mr-1.5"
        />
        Invite member
      </BaseButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-3 gap-5 mb-10">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="p-5 bg-bg-elevated border border-border-subtle rounded-xl"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center"
            :class="stat.bg"
          >
            <Icon
              :name="stat.icon"
              class="w-6 h-6"
              :class="stat.color"
            />
          </div>
          <div>
            <p class="text-2xl font-semibold text-text-primary">
              {{ stat.value }}
            </p>
            <p class="text-sm text-text-muted">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-8">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon
            name="lucide:search"
            class="w-4 h-4 text-text-muted"
          />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or email..."
          class="w-full pl-10 pr-4 py-3 text-sm text-text-primary bg-bg-elevated border border-border-subtle rounded-xl transition-all duration-200 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <button
            v-if="searchQuery"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            @click="searchQuery = ''"
          >
            <Icon
              name="lucide:x"
              class="w-4 h-4 text-text-muted hover:text-text-primary"
            />
          </button>
        </Transition>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading && members.length === 0"
      class="space-y-4"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="p-4 bg-bg-elevated border border-border-subtle rounded-xl"
      >
        <div class="flex items-center gap-4">
          <BaseSkeleton
            variant="circular"
            class="w-12 h-12"
          />
          <div class="flex-1 space-y-2">
            <BaseSkeleton class="h-4 w-32" />
            <BaseSkeleton class="h-3 w-48" />
          </div>
        </div>
      </div>
    </div>

    <!-- Members Content -->
    <template v-else>
      <!-- No results state -->
      <BaseCard
        v-if="searchQuery && !hasFilteredResults && filteredInvitations.length === 0"
        class="mb-6"
      >
        <BaseEmptyState
          icon="lucide:search-x"
          title="No results found"
          :description="`No members or invitations match '${searchQuery}'`"
          compact
        >
          <BaseButton
            variant="secondary"
            size="sm"
            @click="searchQuery = ''"
          >
            Clear search
          </BaseButton>
        </BaseEmptyState>
      </BaseCard>

      <template v-else>
        <!-- Owner Section -->
        <section
          v-if="groupedMembers.owner"
          class="mb-10"
        >
          <div class="flex items-center gap-2 mb-4">
            <Icon
              name="lucide:crown"
              class="w-4 h-4 text-warning"
            />
            <h2 class="text-sm font-medium text-text-secondary">
              Owner
            </h2>
          </div>
          <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <DomainMemberCard
              :member="groupedMembers.owner"
              :can-manage="canManage"
              :current-user-id="userStore.user?.id || 0"
              @change-role="handleRoleChange"
              @remove="handleRemoveMember"
            />
          </div>
        </section>

        <!-- Admins Section -->
        <section
          v-if="groupedMembers.admins.length > 0"
          class="mb-10"
        >
          <div class="flex items-center gap-2 mb-4">
            <Icon
              name="lucide:shield"
              class="w-4 h-4 text-accent"
            />
            <h2 class="text-sm font-medium text-text-secondary">
              Administrators
            </h2>
            <span class="px-1.5 py-0.5 text-xs font-medium text-accent bg-accent/10 rounded">
              {{ groupedMembers.admins.length }}
            </span>
          </div>
          <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <DomainMemberCard
              v-for="member in groupedMembers.admins"
              :key="member.id"
              :member="member"
              :can-manage="canManage"
              :current-user-id="userStore.user?.id || 0"
              @change-role="handleRoleChange"
              @remove="handleRemoveMember"
            />
          </div>
        </section>

        <!-- Members Section -->
        <section
          v-if="groupedMembers.members.length > 0"
          class="mb-10"
        >
          <div class="flex items-center gap-2 mb-4">
            <Icon
              name="lucide:users"
              class="w-4 h-4 text-text-muted"
            />
            <h2 class="text-sm font-medium text-text-secondary">
              Members
            </h2>
            <span class="px-1.5 py-0.5 text-xs font-medium text-text-muted bg-bg-surface rounded">
              {{ groupedMembers.members.length }}
            </span>
          </div>
          <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <DomainMemberCard
              v-for="member in groupedMembers.members"
              :key="member.id"
              :member="member"
              :can-manage="canManage"
              :current-user-id="userStore.user?.id || 0"
              @change-role="handleRoleChange"
              @remove="handleRemoveMember"
            />
          </div>
        </section>

        <!-- Pending Invitations Section -->
        <section
          v-if="filteredInvitations.length > 0 || (canManage && invitations.length > 0)"
        >
          <div class="flex items-center gap-2 mb-4">
            <Icon
              name="lucide:mail"
              class="w-4 h-4 text-warning"
            />
            <h2 class="text-sm font-medium text-text-secondary">
              Pending Invitations
            </h2>
            <span class="px-1.5 py-0.5 text-xs font-medium text-warning bg-warning-light rounded">
              {{ filteredInvitations.length }}
            </span>
          </div>

          <div
            v-if="filteredInvitations.length > 0"
            class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            <DomainInvitationCard
              v-for="invitation in filteredInvitations"
              :key="invitation.id"
              :invitation="invitation"
              :can-manage="canManage"
              @cancel="handleCancelInvitation"
              @resend="handleResendInvitation"
            />
          </div>

          <BaseCard
            v-else-if="canManage && !searchQuery"
            class="border-dashed"
          >
            <BaseEmptyState
              icon="lucide:mail"
              title="No pending invitations"
              description="Invite team members to collaborate in this workspace"
              compact
            >
              <BaseButton
                variant="secondary"
                size="sm"
                @click="showInviteModal = true"
              >
                <Icon
                  name="lucide:user-plus"
                  class="w-4 h-4 mr-1.5"
                />
                Invite member
              </BaseButton>
            </BaseEmptyState>
          </BaseCard>
        </section>

        <!-- Solo workspace prompt -->
        <BaseCard
          v-if="members.length === 1 && invitations.length === 0 && canManage && !searchQuery"
          class="mt-6 border-accent/20 bg-accent/[0.02]"
        >
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Icon
                name="lucide:users"
                class="w-6 h-6 text-accent"
              />
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-text-primary">
                You're the only one here
              </h3>
              <p class="text-sm text-text-muted mt-1">
                Invite your team to collaborate on code reviews and share insights together.
              </p>
              <BaseButton
                class="mt-3"
                size="sm"
                @click="showInviteModal = true"
              >
                <Icon
                  name="lucide:user-plus"
                  class="w-4 h-4 mr-1.5"
                />
                Invite your first teammate
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </template>
    </template>

    <!-- Invite Modal -->
    <DomainInviteMemberModal
      v-model="showInviteModal"
      :loading="invitationsLoading"
      :error="inviteError"
      @submit="handleInvite"
    />

    <!-- Remove member confirmation modal -->
    <BaseModal
      v-model="showRemoveMemberModal"
      title="Remove team member"
      size="sm"
    >
      <div class="space-y-4">
        <div
          v-if="pendingMember"
          class="flex items-center gap-3 p-3 bg-bg-surface rounded-xl"
        >
          <BaseAvatar
            :src="pendingMember.user.avatar_url"
            :name="pendingMember.user.name"
            size="md"
          />
          <div>
            <p class="text-sm font-medium text-text-primary">
              {{ pendingMember.user.name }}
            </p>
            <p class="text-xs text-text-muted">
              {{ pendingMember.user.email }}
            </p>
          </div>
        </div>

        <div class="p-3 bg-error-light rounded-lg">
          <div class="flex items-start gap-2">
            <Icon
              name="lucide:alert-triangle"
              class="w-4 h-4 text-error flex-shrink-0 mt-0.5"
            />
            <p class="text-sm text-error">
              This person will immediately lose access to the workspace and all its resources.
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton
            variant="secondary"
            @click="showRemoveMemberModal = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="danger"
            :loading="isProcessing"
            @click="confirmRemoveMember"
          >
            <Icon
              name="lucide:user-minus"
              class="w-4 h-4 mr-1.5"
            />
            Remove member
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Cancel invitation confirmation modal -->
    <BaseModal
      v-model="showCancelInvitationModal"
      title="Cancel invitation"
      size="sm"
    >
      <div class="space-y-4">
        <div
          v-if="pendingInvitation"
          class="flex items-center gap-3 p-3 bg-bg-surface rounded-xl"
        >
          <div class="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center">
            <Icon
              name="lucide:mail"
              class="w-5 h-5 text-warning"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-text-primary">
              {{ pendingInvitation.email }}
            </p>
            <p class="text-xs text-text-muted">
              Invited as {{ pendingInvitation.role_label }}
            </p>
          </div>
        </div>

        <p class="text-sm text-text-secondary">
          This invitation link will no longer work. You can always send a new invitation later.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton
            variant="secondary"
            @click="showCancelInvitationModal = false"
          >
            Keep invitation
          </BaseButton>
          <BaseButton
            variant="danger"
            :loading="isProcessing"
            @click="confirmCancelInvitation"
          >
            Cancel invitation
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

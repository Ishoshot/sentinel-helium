<script setup lang="ts">
import { MemberRole } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useAppToast } from '~/composables/shared/useAppToast'
import { useMembers } from '~/composables/members/useMembers'
import { useInvitations } from '~/composables/members/useInvitations'
import DomainMembersMemberCard from '~/components/domain/members/MemberCard.vue'
import DomainMembersInvitationCard from '~/components/domain/members/InvitationCard.vue'
import DomainMembersInviteMemberModal from '~/components/domain/members/InviteMemberModal.vue'

/**
 * Workspace members page
 * Clean, functional team management following Sentinel UX principles
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const toast = useAppToast()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()

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
  resendInvitation,
} = useInvitations(workspaceId)

// UI State
const searchQuery = ref('')
const showInviteModal = ref(false)
const showRemoveMemberModal = ref(false)
const showCancelInvitationModal = ref(false)
const pendingMemberId = ref<number | null>(null)
const pendingInvitationId = ref<number | null>(null)
const resendingInvitationId = ref<number | null>(null)
const isProcessing = ref(false)
const inviteError = ref('')

const canManage = computed(() => {
  const currentMember = members.value.find(m => m.user_id === userStore.user?.id)
  return currentMember?.role === MemberRole.Owner || currentMember?.role === MemberRole.Admin
})

// Filtered and grouped members
const filteredMembers = computed(() => {
  const valid = members.value.filter(m => !!m)
  if (!searchQuery.value.trim()) return valid
  const q = searchQuery.value.toLowerCase()
  return valid.filter(m =>
    m.user.name.toLowerCase().includes(q) ||
    m.user.email.toLowerCase().includes(q)
  )
})

const groupedMembers = computed(() => {
  const filtered = filteredMembers.value
  return {
    owner: filtered.find(m => m.role === MemberRole.Owner) || null,
    admins: filtered.filter(m => m.role === MemberRole.Admin),
    members: filtered.filter(m => m.role === MemberRole.Member),
  }
})

const hasFilteredResults = computed(() =>
  !!groupedMembers.value.owner ||
  groupedMembers.value.admins.length > 0 ||
  groupedMembers.value.members.length > 0
)

const filteredInvitations = computed(() => {
  const valid = invitations.value.filter(i => !!i)
  if (!searchQuery.value.trim()) return valid
  const q = searchQuery.value.toLowerCase()
  return valid.filter(i => i.email.toLowerCase().includes(q))
})

const pendingMember = computed(() =>
  pendingMemberId.value ? members.value.find(m => m.id === pendingMemberId.value) : null
)

const pendingInvitation = computed(() =>
  pendingInvitationId.value ? invitations.value.find(i => i.id === pendingInvitationId.value) : null
)

const isLoading = computed(() => membersLoading.value || invitationsLoading.value)

const pendingCount = computed(() => invitations.value.filter(i => !!i && !i.is_expired).length)

onMounted(() => {
  fetchMembers()
  fetchInvitations()
})

async function handleRoleChange(memberId: number, role: Exclude<MemberRole, MemberRole.Owner>) {
  const result = await updateMemberRole(memberId, role)
  if (result) {
    toast.success('Role updated')
  } else if (membersError.value) {
    toast.error(membersError.value)
  }
}

function handleRemoveMember(memberId: number) {
  pendingMemberId.value = memberId
  showRemoveMemberModal.value = true
}

async function confirmRemoveMember() {
  if (!pendingMemberId.value) return
  isProcessing.value = true
  const success = await removeMember(pendingMemberId.value)
  isProcessing.value = false
  if (success) {
    toast.success('Member removed')
    showRemoveMemberModal.value = false
    pendingMemberId.value = null
  } else if (membersError.value) {
    toast.error(membersError.value)
  }
}

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

function handleCancelInvitation(invitationId: number) {
  pendingInvitationId.value = invitationId
  showCancelInvitationModal.value = true
}

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

async function handleResendInvitation(invitationId: number) {
  resendingInvitationId.value = invitationId
  try {
    const result = await resendInvitation(invitationId)
    if (result) {
      toast.success('Invitation resent')
    } else if (invitationsError.value) {
      toast.error(invitationsError.value)
    }
  } finally {
    resendingInvitationId.value = null
  }
}
</script>

<template>
  <BaseContainer class="space-y-8">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">
          Members
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ members.length }} {{ members.length === 1 ? 'member' : 'members' }}
          <template v-if="pendingCount > 0">
            · {{ pendingCount }} pending
          </template>
        </p>
      </div>

      <button
        v-if="canManage"
        class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        @click="showInviteModal = true"
      >
        <Icon
          name="lucide:plus"
          class="size-4"
        />
        Invite
      </button>
    </div>

    <!-- Search -->
    <div class="relative max-w-sm">
      <Icon
        name="lucide:search"
        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
      />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search members..."
        class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-0"
      >
      <button
        v-if="searchQuery"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        @click="searchQuery = ''"
      >
        <Icon
          name="lucide:x"
          class="size-4"
        />
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading && members.length === 0"
      class="space-y-3"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="flex items-center gap-4 rounded-lg border border-gray-100 bg-white p-4"
      >
        <BaseSkeleton class="size-10 rounded-full" />
        <div class="flex-1 space-y-2">
          <BaseSkeleton class="h-4 w-32" />
          <BaseSkeleton class="h-3 w-48" />
        </div>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- No results -->
      <div
        v-if="searchQuery && !hasFilteredResults && filteredInvitations.length === 0"
        class="py-12 text-center"
      >
        <p class="text-sm text-gray-500">
          No members match "{{ searchQuery }}"
        </p>
        <button
          class="mt-2 text-sm text-gray-900 underline underline-offset-2"
          @click="searchQuery = ''"
        >
          Clear search
        </button>
      </div>

      <template v-else>
        <!-- Members Table -->
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/50">
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Member
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Role
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Joined
                </th>
                <th
                  v-if="canManage"
                  class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <!-- Owner -->
              <tr
                v-if="groupedMembers.owner"
                class="group"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <BaseAvatar
                      :src="groupedMembers.owner.user.avatar_url"
                      :name="groupedMembers.owner.user.name"
                      size="sm"
                    />
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="truncate text-sm font-medium text-gray-900">
                          {{ groupedMembers.owner.user.name }}
                        </span>
                        <span
                          v-if="groupedMembers.owner.user_id === userStore.user?.id"
                          class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                        >
                          you
                        </span>
                      </div>
                      <p class="truncate text-sm text-gray-500">
                        {{ groupedMembers.owner.user.email }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 text-sm text-gray-700">
                    <Icon
                      name="lucide:crown"
                      class="size-3.5 text-amber-500"
                    />
                    Owner
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">
                  {{ new Date(groupedMembers.owner.joined_at || groupedMembers.owner.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                </td>
                <td
                  v-if="canManage"
                  class="px-4 py-3"
                />
              </tr>

              <!-- Admins -->
              <tr
                v-for="member in groupedMembers.admins"
                :key="member.id"
                class="group"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <BaseAvatar
                      :src="member.user.avatar_url"
                      :name="member.user.name"
                      size="sm"
                    />
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="truncate text-sm font-medium text-gray-900">
                          {{ member.user.name }}
                        </span>
                        <span
                          v-if="member.user_id === userStore.user?.id"
                          class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                        >
                          you
                        </span>
                      </div>
                      <p class="truncate text-sm text-gray-500">
                        {{ member.user.email }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1.5 text-sm text-gray-700">
                    <Icon
                      name="lucide:shield"
                      class="size-3.5 text-blue-500"
                    />
                    Admin
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">
                  {{ new Date(member.joined_at || member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                </td>
                <td
                  v-if="canManage"
                  class="px-4 py-3"
                >
                  <div
                    v-if="member.user_id !== userStore.user?.id"
                    class="flex items-center justify-end gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100"
                  >
                    <button
                      class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Change role"
                      @click="handleRoleChange(member.id, MemberRole.Member)"
                    >
                      <Icon
                        name="lucide:arrow-down"
                        class="size-4"
                      />
                    </button>
                    <button
                      class="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Remove"
                      @click="handleRemoveMember(member.id)"
                    >
                      <Icon
                        name="lucide:x"
                        class="size-4"
                      />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Members -->
              <tr
                v-for="member in groupedMembers.members"
                :key="member.id"
                class="group"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <BaseAvatar
                      :src="member.user.avatar_url"
                      :name="member.user.name"
                      size="sm"
                    />
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="truncate text-sm font-medium text-gray-900">
                          {{ member.user.name }}
                        </span>
                        <span
                          v-if="member.user_id === userStore.user?.id"
                          class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                        >
                          you
                        </span>
                      </div>
                      <p class="truncate text-sm text-gray-500">
                        {{ member.user.email }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm text-gray-500">
                    Member
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">
                  {{ new Date(member.joined_at || member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                </td>
                <td
                  v-if="canManage"
                  class="px-4 py-3"
                >
                  <div
                    v-if="member.user_id !== userStore.user?.id"
                    class="flex items-center justify-end gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100"
                  >
                    <button
                      class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Promote to admin"
                      @click="handleRoleChange(member.id, MemberRole.Admin)"
                    >
                      <Icon
                        name="lucide:arrow-up"
                        class="size-4"
                      />
                    </button>
                    <button
                      class="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Remove"
                      @click="handleRemoveMember(member.id)"
                    >
                      <Icon
                        name="lucide:x"
                        class="size-4"
                      />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="!groupedMembers.owner && groupedMembers.admins.length === 0 && groupedMembers.members.length === 0">
                <td
                  :colspan="canManage ? 4 : 3"
                  class="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No members found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pending Invitations -->
        <div
          v-if="filteredInvitations.length > 0"
          class="space-y-4"
        >
          <h2 class="text-sm font-medium text-gray-700">
            Pending invitations
          </h2>

          <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table class="w-full">
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="invitation in filteredInvitations"
                  :key="invitation.id"
                  class="group"
                >
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="flex size-8 items-center justify-center rounded-full bg-gray-100">
                        <Icon
                          name="lucide:mail"
                          class="size-4 text-gray-400"
                        />
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-gray-900">
                          {{ invitation.email }}
                        </p>
                        <p class="text-xs text-gray-500">
                          Invited by {{ invitation.invited_by.name }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-sm text-gray-500">
                      {{ invitation.role === MemberRole.Admin ? 'Admin' : 'Member' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="text-sm"
                      :class="invitation.is_expired ? 'text-amber-600' : 'text-gray-500'"
                    >
                      {{ invitation.is_expired ? 'Expired' : `Expires ${new Date(invitation.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` }}
                    </span>
                  </td>
                  <td
                    v-if="canManage"
                    class="px-4 py-3"
                  >
                    <div class="flex items-center justify-end gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                      <button
                        class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                        title="Resend"
                        :disabled="resendingInvitationId === invitation.id"
                        @click="handleResendInvitation(invitation.id)"
                      >
                        <Icon
                          :name="resendingInvitationId === invitation.id ? 'lucide:loader-2' : 'lucide:send'"
                          class="size-4"
                          :class="{ 'animate-spin': resendingInvitationId === invitation.id }"
                        />
                      </button>
                      <button
                        class="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Cancel"
                        @click="handleCancelInvitation(invitation.id)"
                      >
                        <Icon
                          name="lucide:x"
                          class="size-4"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty team prompt -->
        <div
          v-if="members.length === 1 && invitations.length === 0 && canManage && !searchQuery"
          class="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center"
        >
          <p class="text-sm text-gray-600">
            You're the only member in this workspace.
          </p>
          <button
            class="mt-3 text-sm font-medium text-gray-900 underline underline-offset-2"
            @click="showInviteModal = true"
          >
            Invite your team
          </button>
        </div>
      </template>
    </template>

    <!-- Invite Modal -->
    <DomainMembersInviteMemberModal
      v-model="showInviteModal"
      :loading="invitationsLoading"
      :error="inviteError"
      @submit="handleInvite"
    />

    <!-- Remove member modal -->
    <BaseModal
      v-model="showRemoveMemberModal"
      title="Remove member"
      size="sm"
    >
      <div class="space-y-4">
        <div
          v-if="pendingMember"
          class="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
        >
          <BaseAvatar
            :src="pendingMember.user.avatar_url"
            :name="pendingMember.user.name"
            size="sm"
          />
          <div>
            <p class="text-sm font-medium text-gray-900">
              {{ pendingMember.user.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ pendingMember.user.email }}
            </p>
          </div>
        </div>

        <p class="text-sm text-gray-600">
          This person will immediately lose access to the workspace.
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <button
            class="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="showRemoveMemberModal = false"
          >
            Cancel
          </button>
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            :disabled="isProcessing"
            @click="confirmRemoveMember"
          >
            <Icon
              v-if="isProcessing"
              name="lucide:loader-2"
              class="size-4 animate-spin"
            />
            Remove
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Cancel invitation modal -->
    <BaseModal
      v-model="showCancelInvitationModal"
      title="Cancel invitation"
      size="sm"
    >
      <div class="space-y-4">
        <div
          v-if="pendingInvitation"
          class="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
        >
          <div class="flex size-8 items-center justify-center rounded-full bg-gray-200">
            <Icon
              name="lucide:mail"
              class="size-4 text-gray-500"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">
              {{ pendingInvitation.email }}
            </p>
            <p class="text-xs text-gray-500">
              Invited as {{ pendingInvitation.role_label }}
            </p>
          </div>
        </div>

        <p class="text-sm text-gray-600">
          The invitation link will no longer work.
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <button
            class="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="showCancelInvitationModal = false"
          >
            Keep
          </button>
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            :disabled="isProcessing"
            @click="confirmCancelInvitation"
          >
            <Icon
              v-if="isProcessing"
              name="lucide:loader-2"
              class="size-4 animate-spin"
            />
            Cancel invitation
          </button>
        </div>
      </template>
    </BaseModal>
  </BaseContainer>
</template>

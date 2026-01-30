<script setup lang="ts">
import { MemberRole } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useWorkspaces } from '~/composables/workspace/useWorkspaces'
import { useMembers } from '~/composables/members/useMembers'

/**
 * Workspace settings page - manage workspace configuration
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const router = useRouter()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const workspaceId = computed(() => workspaceStore.currentWorkspaceId)

const {
  updateWorkspace,
  deleteWorkspace,
  isLoading,
  error,
} = useWorkspaces()

const { members, fetchMembers } = useMembers(workspaceId)

// Page ready state for animations
const isPageReady = ref(false)

// Form state
const workspaceName = ref(workspaceStore.currentWorkspace?.name || '')
const showDeleteModal = ref(false)
const deleteConfirmation = ref('')

// Check permissions
const currentMember = computed(() =>
  members.value.find(m => m.user_id === userStore.user?.id)
)

const canEdit = computed(() =>
  currentMember.value?.role === MemberRole.Owner || currentMember.value?.role === MemberRole.Admin
)

const isOwner = computed(() =>
  currentMember.value?.role === MemberRole.Owner
)

// Fetch members on mount to check permissions
onMounted(() => {
  fetchMembers()
  setTimeout(() => {
    isPageReady.value = true
  }, 50)
})

// Update workspace name when store changes
watch(() => workspaceStore.currentWorkspace?.name, (name) => {
  if (name) {
    workspaceName.value = name
  }
})

// Save workspace name
async function handleSave() {
  if (!workspaceId.value || !workspaceName.value.trim()) return

  await updateWorkspace(workspaceId.value, {
    name: workspaceName.value.trim(),
  })
}

// Delete workspace
async function handleDelete() {
  if (!workspaceId.value) return
  if (deleteConfirmation.value !== workspaceStore.currentWorkspace?.name) return

  const success = await deleteWorkspace(workspaceId.value)
  if (success) {
    showDeleteModal.value = false
    router.push('/')
  }
}

// Check if name has changed
const hasChanges = computed(() =>
  workspaceName.value.trim() !== workspaceStore.currentWorkspace?.name
)
</script>

<template>
  <div class="space-y-6">
    <!-- Two column layout for breathable cards -->
    <div
      class="grid xl:grid-cols-2 gap-6 transition-all duration-500 ease-out"
      :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    >
      <!-- Left Column - General settings -->
      <div class="rounded-xl border border-gray-200 bg-white p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="flex size-10 items-center justify-center rounded-xl bg-gray-100">
            <Icon
              name="lucide:settings"
              class="size-5 text-gray-500"
            />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">
              General
            </h2>
            <p class="text-sm text-gray-500">
              Basic workspace configuration
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSave">
          <BaseInput
            v-model="workspaceName"
            label="Workspace Name"
            placeholder="Enter workspace name"
            :disabled="!canEdit"
            :error="error || ''"
          />

          <div
            v-if="canEdit"
            class="mt-5"
          >
            <BaseButton
              type="submit"
              :loading="isLoading"
              :disabled="!hasChanges"
            >
              Save Changes
            </BaseButton>
          </div>

          <p
            v-if="!canEdit"
            class="mt-4 text-sm text-gray-500"
          >
            Only workspace owners and admins can edit settings.
          </p>
        </form>
      </div>

      <!-- Right Column - Danger zone (owner only) -->
      <div
        v-if="isOwner"
        class="h-fit rounded-xl border border-red-200 bg-white p-6"
      >
        <div class="flex items-center gap-3 mb-6">
          <div class="flex size-10 items-center justify-center rounded-xl bg-red-50">
            <Icon
              name="lucide:alert-triangle"
              class="size-5 text-red-600"
            />
          </div>
          <div>
            <h2 class="text-base font-semibold text-red-700">
              Danger Zone
            </h2>
            <p class="text-sm text-gray-500">
              Irreversible actions
            </p>
          </div>
        </div>

        <p class="text-sm text-gray-600 mb-5">
          Permanently delete this workspace and all of its data including members, integrations, and settings. This action cannot be undone.
        </p>

        <BaseButton
          variant="danger"
          @click="showDeleteModal = true"
        >
          <Icon
            name="lucide:trash-2"
            class="size-4 mr-1.5"
          />
          Delete Workspace
        </BaseButton>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <BaseModal
      v-model="showDeleteModal"
      title="Delete Workspace"
      size="sm"
    >
      <div class="space-y-4">
        <div class="rounded-lg bg-red-50 p-3">
          <p class="text-sm text-red-700">
            This will permanently delete the workspace
            <strong>{{ workspaceStore.currentWorkspace?.name }}</strong>
            and all associated data including members and settings.
          </p>
        </div>

        <p class="text-sm text-gray-600">
          To confirm, type the workspace name below:
        </p>

        <BaseInput
          v-model="deleteConfirmation"
          :placeholder="workspaceStore.currentWorkspace?.name"
        />
      </div>

      <template #footer>
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton
            variant="secondary"
            @click="showDeleteModal = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="danger"
            :loading="isLoading"
            :disabled="deleteConfirmation !== workspaceStore.currentWorkspace?.name"
            @click="handleDelete"
          >
            Delete Workspace
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

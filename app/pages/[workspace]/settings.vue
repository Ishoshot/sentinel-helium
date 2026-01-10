<script setup lang="ts">
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useWorkspaces } from '~/composables/useWorkspaces'
import { useMembers } from '~/composables/useMembers'

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

// Form state
const workspaceName = ref(workspaceStore.currentWorkspace?.name || '')
const showDeleteModal = ref(false)
const deleteConfirmation = ref('')

// Check permissions
const currentMember = computed(() =>
  members.value.find(m => m.user_id === userStore.user?.id)
)

const canEdit = computed(() =>
  currentMember.value?.role === 'owner' || currentMember.value?.role === 'admin'
)

const isOwner = computed(() =>
  currentMember.value?.role === 'owner'
)

// Fetch members on mount to check permissions
onMounted(() => {
  fetchMembers()
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
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-text-primary">
        Workspace Settings
      </h1>
      <p class="mt-1 text-text-secondary">
        Manage your workspace configuration
      </p>
    </div>

    <!-- General settings -->
    <BaseCard class="mb-6">
      <h2 class="text-lg font-medium text-text-primary mb-4">
        General
      </h2>

      <form @submit.prevent="handleSave">
        <div class="max-w-md">
          <BaseInput
            v-model="workspaceName"
            label="Workspace Name"
            placeholder="Enter workspace name"
            :disabled="!canEdit"
            :error="error || ''"
          />
        </div>

        <div
          v-if="canEdit"
          class="mt-4"
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
          class="mt-4 text-sm text-text-muted"
        >
          Only workspace owners and admins can edit settings.
        </p>
      </form>
    </BaseCard>

    <!-- Danger zone (owner only) -->
    <BaseCard
      v-if="isOwner"
      class="border-error/20"
    >
      <h2 class="text-lg font-medium text-error mb-2">
        Danger Zone
      </h2>
      <p class="text-sm text-text-secondary mb-4">
        Permanently delete this workspace and all of its data. This action cannot be undone.
      </p>

      <BaseButton
        variant="danger"
        @click="showDeleteModal = true"
      >
        <Icon
          name="lucide:trash-2"
          class="w-4 h-4 mr-1.5"
        />
        Delete Workspace
      </BaseButton>
    </BaseCard>

    <!-- Delete confirmation modal -->
    <BaseModal
      v-model="showDeleteModal"
      title="Delete Workspace"
      size="sm"
    >
      <div class="space-y-4">
        <div class="p-3 bg-error-light rounded-lg">
          <p class="text-sm text-error">
            This will permanently delete the workspace
            <strong>{{ workspaceStore.currentWorkspace?.name }}</strong>
            and all associated data including members and settings.
          </p>
        </div>

        <p class="text-sm text-text-secondary">
          To confirm, type the workspace name below:
        </p>

        <BaseInput
          v-model="deleteConfirmation"
          :placeholder="workspaceStore.currentWorkspace?.name"
        />
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
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

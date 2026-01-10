<script setup lang="ts">
import { MemberRole } from '~/types'
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
  currentMember.value?.role === MemberRole.Owner || currentMember.value?.role === MemberRole.Admin
)

const isOwner = computed(() =>
  currentMember.value?.role === MemberRole.Owner
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
    <!-- Two column layout for breathable cards -->
    <div class="grid xl:grid-cols-2 gap-6">
      <!-- Left Column - General settings -->
      <BaseCard>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-bg-surface flex items-center justify-center">
            <Icon
              name="lucide:settings"
              class="w-5 h-5 text-text-muted"
            />
          </div>
          <div>
            <h2 class="text-base font-semibold text-text-primary">
              General
            </h2>
            <p class="text-sm text-text-muted">
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
            class="mt-4 text-sm text-text-muted"
          >
            Only workspace owners and admins can edit settings.
          </p>
        </form>
      </BaseCard>

      <!-- Right Column - Danger zone (owner only) -->
      <BaseCard
        v-if="isOwner"
        class="border-error/20 h-fit"
      >
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
            <Icon
              name="lucide:alert-triangle"
              class="w-5 h-5 text-error"
            />
          </div>
          <div>
            <h2 class="text-base font-semibold text-error">
              Danger Zone
            </h2>
            <p class="text-sm text-text-muted">
              Irreversible actions
            </p>
          </div>
        </div>

        <p class="text-sm text-text-secondary mb-5">
          Permanently delete this workspace and all of its data including members, integrations, and settings. This action cannot be undone.
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
    </div>

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

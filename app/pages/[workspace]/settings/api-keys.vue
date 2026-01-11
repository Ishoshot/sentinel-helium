<script setup lang="ts">
import { MemberRole, type UpdateRepositoryData } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useMembers } from '~/composables/useMembers'
import { useGitHub } from '~/composables/useGitHub'

/**
 * API Keys page - Manage provider keys for repositories
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const toast = useAppToast()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const workspaceId = computed(() => workspaceStore.currentWorkspaceId)
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug)

// Composables
const { members, fetchMembers } = useMembers(workspaceId)
const {
  repositories,
  isLoading,
  isConnected,
  fetchConnection,
  fetchRepositories,
  updateRepository,
  error,
} = useGitHub(workspaceId)

// Permissions
const currentMember = computed(() =>
  members.value.find((m) => m.user_id === userStore.user?.id)
)

const canManage = computed(
  () =>
    currentMember.value?.role === MemberRole.Owner ||
    currentMember.value?.role === MemberRole.Admin
)

// Modal state
const showSettingsModal = ref(false)
const selectedRepositoryId = ref<number | null>(null)
const isUpdating = ref(false)
const isInitializing = ref(true)

const selectedRepository = computed(() =>
  repositories.value.find((r) => r.id === selectedRepositoryId.value) ?? null
)

// Fetch data
onMounted(async () => {
  try {
    await Promise.all([fetchMembers(), fetchConnection()])

    if (isConnected.value) {
      await fetchRepositories()
    }
  } finally {
    isInitializing.value = false
  }
})

// Watchers
watch(isConnected, async (connected) => {
  if (connected) {
    await fetchRepositories()
  }
})

watch(error, (err) => {
  if (err) {
    toast.error(err)
  }
})

// Actions
function handleManageKeys(repoId: number) {
  selectedRepositoryId.value = repoId
  showSettingsModal.value = true
}

async function handleSaveSettings(data: UpdateRepositoryData) {
  if (!selectedRepositoryId.value) return

  isUpdating.value = true
  try {
    await updateRepository(selectedRepositoryId.value, data)
    showSettingsModal.value = false
    selectedRepositoryId.value = null
    toast.success('Repository settings updated')
  } catch (e) {
    // Error handling handled by useGitHub or globally
  } finally {
    isUpdating.value = false
  }
}

const filteredRepositories = computed(() => {
  return repositories.value
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <div
      v-if="isLoading || isInitializing"
      class="space-y-4"
    >
      <BaseSkeleton class="h-24 w-full rounded-xl" />
      <BaseSkeleton class="h-24 w-full rounded-xl" />
    </div>

    <!-- Not connected state -->
    <BaseCard v-else-if="!isConnected">
      <BaseEmptyState
        icon="lucide:github"
        title="GitHub not connected"
        description="Connect your GitHub account to access repositories and configure API keys."
      >
        <NuxtLink :to="`/${workspaceSlug}/settings/integrations`">
          <BaseButton>
            <Icon
              name="lucide:link"
              class="w-4 h-4 mr-1.5"
            />
            Go to Integrations
          </BaseButton>
        </NuxtLink>
      </BaseEmptyState>
    </BaseCard>

    <!-- Repositories List -->
    <div
      v-else-if="repositories.length > 0"
      class="space-y-4"
    >
      <BaseCard class="!p-0 overflow-hidden">
        <div class="divide-y divide-border-subtle">
          <div
            v-for="repo in filteredRepositories"
            :key="repo.id"
            class="p-4 flex items-center justify-between hover:bg-bg-surface/50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center border border-border-muted">
                <Icon
                  name="lucide:folder-git-2"
                  class="w-5 h-5 text-text-secondary"
                />
              </div>
              <div>
                <div class="text-sm font-medium text-text-primary">
                  {{ repo.full_name }}
                </div>
                <div class="text-xs text-text-muted">
                  {{ repo.auto_review_enabled ? 'Auto-review enabled' : 'Auto-review disabled' }}
                </div>
              </div>
            </div>

            <BaseButton
              variant="secondary"
              size="sm"
              @click="handleManageKeys(repo.id)"
            >
              <Icon
                name="lucide:key"
                class="w-4 h-4 mr-1.5"
              />
              Manage Keys
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Empty Repositories -->
    <BaseCard v-else>
      <BaseEmptyState
        icon="lucide:folder-git-2"
        title="No repositories found"
        description="Sync your repositories to start configuring API keys."
      >
        <NuxtLink :to="`/${workspaceSlug}/repositories`">
          <BaseButton>
            Go to Repositories
          </BaseButton>
        </NuxtLink>
      </BaseEmptyState>
    </BaseCard>

    <!-- Settings Modal -->
    <DomainRepositorySettingsModal
      v-model="showSettingsModal"
      :repository="selectedRepository"
      :is-updating="isUpdating"
      :can-manage="canManage"
      @save="handleSaveSettings"
    />
  </div>
</template>

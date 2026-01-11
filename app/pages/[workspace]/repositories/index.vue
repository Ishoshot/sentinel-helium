<script setup lang="ts">
import type { UpdateRepositoryData } from '~/types'
import { MemberRole } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useMembers } from '~/composables/useMembers'
import { useGitHub } from '~/composables/useGitHub'
import { useStorage } from '@vueuse/core'

/**
 * Repositories page - list and manage GitHub repositories
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const router = useRouter()
const route = useRoute()
const toast = useAppToast()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const workspaceId = computed(() => workspaceStore.currentWorkspaceId)
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug)

// Composables
const { members, fetchMembers } = useMembers(workspaceId)
const {
  repositories,
  isConnected,
  isLoading,
  isSyncing,
  error,
  fetchConnection,
  fetchRepositories,
  syncRepositories,
  updateRepository,
} = useGitHub(workspaceId)

// Check permissions
const currentMember = computed(() =>
  members.value.find((m) => m.user_id === userStore.user?.id)
)

const canManage = computed(
  () =>
    currentMember.value?.role === MemberRole.Owner ||
    currentMember.value?.role === MemberRole.Admin
)

// View mode (list or grid)
type ViewMode = 'list' | 'grid'
const viewMode = useStorage<ViewMode>('sentinel:repositories-view-mode', 'list')
const isInitializing = ref(true)

// Repository settings modal
const showSettingsModal = ref(false)
const selectedRepositoryId = ref<number | null>(null)
const isUpdating = ref(false)
const selectedRepository = computed(() => {
  if (!selectedRepositoryId.value) return null
  return repositories.value.find((r) => r.id === selectedRepositoryId.value) ?? null
})

// Computed
const hasRepositories = computed(() => repositories.value.length > 0)

// Fetch data on mount
onMounted(async () => {
  try {
    await Promise.all([fetchMembers(), fetchConnection()])

    // Only fetch repositories if connected
    if (isConnected.value) {
      await fetchRepositories()
    }
  } finally {
    isInitializing.value = false
  }
})

// Watch for connection changes
watch(isConnected, async (connected) => {
  if (connected) {
    await fetchRepositories()
  }
})

// Watch for errors and show toast
watch(error, (err) => {
  if (err) {
    toast.error(err)
  }
})

// Handle sync
async function handleSync() {
  await syncRepositories()
  if (!error.value) {
    toast.success('Repositories synced successfully')
  }
}

// Handle toggle auto-review
async function handleToggleAutoReview(repositoryId: number) {
  const repo = repositories.value.find((r) => r.id === repositoryId)
  if (!repo) return

  try {
    await updateRepository(repositoryId, {
      auto_review_enabled: !repo.auto_review_enabled,
    })
    toast.success(
      repo.auto_review_enabled
        ? 'Auto-review disabled'
        : 'Auto-review enabled'
    )
  } catch {
    // Error already shown via watcher
  }
}

// Handle open settings
function handleOpenSettings(repositoryId: number) {
  selectedRepositoryId.value = repositoryId
  showSettingsModal.value = true
}

// Handle save settings
async function handleSaveSettings(data: UpdateRepositoryData) {
  if (!selectedRepositoryId.value) return

  isUpdating.value = true
  try {
    await updateRepository(selectedRepositoryId.value, data)
    showSettingsModal.value = false
    selectedRepositoryId.value = null
    toast.success('Repository settings updated')
  } catch {
    // Error already shown via watcher
  } finally {
    isUpdating.value = false
  }
}

// Navigate to integrations
function goToIntegrations() {
  router.push(`/${workspaceSlug.value}/settings/integrations`)
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold text-text-primary">
          Repositories
        </h1>
        <p class="mt-1 text-text-secondary">
          Manage repositories connected to Sentinel
        </p>
      </div>

      <div
        v-if="isConnected"
        class="flex items-center gap-3"
      >
        <!-- View toggle -->
        <div class="flex items-center bg-bg-surface border border-border-subtle rounded-lg p-1">
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-default"
            :class="viewMode === 'list' 
              ? 'bg-bg-elevated text-text-primary shadow-sm' 
              : 'text-text-muted hover:text-text-primary'"
            @click="viewMode = 'list'"
          >
            <Icon
              name="lucide:list"
              class="w-4 h-4"
            />
            List
          </button>
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-default"
            :class="viewMode === 'grid' 
              ? 'bg-bg-elevated text-text-primary shadow-sm' 
              : 'text-text-muted hover:text-text-primary'"
            @click="viewMode = 'grid'"
          >
            <Icon
              name="lucide:grid-2x2"
              class="w-4 h-4"
            />
            Grid
          </button>
        </div>

        <BaseButton
          v-if="canManage"
          variant="secondary"
          :loading="isSyncing"
          @click="handleSync"
        >
          <Icon
            v-if="!isSyncing"
            name="lucide:refresh-cw"
            class="w-4 h-4 mr-1.5"
          />
          Sync from GitHub
        </BaseButton>
      </div>
    </div>

    <!-- Not connected state -->
    <BaseCard v-if="!isConnected && !isLoading && !isInitializing">
      <BaseEmptyState
        icon="lucide:github"
        title="GitHub not connected"
        description="Connect your GitHub account to sync repositories and enable automated code reviews."
      >
        <BaseButton @click="goToIntegrations">
          <Icon
            name="lucide:link"
            class="w-4 h-4 mr-1.5"
          />
          Connect GitHub
        </BaseButton>
      </BaseEmptyState>
    </BaseCard>

    <!-- Loading state -->
    <div
      v-else-if="isLoading || isInitializing"
      class="space-y-4"
    >
      <BaseSkeleton class="h-24 w-full rounded-xl" />
      <BaseSkeleton class="h-24 w-full rounded-xl" />
      <BaseSkeleton class="h-24 w-full rounded-xl" />
    </div>

    <!-- Empty state -->
    <BaseCard v-else-if="!hasRepositories">
      <BaseEmptyState
        icon="lucide:folder-git-2"
        title="No repositories found"
        description="Sentinel doesn't have access to any repositories yet. Make sure you've granted access to repositories when installing the GitHub App."
      >
        <BaseButton
          v-if="canManage"
          :loading="isSyncing"
          @click="handleSync"
        >
          <Icon
            name="lucide:refresh-cw"
            class="w-4 h-4 mr-1.5"
          />
          Sync Repositories
        </BaseButton>
      </BaseEmptyState>
    </BaseCard>

    <!-- Repository list/grid -->
    <template v-else>
      <DomainRepositoryList
        v-if="viewMode === 'list'"
        :repositories="repositories"
        :can-manage="canManage"
        @toggle-auto-review="handleToggleAutoReview"
        @open-settings="handleOpenSettings"
      />
      <DomainRepositoryGrid
        v-else
        :repositories="repositories"
        :can-manage="canManage"
        @toggle-auto-review="handleToggleAutoReview"
        @open-settings="handleOpenSettings"
      />
    </template>

    <!-- Repository settings modal -->
    <DomainRepositorySettingsModal
      v-model="showSettingsModal"
      :repository="selectedRepository"
      :is-updating="isUpdating"
      :can-manage="canManage"
      @save="handleSaveSettings"
    />
  </div>
</template>

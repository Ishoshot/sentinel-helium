<script setup lang="ts">
import type { UpdateRepositoryData } from '~/types'
import { MemberRole } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useStorage } from '@vueuse/core'
import { useAppToast } from '~/composables/shared/useAppToast'
import { useMembers } from '~/composables/members/useMembers'
import { useGitHub } from '~/composables/integrations/useGitHub'
import DomainRepositoriesRepositoryList from '~/components/domain/repositories/RepositoryList.vue'
import DomainRepositoriesRepositoryGrid from '~/components/domain/repositories/RepositoryGrid.vue'
import DomainRepositoriesRepositorySettingsModal from '~/components/domain/repositories/RepositorySettingsModal.vue'

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
  isConnecting,
  isSyncing,
  error,
  fetchConnection,
  fetchRepositories,
  syncRepositories,
  updateRepository,
  connect,
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
  <BaseContainer>
    <!-- Page header -->
    <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-10">
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-text-primary tracking-tight mb-2">
          Repositories
        </h1>
        <p class="text-sm text-text-secondary">
          Manage and configure repositories for automated code reviews
        </p>
      </div>

      <div
        v-if="isConnected"
        class="flex flex-wrap items-center gap-3"
      >
        <!-- View toggle -->
        <div class="flex items-center bg-bg-elevated border border-border-subtle rounded-xl p-1.5 shadow-sm">
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="viewMode === 'list'
              ? 'bg-bg-surface text-text-primary shadow-sm scale-105'
              : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'"
            @click="viewMode = 'list'"
          >
            <Icon
              name="lucide:list"
              class="w-4 h-4"
            />
            <span class="hidden sm:inline">List</span>
          </button>
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="viewMode === 'grid'
              ? 'bg-bg-surface text-text-primary shadow-sm scale-105'
              : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'"
            @click="viewMode = 'grid'"
          >
            <Icon
              name="lucide:grid-2x2"
              class="w-4 h-4"
            />
            <span class="hidden sm:inline">Grid</span>
          </button>
        </div>

        <button
          v-if="canManage"
          type="button"
          class="group relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="isSyncing
            ? 'bg-bg-elevated border border-border-subtle text-text-secondary'
            : 'bg-bg-elevated border border-border-subtle text-text-secondary hover:border-accent hover:text-accent hover:shadow-sm hover:scale-105'"
          :disabled="isSyncing"
          @click="handleSync"
        >
          <Icon
            name="lucide:refresh-cw"
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'animate-spin': isSyncing, 'group-hover:rotate-180': !isSyncing }"
          />
          <span>{{ isSyncing ? 'Syncing...' : 'Sync from GitHub' }}</span>
        </button>

        <button
          v-if="canManage"
          type="button"
          class="group relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-accent text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 hover:bg-accent-hover hover:shadow-sm hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isConnecting"
          @click="connect"
        >
          <Icon
            v-if="isConnecting"
            name="lucide:loader-2"
            class="w-4 h-4 animate-spin"
          />
          <Icon
            v-else
            name="lucide:plus"
            class="w-4 h-4"
          />
          <span>{{ isConnecting ? 'Redirecting...' : 'Add Repositories' }}</span>
        </button>
      </div>
    </div>

    <!-- Not connected state -->
    <div
      v-if="!isConnected && !isLoading && !isInitializing"
      class="flex items-center justify-center py-20"
    >
      <div class="text-center max-w-md">
        <div class="w-20 h-20 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Icon
            name="lucide:github"
            class="w-10 h-10 text-text-muted"
          />
        </div>
        <h3 class="text-2xl font-bold text-text-primary mb-3">
          GitHub not connected
        </h3>
        <p class="text-sm text-text-secondary mb-8 leading-relaxed">
          Connect your GitHub account to sync repositories and enable automated code reviews.
        </p>
        <BaseButton @click="goToIntegrations">
          <Icon
            name="lucide:link"
            class="w-4 h-4 mr-2"
          />
          Connect GitHub
        </BaseButton>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-else-if="isLoading || isInitializing"
      class="space-y-5"
    >
      <BaseSkeleton
        class="h-32 w-full rounded-2xl"
        :class="viewMode === 'grid' ? '' : ''"
      />
      <BaseSkeleton
        class="h-32 w-full rounded-2xl"
        :class="viewMode === 'grid' ? '' : ''"
      />
      <BaseSkeleton
        class="h-32 w-full rounded-2xl"
        :class="viewMode === 'grid' ? '' : ''"
      />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!hasRepositories"
      class="flex items-center justify-center py-20"
    >
      <div class="text-center max-w-md">
        <div class="w-20 h-20 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Icon
            name="lucide:folder-git-2"
            class="w-10 h-10 text-text-muted"
          />
        </div>
        <h3 class="text-2xl font-bold text-text-primary mb-3">
          No repositories found
        </h3>
        <p class="text-sm text-text-secondary mb-8 leading-relaxed">
          Sentinel doesn't have access to any repositories yet. Make sure you've granted access to repositories when installing the GitHub App.
        </p>
        <button
          v-if="canManage"
          type="button"
          class="group relative inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl bg-accent text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover hover:shadow-lg hover:scale-105"
          :disabled="isSyncing"
          @click="handleSync"
        >
          <Icon
            name="lucide:refresh-cw"
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'animate-spin': isSyncing, 'group-hover:rotate-180': !isSyncing }"
          />
          <span>{{ isSyncing ? 'Syncing...' : 'Sync Repositories' }}</span>
        </button>
      </div>
    </div>

    <!-- Repository list/grid -->
    <template v-else>
      <DomainRepositoriesRepositoryList
        v-if="viewMode === 'list'"
        :repositories="repositories"
        :can-manage="canManage"
        @toggle-auto-review="handleToggleAutoReview"
        @open-settings="handleOpenSettings"
      />
      <DomainRepositoriesRepositoryGrid
        v-else
        :repositories="repositories"
        :can-manage="canManage"
        @toggle-auto-review="handleToggleAutoReview"
        @open-settings="handleOpenSettings"
      />
    </template>

    <!-- Repository settings modal -->
    <DomainRepositoriesRepositorySettingsModal
      v-model="showSettingsModal"
      :repository="selectedRepository"
      :is-updating="isUpdating"
      :can-manage="canManage"
      @save="handleSaveSettings"
    />
  </BaseContainer>
</template>

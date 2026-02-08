<script setup lang="ts">
import type { UpdateRepositoryData } from '~/types'
import { MemberRole } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useStorage } from '@vueuse/core'
import { useAppToast } from '~/composables/shared/useAppToast'
import { useMembers } from '~/composables/members/useMembers'
import { useGitHub } from '~/composables/integrations/useGitHub'
import { useWebSocket } from '~/composables/useWebSocket'
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
const toast = useAppToast()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const workspaceId = computed(() => workspaceStore.currentWorkspaceId)
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug)

// Composables
const { members, fetchMembers } = useMembers(workspaceId)
const {
  repositories,
  pagination,
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

// WebSocket for config PR events
const { subscribeToRepositories, unsubscribeFromRepositories } = useWebSocket(workspaceId)

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

// Search
const searchQuery = ref('')
const filteredRepositories = computed(() => {
  if (!searchQuery.value.trim()) return repositories.value
  const q = searchQuery.value.toLowerCase()
  return repositories.value.filter(r =>
    r.full_name.toLowerCase().includes(q) ||
    r.description?.toLowerCase().includes(q) ||
    r.language?.toLowerCase().includes(q)
  )
})

// Repository settings modal
const showSettingsModal = ref(false)
const selectedRepositoryId = ref<number | null>(null)
const isUpdating = ref(false)
const selectedRepository = computed(() => {
  if (!selectedRepositoryId.value) return null
  return repositories.value.find((r) => r.id === selectedRepositoryId.value) ?? null
})

// Stats
const activeCount = computed(() => repositories.value.filter(r => r.auto_review_enabled).length)
const hasRepositories = computed(() => repositories.value.length > 0)

// Fetch data on mount
onMounted(async () => {
  try {
    await Promise.all([fetchMembers(), fetchConnection()])
    if (isConnected.value) {
      await fetchRepositories()
    }
  } finally {
    isInitializing.value = false
  }

  // Subscribe to WebSocket for config PR events
  subscribeToRepositories({
    onConfigPrCreated: (event) => {
      const opened = window.open(event.pr_url, '_blank', 'noopener,noreferrer')
      if (!opened) {
        toast.info({
          title: 'Config branch ready!',
          action: {
            label: 'Open',
            onClick: () => window.open(event.pr_url, '_blank', 'noopener,noreferrer'),
          },
        })
      } else {
        toast.success(`Config branch ready for ${event.repository_name}`)
      }
    },
  })
})

// Cleanup WebSocket subscription on unmount
onUnmounted(() => {
  unsubscribeFromRepositories()
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
    toast.success('Repositories synced')
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
    toast.success('Settings updated')
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
  <BaseContainer class="space-y-8">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-text-primary">
          Repositories
        </h1>
        <p class="mt-1 text-sm text-text-muted">
          {{ pagination.total }} {{ pagination.total === 1 ? 'repository' : 'repositories' }}
          <template v-if="activeCount > 0">
            · {{ activeCount }} with auto-review
          </template>
        </p>
      </div>

      <div
        v-if="isConnected && hasRepositories"
        class="flex items-center gap-3"
      >
        <button
          v-if="canManage"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-hover disabled:opacity-50"
          :disabled="isSyncing"
          @click="handleSync"
        >
          <Icon
            name="lucide:refresh-cw"
            class="size-4"
            :class="{ 'animate-spin': isSyncing }"
          />
          {{ isSyncing ? 'Syncing...' : 'Sync' }}
        </button>

        <button
          v-if="canManage"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-teal-600 px-4 py-2 text-sm font-medium text-white hover:shadow-glow disabled:opacity-50"
          :disabled="isConnecting"
          @click="connect"
        >
          <Icon
            v-if="isConnecting"
            name="lucide:loader-2"
            class="size-4 animate-spin"
          />
          <Icon
            v-else
            name="lucide:plus"
            class="size-4"
          />
          Add
        </button>
      </div>
    </div>

    <!-- Not connected state -->
    <div
      v-if="!isConnected && !isLoading && !isInitializing"
      class="py-16 text-center"
    >
      <div class="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-bg-surface">
        <Icon
          name="lucide:github"
          class="size-8 text-text-muted"
        />
      </div>
      <h3 class="text-lg font-semibold text-text-primary">
        GitHub not connected
      </h3>
      <p class="mx-auto mt-2 max-w-sm text-sm text-text-muted">
        Connect your GitHub account to sync repositories and enable automated code reviews.
      </p>
      <button
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-teal-600 px-4 py-2 text-sm font-medium text-white hover:shadow-glow"
        @click="goToIntegrations"
      >
        <Icon
          name="lucide:link"
          class="size-4"
        />
        Connect GitHub
      </button>
    </div>

    <!-- Loading state -->
    <div
      v-else-if="isLoading || isInitializing"
      class="space-y-3"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="flex items-center gap-4 rounded-lg border border-border-subtle bg-bg-elevated p-4"
      >
        <BaseSkeleton class="size-10 rounded-lg" />
        <div class="flex-1 space-y-2">
          <BaseSkeleton class="h-4 w-48" />
          <BaseSkeleton class="h-3 w-72" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!hasRepositories"
      class="py-16 text-center"
    >
      <div class="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-bg-surface">
        <Icon
          name="lucide:folder-git-2"
          class="size-8 text-text-muted"
        />
      </div>
      <h3 class="text-lg font-semibold text-text-primary">
        No repositories
      </h3>
      <p class="mx-auto mt-2 max-w-sm text-sm text-text-muted">
        Grant Sentinel access to repositories when installing the GitHub App.
      </p>
      <button
        v-if="canManage"
        type="button"
        class="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-teal-600 px-4 py-2 text-sm font-medium text-white hover:shadow-glow disabled:opacity-50"
        :disabled="isSyncing"
        @click="handleSync"
      >
        <Icon
          name="lucide:refresh-cw"
          class="size-4"
          :class="{ 'animate-spin': isSyncing }"
        />
        {{ isSyncing ? 'Syncing...' : 'Sync Repositories' }}
      </button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Toolbar -->
      <div class="flex items-center justify-between gap-4">
        <!-- Search -->
        <div class="relative max-w-sm flex-1">
          <Icon
            name="lucide:search"
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search repositories..."
            class="w-full rounded-lg border border-border-subtle bg-bg-elevated py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-border-muted focus:outline-none focus:ring-0"
          >
          <button
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            @click="searchQuery = ''"
          >
            <Icon
              name="lucide:x"
              class="size-4"
            />
          </button>
        </div>

        <!-- View toggle -->
        <div class="flex items-center gap-1 rounded-lg border border-border-subtle bg-bg-elevated p-1">
          <button
            class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            :class="viewMode === 'list'
              ? 'bg-accent text-white'
              : 'text-text-muted hover:text-text-secondary'"
            @click="viewMode = 'list'"
          >
            <Icon
              name="lucide:list"
              class="size-4"
            />
          </button>
          <button
            class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            :class="viewMode === 'grid'
              ? 'bg-accent text-white'
              : 'text-text-muted hover:text-text-secondary'"
            @click="viewMode = 'grid'"
          >
            <Icon
              name="lucide:grid-2x2"
              class="size-4"
            />
          </button>
        </div>
      </div>

      <!-- No search results -->
      <div
        v-if="searchQuery && filteredRepositories.length === 0"
        class="py-12 text-center"
      >
        <p class="text-sm text-text-muted">
          No repositories match "{{ searchQuery }}"
        </p>
        <button
          class="mt-2 text-sm text-accent underline underline-offset-2"
          @click="searchQuery = ''"
        >
          Clear search
        </button>
      </div>

      <!-- Repository list/grid -->
      <template v-else>
        <DomainRepositoriesRepositoryList
          v-if="viewMode === 'list'"
          :repositories="filteredRepositories"
          :can-manage="canManage"
          @toggle-auto-review="handleToggleAutoReview"
          @open-settings="handleOpenSettings"
        />
        <DomainRepositoriesRepositoryGrid
          v-else
          :repositories="filteredRepositories"
          :can-manage="canManage"
          @toggle-auto-review="handleToggleAutoReview"
          @open-settings="handleOpenSettings"
        />

        <!-- Pagination -->
        <DomainReviewsRunsPagination
          :current-page="pagination.currentPage"
          :last-page="pagination.lastPage"
          :from="pagination.from"
          :to="pagination.to"
          :total="pagination.total"
          item-type="repositories"
          @load-page="fetchRepositories"
        />
      </template>
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

<style scoped>
.hover\:shadow-glow:hover {
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.4);
}
</style>

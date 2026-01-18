<script setup lang="ts">
import { MemberRole, type UpdateRepositoryData } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useAppToast } from '~/composables/shared/useAppToast'
import { useMembers } from '~/composables/members/useMembers'
import { useGitHub } from '~/composables/integrations/useGitHub'
import DomainRepositoriesRepositorySettingsModal from '~/components/domain/repositories/RepositorySettingsModal.vue'

/**
 * API Keys page - Manage provider keys for repositories
 * State-of-the-art BYOK management interface
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

// Search state
const searchQuery = ref('')

const selectedRepository = computed(() =>
  repositories.value.find((r) => r.id === selectedRepositoryId.value) ?? null
)

const filteredRepositories = computed(() => {
  if (!searchQuery.value.trim()) {
    return repositories.value
  }
  const query = searchQuery.value.toLowerCase()
  return repositories.value.filter((repo) =>
    repo.full_name.toLowerCase().includes(query)
  )
})

// Stats
const stats = computed(() => {
  const total = repositories.value.length
  const autoReviewEnabled = repositories.value.filter((r) => r.auto_review_enabled).length
  return { total, autoReviewEnabled }
})

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
</script>

<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated">
      <!-- Background decorations -->
      <div class="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br from-accent/20 to-violet-500/10 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/5 blur-2xl" />

      <div class="relative p-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-2xl">
            <div class="mb-4 flex items-center gap-3">
              <div class="flex size-12 items-center justify-center rounded-2xl bg-accent/10">
                <Icon name="lucide:key" class="size-6 text-accent" />
              </div>
              <div>
                <h1 class="text-2xl font-bold text-text-primary">API Keys</h1>
                <p class="text-sm text-text-muted">Bring Your Own Keys (BYOK)</p>
              </div>
            </div>
            <p class="text-sm leading-relaxed text-text-secondary">
              Configure your own AI provider API keys for each repository. Your keys are encrypted and stored securely.
              Using your own keys gives you full control over costs and usage limits.
            </p>
          </div>

          <!-- Stats Cards (only show when connected and has repos) -->
          <div
            v-if="isConnected && repositories.length > 0"
            class="flex gap-3"
          >
            <div class="rounded-xl border border-border-subtle/50 bg-bg-elevated/80 px-5 py-4 backdrop-blur-sm">
              <p class="text-2xl font-bold text-text-primary">{{ stats.total }}</p>
              <p class="text-xs text-text-muted">Repositories</p>
            </div>
            <div class="rounded-xl border border-border-subtle/50 bg-bg-elevated/80 px-5 py-4 backdrop-blur-sm">
              <p class="text-2xl font-bold text-text-primary">{{ stats.autoReviewEnabled }}</p>
              <p class="text-xs text-text-muted">Auto-Review On</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading state -->
    <div
      v-if="isLoading || isInitializing"
      class="space-y-4"
    >
      <BaseSkeleton class="h-20 w-full rounded-xl" />
      <BaseSkeleton class="h-20 w-full rounded-xl" />
      <BaseSkeleton class="h-20 w-full rounded-xl" />
    </div>

    <!-- Not connected state -->
    <div
      v-else-if="!isConnected"
      class="rounded-2xl border border-border-subtle bg-bg-elevated p-12"
    >
      <div class="mx-auto max-w-md text-center">
        <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-bg-surface">
          <Icon name="lucide:github" class="size-10 text-text-muted" />
        </div>
        <h2 class="mb-2 text-xl font-semibold text-text-primary">GitHub not connected</h2>
        <p class="mb-6 text-sm text-text-muted">
          Connect your GitHub account to access repositories and configure API keys.
        </p>
        <NuxtLink :to="`/${workspaceSlug}/settings/integrations`">
          <BaseButton>
            <Icon name="lucide:link" class="size-4" />
            Go to Integrations
          </BaseButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Repositories List -->
    <template v-else-if="repositories.length > 0">
      <!-- Search and Filter Bar -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative w-full sm:w-80">
          <Icon
            name="lucide:search"
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search repositories..."
            class="w-full rounded-xl border border-border-subtle bg-bg-elevated py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <p class="text-sm text-text-muted">
          {{ filteredRepositories.length }} of {{ repositories.length }} repositories
        </p>
      </div>

      <!-- Repository Cards -->
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="repo in filteredRepositories"
          :key="repo.id"
          class="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated p-5 transition-all duration-200 hover:border-border-muted hover:shadow-elevated"
        >
          <!-- Status indicator bar -->
          <div
            class="absolute inset-x-0 top-0 h-1"
            :class="repo.auto_review_enabled ? 'bg-gradient-to-r from-accent to-blue-400' : 'bg-gradient-to-r from-border-muted to-border-subtle'"
          />

          <div class="flex flex-col gap-4">
            <!-- Header -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface">
                  <Icon name="lucide:folder-git-2" class="size-5 text-text-secondary" />
                </div>
                <div class="min-w-0">
                  <h3 class="truncate text-sm font-semibold text-text-primary">
                    {{ repo.name }}
                  </h3>
                  <p class="truncate text-xs text-text-muted">
                    {{ repo.full_name }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="flex flex-wrap gap-2">
              <div
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                :class="repo.auto_review_enabled
                  ? 'bg-accent-light text-accent'
                  : 'bg-bg-surface text-text-muted'"
              >
                <Icon
                  :name="repo.auto_review_enabled ? 'lucide:zap' : 'lucide:zap-off'"
                  class="size-3"
                />
                {{ repo.auto_review_enabled ? 'Auto-review on' : 'Auto-review off' }}
              </div>
            </div>

            <!-- Action -->
            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-all duration-200 hover:border-accent hover:bg-accent hover:text-white"
              @click="handleManageKeys(repo.id)"
            >
              <Icon name="lucide:settings-2" class="size-4" />
              Configure
            </button>
          </div>
        </div>
      </div>

      <!-- No search results -->
      <div
        v-if="filteredRepositories.length === 0 && searchQuery"
        class="rounded-2xl border border-border-subtle bg-bg-elevated p-12 text-center"
      >
        <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-bg-surface">
          <Icon name="lucide:search-x" class="size-6 text-text-muted" />
        </div>
        <h3 class="mb-1 text-sm font-medium text-text-primary">No repositories found</h3>
        <p class="text-sm text-text-muted">
          Try adjusting your search query
        </p>
      </div>
    </template>

    <!-- Empty Repositories -->
    <div
      v-else
      class="rounded-2xl border border-border-subtle bg-bg-elevated p-12"
    >
      <div class="mx-auto max-w-md text-center">
        <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-bg-surface">
          <Icon name="lucide:folder-git-2" class="size-10 text-text-muted" />
        </div>
        <h2 class="mb-2 text-xl font-semibold text-text-primary">No repositories found</h2>
        <p class="mb-6 text-sm text-text-muted">
          Sync your repositories to start configuring API keys for automated code reviews.
        </p>
        <NuxtLink :to="`/${workspaceSlug}/repositories`">
          <BaseButton>
            <Icon name="lucide:refresh-cw" class="size-4" />
            Go to Repositories
          </BaseButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Settings Modal -->
    <DomainRepositoriesRepositorySettingsModal
      v-model="showSettingsModal"
      :repository="selectedRepository"
      :is-updating="isUpdating"
      :can-manage="canManage"
      @save="handleSaveSettings"
    />
  </div>
</template>

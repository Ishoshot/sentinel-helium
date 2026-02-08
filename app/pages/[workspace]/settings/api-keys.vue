<script setup lang="ts">
import { MemberRole, type UpdateRepositoryData } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useAppToast } from '~/composables/shared/useAppToast'
import { useMembers } from '~/composables/members/useMembers'
import { useGitHub } from '~/composables/integrations/useGitHub'
import DomainRepositoriesRepositorySettingsModal from '~/components/domain/repositories/RepositorySettingsModal.vue'

/**
 * API Keys page - BYOK management with developer console aesthetic
 * Premium, technical interface for managing provider keys
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const toast = useAppToast()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const workspaceId = computed(() => workspaceStore.currentWorkspaceId)
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug)

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

const currentMember = computed(() =>
  members.value.find((m) => m.user_id === userStore.user?.id)
)

const canManage = computed(
  () =>
    currentMember.value?.role === MemberRole.Owner ||
    currentMember.value?.role === MemberRole.Admin
)

const showSettingsModal = ref(false)
const selectedRepositoryId = ref<number | null>(null)
const isUpdating = ref(false)
const isInitializing = ref(true)
const isPageReady = ref(false)
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

const stats = computed(() => {
  const total = repositories.value.length
  const withCustomKeys = repositories.value.filter((r) => r.byok_provider).length
  const autoReviewEnabled = repositories.value.filter((r) => r.auto_review_enabled).length
  return { total, withCustomKeys, autoReviewEnabled }
})

onMounted(async () => {
  try {
    await Promise.all([fetchMembers(), fetchConnection()])
    if (isConnected.value) {
      await fetchRepositories()
    }
  } finally {
    isInitializing.value = false
    setTimeout(() => {
      isPageReady.value = true
    }, 50)
  }
})

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
    // Error handling handled by useGitHub
  } finally {
    isUpdating.value = false
  }
}

function getProviderLabel(provider: string | null) {
  if (!provider) return null
  const labels: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
  }
  return labels[provider] || provider
}
</script>

<template>
  <div class="api-keys-page">
    <!-- Loading State -->
    <div
      v-if="isInitializing"
      class="space-y-6"
    >
      <BaseSkeleton class="h-56 w-full rounded-3xl" />
      <BaseSkeleton class="h-12 w-full rounded-xl" />
      <BaseSkeleton class="h-64 w-full rounded-2xl" />
    </div>

    <!-- Content -->
    <div
      v-else
      class="space-y-8"
    >
      <!-- Hero Section -->
      <section
        class="hero-section relative overflow-hidden rounded-3xl transition-all duration-700 ease-out"
        :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <!-- Dark gradient background -->
        <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        <!-- Code pattern overlay -->
        <div
          class="absolute inset-0 opacity-[0.03]"
          style="background-image: url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 20h40v1H0zM20 0v40h1V0z\'/%3E%3C/g%3E%3C/svg%3E');"
        />

        <!-- Content -->
        <div class="relative z-10 p-8 lg:p-10">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <!-- Left: Info -->
            <div class="max-w-xl">
              <div class="mb-5 flex items-center gap-4">
                <div class="flex size-14 items-center justify-center rounded-2xl bg-white/10">
                  <Icon
                    name="lucide:key-round"
                    class="size-7 text-white"
                  />
                </div>
                <div>
                  <h1 class="text-3xl font-bold tracking-tight text-white">
                    API Keys
                  </h1>
                  <p class="text-sm text-white/50">
                    Bring Your Own Keys (BYOK)
                  </p>
                </div>
              </div>
              <p class="text-sm leading-relaxed text-white/70">
                Configure your own AI provider API keys for each repository. Your keys are encrypted
                at rest and give you full control over costs and rate limits.
              </p>
            </div>

            <!-- Right: Stats (only when connected with repos) -->
            <div
              v-if="isConnected && repositories.length > 0"
              class="flex gap-4"
            >
              <div class="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                <p class="text-3xl font-bold text-white">
                  {{ stats.total }}
                </p>
                <p class="text-xs text-white/40">
                  Repositories
                </p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                <p class="text-3xl font-bold text-white">
                  {{ stats.withCustomKeys }}
                </p>
                <p class="text-xs text-white/40">
                  With BYOK
                </p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
                <p class="text-3xl font-bold text-emerald-400">
                  {{ stats.autoReviewEnabled }}
                </p>
                <p class="text-xs text-white/40">
                  Auto-Review
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Loading repositories -->
      <div
        v-if="isLoading"
        class="space-y-4"
      >
        <BaseSkeleton class="h-16 w-full rounded-xl" />
        <BaseSkeleton class="h-16 w-full rounded-xl" />
        <BaseSkeleton class="h-16 w-full rounded-xl" />
      </div>

      <!-- Not connected state -->
      <section
        v-else-if="!isConnected"
        class="transition-all delay-100 duration-700 ease-out"
        :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <div class="rounded-2xl border border-border-subtle bg-bg-elevated p-12">
          <div class="mx-auto max-w-sm text-center">
            <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-bg-surface">
              <Icon
                name="lucide:github"
                class="size-10 text-text-muted"
              />
            </div>
            <h2 class="mb-2 text-xl font-bold text-text-primary">
              Connect GitHub
            </h2>
            <p class="mb-6 text-sm text-text-muted">
              Link your GitHub account to access repositories and configure custom API keys.
            </p>
            <NuxtLink :to="`/${workspaceSlug}/settings/integrations`">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-glow active:scale-[0.98]"
              >
                <Icon
                  name="lucide:link"
                  class="size-4"
                />
                Go to Integrations
              </button>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Repositories List -->
      <template v-else-if="repositories.length > 0">
        <!-- Search Bar -->
        <section
          class="transition-all delay-100 duration-700 ease-out"
          :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="relative w-full sm:w-96">
              <Icon
                name="lucide:search"
                class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-muted"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search repositories..."
                class="w-full rounded-xl border border-border-subtle bg-bg-elevated py-3 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted transition-all duration-200 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
              >
            </div>
            <p class="text-sm text-text-muted">
              Showing <span class="font-medium text-text-primary">{{ filteredRepositories.length }}</span> of {{ repositories.length }}
            </p>
          </div>
        </section>

        <!-- Repository Table -->
        <section
          class="transition-all delay-150 duration-700 ease-out"
          :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          <div class="overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated">
            <!-- Table Header -->
            <div class="hidden border-b border-border-subtle bg-bg-surface/50 px-6 py-3 sm:grid sm:grid-cols-12 sm:gap-4">
              <div class="col-span-5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Repository
              </div>
              <div class="col-span-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Provider
              </div>
              <div class="col-span-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Model
              </div>
              <div class="col-span-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Status
              </div>
              <div class="col-span-1" />
            </div>

            <!-- Table Body -->
            <div class="divide-y divide-border-subtle">
              <div
                v-for="(repo, index) in filteredRepositories"
                :key="repo.id"
                class="group px-6 py-4 transition-colors hover:bg-bg-surface/30 sm:grid sm:grid-cols-12 sm:items-center sm:gap-4"
                :style="{ animationDelay: `${index * 30}ms` }"
              >
                <!-- Repository -->
                <div class="col-span-5 mb-3 flex items-center gap-3 sm:mb-0">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bg-surface">
                    <Icon
                      name="lucide:folder-git-2"
                      class="size-5 text-text-muted"
                    />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-text-primary">
                      {{ repo.name }}
                    </p>
                    <p class="truncate text-xs text-text-muted">
                      {{ repo.full_name.split('/')[0] }}
                    </p>
                  </div>
                </div>

                <!-- Provider -->
                <div class="col-span-2 mb-2 sm:mb-0">
                  <div
                    v-if="repo.byok_provider"
                    class="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
                  >
                    <Icon
                      name="lucide:key"
                      class="size-3"
                    />
                    {{ getProviderLabel(repo.byok_provider) }}
                  </div>
                  <span
                    v-else
                    class="text-xs text-text-muted"
                  >
                    Default
                  </span>
                </div>

                <!-- Model -->
                <div class="col-span-2 mb-2 sm:mb-0">
                  <span
                    v-if="repo.byok_model"
                    class="font-mono text-xs text-text-secondary"
                  >
                    {{ repo.byok_model }}
                  </span>
                  <span
                    v-else
                    class="text-xs text-text-muted"
                  >
                    —
                  </span>
                </div>

                <!-- Status -->
                <div class="col-span-2 mb-3 sm:mb-0">
                  <div
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="repo.auto_review_enabled
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-bg-surface text-text-muted'"
                  >
                    <span
                      class="size-1.5 rounded-full"
                      :class="repo.auto_review_enabled ? 'bg-emerald-400' : 'bg-text-muted'"
                    />
                    {{ repo.auto_review_enabled ? 'Active' : 'Inactive' }}
                  </div>
                </div>

                <!-- Action -->
                <div class="col-span-1 flex justify-end">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary"
                    @click="handleManageKeys(repo.id)"
                  >
                    <Icon
                      name="lucide:settings-2"
                      class="size-4"
                    />
                    <span class="hidden sm:inline">Configure</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- No search results -->
            <div
              v-if="filteredRepositories.length === 0 && searchQuery"
              class="px-6 py-12 text-center"
            >
              <Icon
                name="lucide:search-x"
                class="mx-auto mb-3 size-8 text-text-muted/50"
              />
              <p class="text-sm font-medium text-text-primary">
                No repositories found
              </p>
              <p class="mt-1 text-xs text-text-muted">
                Try a different search term
              </p>
            </div>
          </div>
        </section>
      </template>

      <!-- Empty Repositories -->
      <section
        v-else
        class="transition-all delay-100 duration-700 ease-out"
        :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <div class="rounded-2xl border border-border-subtle bg-bg-elevated p-12">
          <div class="mx-auto max-w-sm text-center">
            <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-bg-surface">
              <Icon
                name="lucide:folder-git-2"
                class="size-10 text-text-muted"
              />
            </div>
            <h2 class="mb-2 text-xl font-bold text-text-primary">
              No repositories yet
            </h2>
            <p class="mb-6 text-sm text-text-muted">
              Sync your repositories to start configuring custom API keys for automated reviews.
            </p>
            <NuxtLink :to="`/${workspaceSlug}/repositories`">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-glow active:scale-[0.98]"
              >
                <Icon
                  name="lucide:folder-sync"
                  class="size-4"
                />
                Go to Repositories
              </button>
            </NuxtLink>
          </div>
        </div>
      </section>
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

<style scoped>
.divide-y > div {
  animation: row-enter 0.4s ease-out both;
}

@keyframes row-enter {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hover\:shadow-glow:hover {
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.4);
}
</style>

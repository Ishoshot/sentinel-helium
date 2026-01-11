<script setup lang="ts">
import { useRuns, type WorkspaceRunsParams } from '~/composables/useRuns'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useGitHubService } from '~/services/githubService'
import type { Repository } from '~/types'

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const workspaceStore = useWorkspaceStore()
const githubService = useGitHubService()

const workspaceId = computed(() => workspaceStore.currentWorkspaceId)
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug ?? '')

// Composables
const { runs, isLoading, error, fetchWorkspaceRuns, pagination } = useRuns(workspaceId)

// State for repositories (for filter dropdown)
const repositories = ref<Repository[]>([])
const isLoadingRepos = ref(false)

// Filter state
const search = ref('')
const statusFilter = ref<string | null>(null)
const riskFilter = ref<string | null>(null)
const repositoryFilter = ref<number | null>(null)
const authorFilter = ref<string | null>(null)
const dateRange = ref<{ from: string | null; to: string | null }>({ from: null, to: null })
const sortOrder = ref<'asc' | 'desc'>('desc')
const sortBy = ref<'created_at' | 'completed_at' | 'findings_count'>('created_at')

// Debounced search
const debouncedSearch = refDebounced(search, 300)

// Load repositories for filter
const fetchRepositories = async () => {
  if (!workspaceId.value) return
  isLoadingRepos.value = true
  try {
    repositories.value = await githubService.listRepositories(workspaceId.value)
  } catch (e) {
    console.error('Failed to load repositories', e)
  } finally {
    isLoadingRepos.value = false
  }
}

// Build query params
const queryParams = computed<WorkspaceRunsParams>(() => ({
  page: 1,
  search: debouncedSearch.value || undefined,
  status: statusFilter.value || undefined,
  riskLevel: riskFilter.value || undefined,
  repositoryId: repositoryFilter.value || undefined,
  author: authorFilter.value || undefined,
  fromDate: dateRange.value.from || undefined,
  toDate: dateRange.value.to || undefined,
  sortBy: sortBy.value,
  sortOrder: sortOrder.value,
}))

// Fetch runs when params change
watch(queryParams, async (params) => {
  await fetchWorkspaceRuns(params)
}, { immediate: false })

// Initial fetch
onMounted(async () => {
  if (workspaceId.value) {
    await Promise.all([
      fetchWorkspaceRuns(queryParams.value),
      fetchRepositories()
    ])
  }
})

// Filter handlers
const handleStatusChange = (value: string | null) => statusFilter.value = value
const handleRiskChange = (value: string | null) => riskFilter.value = value
const handleRepositoryChange = (value: number | null) => repositoryFilter.value = value

const clearFilters = () => {
  search.value = ''
  statusFilter.value = null
  riskFilter.value = null
  repositoryFilter.value = null
  authorFilter.value = null
  dateRange.value = { from: null, to: null }
}

// Pagination
const loadPage = async (page: number) => {
  await fetchWorkspaceRuns({ ...queryParams.value, page })
}

// Check if any filters are active
const hasActiveFilters = computed(() => 
  search.value || statusFilter.value || riskFilter.value || 
  repositoryFilter.value || authorFilter.value || dateRange.value.from
)

// Options for dropdowns
const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Queued', value: 'queued' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Skipped', value: 'skipped' }
]

const riskOptions = [
  { label: 'All Risks', value: null },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
]

const repositoryOptions = computed(() => [
  { label: 'All Repositories', value: null },
  ...repositories.value.map(r => ({ label: r.full_name, value: r.id }))
])

const sortOptions = [
  { label: 'Newest First', value: 'created_at-desc' },
  { label: 'Oldest First', value: 'created_at-asc' },
  { label: 'Most Findings', value: 'findings_count-desc' },
  { label: 'Least Findings', value: 'findings_count-asc' },
]

const currentSort = computed({
  get: () => `${sortBy.value}-${sortOrder.value}`,
  set: (val) => {
    const [field, order] = val.split('-') as [typeof sortBy.value, typeof sortOrder.value]
    sortBy.value = field
    sortOrder.value = order
  }
})
</script>

<template>
  <div class="h-[calc(100vh-64px)] flex flex-col">
    <!-- Header -->
    <div class="px-8 py-6 border-b border-border-subtle bg-bg-app shrink-0">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-text-primary">
            Code Reviews
          </h1>
          <p class="mt-1 text-text-secondary">
            All review runs across your repositories
          </p>
        </div>
        <div class="flex items-center gap-3">
          <BaseButton
            variant="secondary"
            @click="fetchWorkspaceRuns(queryParams)"
          >
            <Icon
              name="lucide:refresh-cw"
              class="w-4 h-4 mr-2"
              :class="{ 'animate-spin': isLoading }"
            />
            Refresh
          </BaseButton>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="relative w-64">
          <Icon
            name="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
          />
          <input
            v-model="search"
            type="text"
            placeholder="Search reviews..."
            class="w-full h-9 pl-9 pr-3 text-sm bg-bg-surface border border-border-subtle rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent placeholder:text-text-muted transition-all"
          >
        </div>

        <div class="h-6 w-px bg-border-subtle mx-1" />

        <!-- Status Filter -->
        <BaseDropdown
          :model-value="statusFilter"
          :options="statusOptions"
          placeholder="Status"
          class="w-40"
          @update:model-value="handleStatusChange"
        >
          <template #trigger>
            <button class="h-9 px-3 flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-md text-sm hover:border-border-muted transition-colors w-full justify-between">
              <span class="truncate">{{ statusOptions.find(o => o.value === statusFilter)?.label || 'Status' }}</span>
              <Icon
                name="lucide:chevron-down"
                class="w-4 h-4 text-text-muted"
              />
            </button>
          </template>
        </BaseDropdown>

        <!-- Risk Filter -->
        <BaseDropdown
          :model-value="riskFilter"
          :options="riskOptions"
          placeholder="Risk Level"
          class="w-40"
          @update:model-value="handleRiskChange"
        >
          <template #trigger>
            <button class="h-9 px-3 flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-md text-sm hover:border-border-muted transition-colors w-full justify-between">
              <span class="truncate">{{ riskOptions.find(o => o.value === riskFilter)?.label || 'Risk Level' }}</span>
              <Icon
                name="lucide:chevron-down"
                class="w-4 h-4 text-text-muted"
              />
            </button>
          </template>
        </BaseDropdown>

        <!-- Repository Filter -->
        <BaseDropdown
          :model-value="repositoryFilter"
          :options="repositoryOptions"
          placeholder="Repository"
          class="w-48"
          searchable
          @update:model-value="handleRepositoryChange"
        >
          <template #trigger>
            <button class="h-9 px-3 flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-md text-sm hover:border-border-muted transition-colors w-full justify-between">
              <span class="truncate">{{ repositoryOptions.find(o => o.value === repositoryFilter)?.label || 'Repository' }}</span>
              <Icon
                name="lucide:chevron-down"
                class="w-4 h-4 text-text-muted"
              />
            </button>
          </template>
        </BaseDropdown>

        <!-- Author Filter -->
        <BaseDropdown
          :model-value="null"
          :options="[]"
          placeholder="Author"
          class="w-40"
        >
          <template #trigger>
            <button class="h-9 px-3 flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-md text-sm hover:border-border-muted transition-colors w-full justify-between">
              <span class="truncate">{{ authorFilter || 'Author' }}</span>
              <Icon
                name="lucide:user"
                class="w-4 h-4 text-text-muted"
              />
            </button>
          </template>
          
          <div class="p-3 w-56">
            <div class="space-y-2">
              <label class="text-xs font-medium text-text-secondary">Filter by Author</label>
              <input 
                v-model.lazy="authorFilter"
                type="text"
                placeholder="Username (e.g. octocat)"
                class="w-full h-8 px-2 text-sm bg-bg-surface border border-border-subtle rounded focus:outline-none focus:border-accent"
                @keydown.enter="($event.target as HTMLInputElement).blur()"
              >
              <p class="text-[10px] text-text-muted">
                Press Enter to apply
              </p>
            </div>
            <div class="pt-2 mt-2 border-t border-border-subtle flex justify-end">
              <button 
                class="text-xs text-accent hover:text-accent-hover font-medium"
                @click="authorFilter = null"
              >
                Clear
              </button>
            </div>
          </div>
        </BaseDropdown>

        <!-- Date Filter -->
        <BaseDropdown
          :model-value="null"
          :options="[]"
          placeholder="Date Range"
          class="w-48"
        >
          <template #trigger>
            <button class="h-9 px-3 flex items-center gap-2 bg-bg-surface border border-border-subtle rounded-md text-sm hover:border-border-muted transition-colors w-full justify-between">
              <span class="truncate">
                {{ dateRange.from ? (dateRange.to ? `${dateRange.from} - ${dateRange.to}` : `From ${dateRange.from}`) : 'Date Range' }}
              </span>
              <Icon
                name="lucide:calendar"
                class="w-4 h-4 text-text-muted"
              />
            </button>
          </template>
          
          <div class="p-3 space-y-3 w-64">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-text-secondary">From</label>
              <input 
                v-model="dateRange.from"
                type="date"
                class="w-full h-8 px-2 text-sm bg-bg-surface border border-border-subtle rounded focus:outline-none focus:border-accent"
              >
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-text-secondary">To</label>
              <input 
                v-model="dateRange.to"
                type="date"
                class="w-full h-8 px-2 text-sm bg-bg-surface border border-border-subtle rounded focus:outline-none focus:border-accent"
                :min="dateRange.from || undefined"
              >
            </div>
            <div class="pt-2 border-t border-border-subtle flex justify-end">
              <button 
                class="text-xs text-accent hover:text-accent-hover font-medium"
                @click="dateRange = { from: null, to: null }"
              >
                Clear
              </button>
            </div>
          </div>
        </BaseDropdown>

        <div class="flex-1" />

        <!-- Sort -->
        <BaseDropdown
          v-model="currentSort"
          :options="sortOptions"
          class="w-44"
        >
          <template #trigger>
            <button class="h-9 px-3 flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
              <Icon
                name="lucide:arrow-up-down"
                class="w-4 h-4"
              />
              <span>{{ sortOptions.find(o => o.value === currentSort)?.label }}</span>
            </button>
          </template>
        </BaseDropdown>
      </div>

      <!-- Active Filters -->
      <div
        v-if="hasActiveFilters"
        class="flex items-center gap-2 mt-4"
      >
        <span class="text-xs font-medium text-text-secondary">Active filters:</span>
        <div class="flex flex-wrap items-center gap-2">
          <BaseBadge
            v-if="statusFilter"
            variant="default"
            size="sm"
            class="pl-2 pr-1 gap-1"
          >
            Status: {{ statusOptions.find(o => o.value === statusFilter)?.label }}
            <button
              class="p-0.5 hover:bg-black/5 rounded-full"
              @click="statusFilter = null"
            >
              <Icon
                name="lucide:x"
                class="w-3 h-3"
              />
            </button>
          </BaseBadge>

          <BaseBadge
            v-if="riskFilter"
            variant="default"
            size="sm"
            class="pl-2 pr-1 gap-1"
          >
            Risk: {{ riskOptions.find(o => o.value === riskFilter)?.label }}
            <button
              class="p-0.5 hover:bg-black/5 rounded-full"
              @click="riskFilter = null"
            >
              <Icon
                name="lucide:x"
                class="w-3 h-3"
              />
            </button>
          </BaseBadge>

          <BaseBadge
            v-if="repositoryFilter"
            variant="default"
            size="sm"
            class="pl-2 pr-1 gap-1"
          >
            Repo: {{ repositories.find(r => r.id === repositoryFilter)?.name }}
            <button
              class="p-0.5 hover:bg-black/5 rounded-full"
              @click="repositoryFilter = null"
            >
              <Icon
                name="lucide:x"
                class="w-3 h-3"
              />
            </button>
          </BaseBadge>

          <button 
            class="text-xs text-accent hover:text-accent-hover font-medium ml-1"
            @click="clearFilters"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-auto bg-bg-app px-8 py-6">
      <!-- Loading State (Initial) -->
      <div
        v-if="isLoading && runs.length === 0"
        class="space-y-4"
      >
        <BaseSkeleton class="h-24 w-full rounded-xl" />
        <BaseSkeleton class="h-24 w-full rounded-xl" />
        <BaseSkeleton class="h-24 w-full rounded-xl" />
      </div>

      <!-- Error State -->
      <BaseCard
        v-else-if="error"
        class="bg-error/5 border-error/10"
      >
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <div class="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
            <Icon
              name="lucide:alert-circle"
              class="w-6 h-6"
            />
          </div>
          <h3 class="text-lg font-semibold text-text-primary mb-1">
            Failed to load reviews
          </h3>
          <p class="text-text-secondary mb-6 max-w-md">
            {{ error }}
          </p>
          <BaseButton
            variant="secondary"
            @click="fetchWorkspaceRuns(queryParams)"
          >
            Try Again
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Empty State (No Runs at all) -->
      <div
        v-else-if="runs.length === 0 && !hasActiveFilters && !isLoading"
        class="h-full flex flex-col items-center justify-center"
      >
        <BaseEmptyState
          icon="lucide:git-pull-request"
          title="No reviews yet"
          description="Code reviews will appear here when pull requests are opened in your connected repositories."
        >
          <NuxtLink
            :to="`/${workspaceSlug}/repositories`"
            class="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm"
          >
            <Icon
              name="lucide:folder-git-2"
              class="w-4 h-4"
            />
            View Repositories
          </NuxtLink>
        </BaseEmptyState>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Empty State (No Matches) -->
        <div
          v-if="runs.length === 0"
          class="h-64 flex flex-col items-center justify-center"
        >
          <div class="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
            <Icon
              name="lucide:search-x"
              class="w-6 h-6 text-text-muted"
            />
          </div>
          <h3 class="text-base font-medium text-text-primary">
            No matching reviews found
          </h3>
          <p class="text-sm text-text-secondary mt-1">
            Try adjusting your search or filters
          </p>
          <button
            class="mt-4 text-sm text-accent hover:text-accent-hover font-medium"
            @click="clearFilters"
          >
            Clear all filters
          </button>
        </div>

        <!-- Runs List -->
        <div
          v-else
          class="space-y-6 pb-8"
        >
          <DomainRunsTable
            :runs="runs"
            :workspace-slug="workspaceSlug"
          />

          <!-- Pagination -->
          <div
            v-if="pagination.lastPage > 1"
            class="flex items-center justify-between pt-4 border-t border-border-subtle"
          >
            <p class="text-sm text-text-muted">
              Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} reviews
            </p>
            <div class="flex items-center gap-2">
              <BaseButton
                variant="secondary"
                size="sm"
                :disabled="pagination.currentPage === 1"
                @click="loadPage(pagination.currentPage - 1)"
              >
                <Icon
                  name="lucide:chevron-left"
                  class="w-4 h-4"
                />
                Previous
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="sm"
                :disabled="pagination.currentPage === pagination.lastPage"
                @click="loadPage(pagination.currentPage + 1)"
              >
                Next
                <Icon
                  name="lucide:chevron-right"
                  class="w-4 h-4"
                />
              </BaseButton>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useGitHubService } from '~/services/integrations/githubService'
import { useRuns, type WorkspaceRunsParams } from '~/composables/reviews/useRuns'
import type { Repository } from '~/types'
import { useAppToast } from '~/composables/shared/useAppToast'

/**
 * Code Reviews page
 * Monitor and manage code reviews across repositories
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const workspaceStore = useWorkspaceStore()
const githubService = useGitHubService()
const toast = useAppToast()

const workspaceId = computed(() => workspaceStore.currentWorkspaceId)
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug ?? '')

// Composables
const {
  runs,
  prGroups,
  repositoryGroups,
  isLoading,
  error,
  fetchWorkspaceRuns,
  pagination,
} = useRuns(workspaceId)

// State
const repositories = ref<Repository[]>([])
const isLoadingRepos = ref(false)
const isInitializing = ref(true)

// View mode
const viewMode = ref<'all' | 'pr' | 'repository'>('all')

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

// Check if any filters are active
const hasActiveFilters = computed(() =>
  Boolean(
    search.value.trim() ||
      statusFilter.value ||
      riskFilter.value ||
      repositoryFilter.value ||
      authorFilter.value ||
      dateRange.value.from ||
      dateRange.value.to
  )
)

// Build query params
const queryParams = computed<WorkspaceRunsParams>(() => ({
  page: 1,
  search: debouncedSearch.value.trim() || undefined,
  status: statusFilter.value || undefined,
  riskLevel: riskFilter.value || undefined,
  repositoryId: repositoryFilter.value || undefined,
  author: authorFilter.value || undefined,
  fromDate: dateRange.value.from || undefined,
  toDate: dateRange.value.to || undefined,
  sortBy: sortBy.value,
  sortOrder: sortOrder.value,
  groupBy: viewMode.value === 'all' ? null : viewMode.value,
}))

// Load repositories for filter
const fetchRepositories = async () => {
  if (!workspaceId.value) return
  isLoadingRepos.value = true
  try {
    const response = await githubService.listRepositories(workspaceId.value)
    repositories.value = response.data
  } catch (e) {
    console.error('Failed to load repositories', e)
    toast.error('Failed to load repositories')
  } finally {
    isLoadingRepos.value = false
  }
}

// Unified fetch that handles all view modes
const fetchData = async (params: WorkspaceRunsParams = {}, showToast = false) => {
  await fetchWorkspaceRuns(params)

  if (showToast && !error.value) {
    toast.success('Reviews refreshed')
  }
}

// Fetch runs when params change
watch(queryParams, async (params) => {
  await fetchData(params)
}, { immediate: false })

// Initial fetch
onMounted(async () => {
  try {
    if (workspaceId.value) {
      await Promise.all([
        fetchData(queryParams.value),
        fetchRepositories()
      ])
    }
  } finally {
    isInitializing.value = false
  }
})

// Filter handlers
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
  await fetchData({ ...queryParams.value, page })
}

// Current view item type for pagination
const currentItemType = computed(() => {
  if (viewMode.value === 'pr') return 'pull requests'
  if (viewMode.value === 'repository') return 'repositories'
  return 'reviews'
})

// Check if current view has data
const hasData = computed(() => {
  if (viewMode.value === 'all') return runs.value.length > 0
  if (viewMode.value === 'pr') return prGroups.value.length > 0
  return repositoryGroups.value.length > 0
})

// Show no-data empty state (when no filters and no data)
const showNoDataState = computed(() =>
  !hasData.value && !hasActiveFilters.value && !isLoading.value && !isInitializing.value
)

// Show no-matches empty state (when filters applied but no results)
const showNoMatchesState = computed(() =>
  !hasData.value && hasActiveFilters.value && !isLoading.value && !isInitializing.value
)

// Stats
const completedCount = computed(() => runs.value.filter(r => r.status === 'completed').length)
const inProgressCount = computed(() => runs.value.filter(r => r.status === 'in_progress' || r.status === 'queued').length)
</script>

<template>
  <BaseContainer class="space-y-8">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">
          Code Reviews
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ pagination.total }} {{ pagination.total === 1 ? 'review' : 'reviews' }}
          <template v-if="completedCount > 0">
            · {{ completedCount }} completed
          </template>
          <template v-if="inProgressCount > 0">
            · {{ inProgressCount }} in progress
          </template>
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        :disabled="isLoading"
        @click="fetchData(queryParams, true)"
      >
        <Icon
          name="lucide:refresh-cw"
          class="size-4"
          :class="{ 'animate-spin': isLoading }"
        />
        {{ isLoading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <!-- View Mode Toggle -->
    <DomainReviewsRunsViewModeToggle v-model="viewMode" />

    <!-- Filters -->
    <DomainReviewsRunsFilterBar
      v-model:search="search"
      v-model:status-filter="statusFilter"
      v-model:risk-filter="riskFilter"
      v-model:repository-filter="repositoryFilter"
      v-model:author-filter="authorFilter"
      v-model:date-range="dateRange"
      v-model:sort-by="sortBy"
      v-model:sort-order="sortOrder"
      :repositories="repositories"
      :is-loading-repos="isLoadingRepos"
      @clear-filters="clearFilters"
    />

    <!-- Loading State -->
    <div
      v-if="(isLoading || isInitializing) && !hasData"
      class="space-y-3"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="flex items-center gap-4 rounded-lg border border-gray-100 bg-white p-4"
      >
        <BaseSkeleton class="size-10 rounded-lg" />
        <div class="flex-1 space-y-2">
          <BaseSkeleton class="h-4 w-48" />
          <BaseSkeleton class="h-3 w-72" />
        </div>
        <BaseSkeleton class="h-6 w-20 rounded-full" />
      </div>
    </div>

    <!-- Error State -->
    <DomainReviewsRunsEmptyState
      v-else-if="error"
      type="error"
      :error-message="error"
      @retry="fetchData(queryParams, true)"
    />

    <!-- Empty State (No Data) -->
    <DomainReviewsRunsEmptyState
      v-else-if="showNoDataState"
      type="no-data"
      :workspace-slug="workspaceSlug"
    />

    <!-- Empty State (No Matches) -->
    <DomainReviewsRunsEmptyState
      v-else-if="showNoMatchesState"
      type="no-matches"
      :view-mode="viewMode"
      @clear-filters="clearFilters"
    />

    <!-- Content -->
    <template v-else>
      <!-- All Runs View -->
      <DomainReviewsRunsTable
        v-if="viewMode === 'all'"
        :runs="runs"
        :workspace-slug="workspaceSlug"
      />

      <!-- By Pull Request View -->
      <div
        v-else-if="viewMode === 'pr'"
        class="space-y-3"
      >
        <DomainReviewsPullRequestGroup
          v-for="group in prGroups"
          :key="`${group.repository.id}-${group.pull_request_number}`"
          :group="group"
        />
      </div>

      <!-- By Repository View -->
      <div
        v-else-if="viewMode === 'repository'"
        class="space-y-3"
      >
        <DomainReviewsRepositoryGroup
          v-for="group in repositoryGroups"
          :key="group.repository.id"
          :group="group"
        />
      </div>

      <!-- Pagination -->
      <DomainReviewsRunsPagination
        :current-page="pagination.currentPage"
        :last-page="pagination.lastPage"
        :from="pagination.from"
        :to="pagination.to"
        :total="pagination.total"
        :item-type="currentItemType"
        @load-page="loadPage"
      />
    </template>
  </BaseContainer>
</template>

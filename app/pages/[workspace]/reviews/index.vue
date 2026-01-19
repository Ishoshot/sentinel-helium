<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/useWorkspaceStore';
import { useGitHubService } from '~/services/integrations/githubService';
import { useRuns, type WorkspaceRunsParams } from '~/composables/reviews/useRuns';
import type { Repository } from '~/types';
import { useAppToast } from '~/composables/shared/useAppToast';

definePageMeta({
  middleware: ['auth', 'workspace'],
});

const workspaceStore = useWorkspaceStore();
const githubService = useGitHubService();
const toast = useAppToast();

const workspaceId = computed(() => workspaceStore.currentWorkspaceId);
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug ?? '');

// Composables
const {
  runs,
  prGroups,
  repositoryGroups,
  isLoading,
  error,
  fetchWorkspaceRuns,
  pagination,
} = useRuns(workspaceId);

// State
const repositories = ref<Repository[]>([]);
const isLoadingRepos = ref(false);
const isInitializing = ref(true);
// View mode
const viewMode = ref<'all' | 'pr' | 'repository'>('all');

// Filter state
const search = ref('');
const statusFilter = ref<string | null>(null);
const riskFilter = ref<string | null>(null);
const repositoryFilter = ref<number | null>(null);
const authorFilter = ref<string | null>(null);
const dateRange = ref<{ from: string | null; to: string | null }>({ from: null, to: null });
const sortOrder = ref<'asc' | 'desc'>('desc');
const sortBy = ref<'created_at' | 'completed_at' | 'findings_count'>('created_at');

// Debounced search
const debouncedSearch = refDebounced(search, 300);

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
);

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
}));

// Load repositories for filter
const fetchRepositories = async () => {
  if (!workspaceId.value) return;
  isLoadingRepos.value = true;
  try {
    repositories.value = await githubService.listRepositories(workspaceId.value);
  } catch (e) {
    console.error('Failed to load repositories', e);
    toast.error('Failed to load repositories');
  } finally {
    isLoadingRepos.value = false;
  }
};

// Unified fetch that handles all view modes
const fetchData = async (params: WorkspaceRunsParams = {}, showToast = false) => {
  await fetchWorkspaceRuns(params);

  if (showToast && !error.value) {
    toast.success('Reviews refreshed successfully');
  }
};

// Fetch runs when params change
watch(queryParams, async (params) => {
  await fetchData(params);
}, { immediate: false });

// Initial fetch
onMounted(async () => {
  try {
    if (workspaceId.value) {
      await Promise.all([
        fetchData(queryParams.value),
        fetchRepositories()
      ]);
    }
  } finally {
    isInitializing.value = false;
  }
});

// Filter handlers
const clearFilters = () => {
  search.value = '';
  statusFilter.value = null;
  riskFilter.value = null;
  repositoryFilter.value = null;
  authorFilter.value = null;
  dateRange.value = { from: null, to: null };
};

// Pagination
const loadPage = async (page: number) => {
  await fetchData({ ...queryParams.value, page });
};

// Current view item type for pagination
const currentItemType = computed(() => {
  if (viewMode.value === 'pr') return 'pull requests';
  if (viewMode.value === 'repository') return 'repositories';
  return 'reviews';
});

// Check if current view has data
const hasData = computed(() => {
  if (viewMode.value === 'all') return runs.value.length > 0;
  if (viewMode.value === 'pr') return prGroups.value.length > 0;
  return repositoryGroups.value.length > 0;
});

// Show no-data empty state (when no filters and no data)
const showNoDataState = computed(() =>
  !hasData.value && !hasActiveFilters.value && !isLoading.value && !isInitializing.value
);

// Show no-matches empty state (when filters applied but no results)
const showNoMatchesState = computed(() =>
  !hasData.value && hasActiveFilters.value && !isLoading.value && !isInitializing.value
);
</script>

<template>
  <BaseContainer>
    <div class="min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] flex flex-col -m-4 sm:-m-6 lg:-m-8">
      <!-- Header -->
      <div class="px-4 sm:px-6 lg:px-8 py-8 border-b border-border-subtle bg-bg-app shrink-0">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-text-primary tracking-tight">
              Code Reviews
            </h1>
            <p class="mt-2 text-sm text-text-secondary">
              Monitor and manage all code reviews across your repositories
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="group relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="isLoading
                ? 'bg-bg-elevated border border-border-subtle text-text-secondary'
                : 'bg-bg-elevated border border-border-subtle text-text-secondary hover:border-accent hover:text-accent hover:shadow-sm hover:scale-105'"
              :disabled="isLoading"
              @click="fetchData(queryParams, true)"
            >
              <Icon
                name="lucide:refresh-cw"
                class="w-4 h-4 transition-transform duration-300"
                :class="{ 'animate-spin': isLoading, 'group-hover:rotate-180': !isLoading }"
              />
              <span>{{ isLoading ? 'Refreshing...' : 'Refresh' }}</span>
            </button>
          </div>
        </div>

        <!-- View Mode Toggle -->
        <div class="mb-8">
          <DomainReviewsRunsViewModeToggle v-model="viewMode" />
        </div>

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
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-auto bg-bg-app px-4 sm:px-6 lg:px-8 py-8">
        <!-- Loading State (Initial) -->
        <div
          v-if="(isLoading || isInitializing) && !hasData"
          class="space-y-5"
        >
          <BaseSkeleton class="h-32 w-full rounded-2xl" />
          <BaseSkeleton class="h-32 w-full rounded-2xl" />
          <BaseSkeleton class="h-32 w-full rounded-2xl" />
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

        <!-- Content by View Mode -->
        <div
          v-else
          class="space-y-8 pb-8"
        >
          <!-- All Runs View (Default) -->
          <DomainReviewsRunsTable
            v-if="viewMode === 'all'"
            :runs="runs"
            :workspace-slug="workspaceSlug"
          />

          <!-- By Pull Request View -->
          <div
            v-else-if="viewMode === 'pr'"
            class="space-y-4"
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
            class="space-y-4"
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
        </div>
      </div>
    </div>
  </BaseContainer>
</template>

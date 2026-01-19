<script setup lang="ts">
import { useGitHubService } from '~/services/integrations/githubService'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useRuns } from '~/composables/reviews/useRuns'
import { useDataFilter } from '~/composables/shared/useDataFilter'
import type { Repository } from '~/types'
import DomainReviewsRunsTable from '~/components/domain/reviews/RunsTable.vue'
import DomainReviewsRunFilterBar from '~/components/domain/reviews/RunFilterBar.vue'

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const route = useRoute()
const workspaceStore = useWorkspaceStore()
const githubService = useGitHubService()

const workspaceId = computed(() => workspaceStore.currentWorkspaceId)
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug ?? '')
const repositoryId = computed(() => parseInt(route.params.repositoryId as string))

// Composables
const { runs, isLoading, error, fetchRuns, pagination } = useRuns(workspaceId)

// Filtering Engine
const {
  search,
  filters,
  filteredData: filteredRuns,
  setFilter
} = useDataFilter(runs, {
  searchFields: [
    'metadata.pull_request_title', 
    'metadata.sender_login', 
    'status',
    'id'
  ],
  filters: {
    // Custom filter for risk level (nested property)
    risk: (run, value) => {
      const level = run.summary?.risk_level?.toLowerCase() ?? run.metadata?.review_summary?.risk_level?.toLowerCase()
      return level === value
    }
  }
})

// Bindings for FilterBar
const currentStatus = computed(() => filters.value.status ?? null)
const currentRisk = computed(() => filters.value.risk ?? null)

const handleStatusChange = (value: string | null) => setFilter('status', value)
const handleRiskChange = (value: string | null) => setFilter('risk', value)

// Local state for repository details
const repository = ref<Repository | null>(null)
const isLoadingRepo = ref(true)
const isInitializing = ref(true)

// Fetch data
onMounted(async () => {
  if (workspaceId.value) {
    try {
      // Fetch repository details for the header
      repository.value = await githubService.getRepository(workspaceId.value, repositoryId.value)
    } catch (e) {
      // Handle error (likely 404 or permission)
      console.error('Failed to fetch repository', e)
    } finally {
      isLoadingRepo.value = false
    }

    try {
      // Fetch runs
      await fetchRuns(repositoryId.value)
    } finally {
      isInitializing.value = false
    }
  } else {
    isInitializing.value = false
  }
})

// Navigation
const goBack = () => {
  navigateTo(`/${workspaceSlug.value}/repositories`)
}
</script>

<template>
  <BaseContainer size="lg">
    <div>
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-2">
          <button 
            class="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 text-sm font-medium"
            @click="goBack"
          >
            <Icon
              name="lucide:arrow-left"
              class="w-4 h-4"
            />
            Repositories
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-text-primary flex items-center gap-2">
              <span
                v-if="isLoadingRepo"
                class="w-32 h-8 bg-bg-elevated animate-pulse rounded-md"
              />
              <span v-else>{{ repository?.full_name || 'Repository Runs' }}</span>
            </h1>
            <p class="mt-1 text-text-secondary">
              Review history and status
            </p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-6">
        <!-- Loading State -->
        <div
          v-if="isLoading || isInitializing"
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
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <div class="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center mb-3">
              <Icon
                name="lucide:alert-circle"
                class="w-5 h-5"
              />
            </div>
            <h3 class="text-base font-semibold text-text-primary mb-1">
              Failed to load runs
            </h3>
            <p class="text-sm text-text-secondary mb-4">
              {{ error }}
            </p>
            <BaseButton
              variant="secondary"
              size="sm"
              @click="fetchRuns(repositoryId)"
            >
              Try Again
            </BaseButton>
          </div>
        </BaseCard>

        <!-- Empty State (No Runs at all) -->
        <BaseCard v-else-if="runs.length === 0 && !isInitializing && !isLoading">
          <BaseEmptyState
            icon="lucide:play-circle"
            title="No runs yet"
            description="Runs will appear here when pull requests are opened or updated in this repository."
          >
            <div class="mt-2 text-xs text-text-muted bg-bg-elevated px-3 py-2 rounded border border-border-subtle">
              Waiting for webhooks...
            </div>
          </BaseEmptyState>
        </BaseCard>

        <!-- Content with Filters -->
        <div
          v-else
          class="space-y-6"
        >
          <!-- Filter Bar -->
          <DomainReviewsRunFilterBar
            :search="search"
            :status="currentStatus"
            :risk="currentRisk"
            @update:search="search = $event"
            @update:status="handleStatusChange"
            @update:risk="handleRiskChange"
          />

          <!-- Empty State (No Matches) -->
          <div
            v-if="filteredRuns.length === 0"
            class="py-12 text-center"
          >
            <div class="w-12 h-12 rounded-full bg-bg-elevated mx-auto flex items-center justify-center mb-3">
              <Icon
                name="lucide:search-x"
                class="w-6 h-6 text-text-muted"
              />
            </div>
            <h3 class="text-sm font-medium text-text-primary">
              No matching runs found
            </h3>
            <p class="text-sm text-text-secondary mt-1">
              Try adjusting your search or filters
            </p>
            <button 
              class="mt-3 text-sm text-accent hover:text-accent-hover font-medium"
              @click="() => { search = ''; handleStatusChange(null); handleRiskChange(null) }"
            >
              Clear all filters
            </button>
          </div>

          <!-- Filtered Runs Table -->
          <DomainReviewsRunsTable
            v-else
            :runs="filteredRuns"
            :workspace-slug="workspaceSlug"
            hide-repository
          />
        </div>
      </div>
    </div>
  </BaseContainer>
</template>

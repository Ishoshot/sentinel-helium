<script setup lang="ts">
import { useRuns } from '~/composables/useRuns'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { formatRelativeTime } from '~/utils/date'
import { RunStatus, EmptyStateVariant } from '~/types'

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const route = useRoute()
const workspaceStore = useWorkspaceStore()

const workspaceId = computed(() => workspaceStore.currentWorkspaceId)
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug ?? '')
const runId = computed(() => parseInt(route.params.id as string))

// Composables
const { currentRun: run, isLoading, error, fetchRun } = useRuns(workspaceId)

// Fetch data
onMounted(async () => {
  if (workspaceId.value) {
    await fetchRun(runId.value)
  }
})

// Navigation
const goBack = () => {
  if (run.value?.repository_id) {
    navigateTo(`/${workspaceSlug.value}/repositories/${run.value.repository_id}/runs`)
  } else {
    navigateTo(`/${workspaceSlug.value}/repositories`)
  }
}

// Computed
const repositoryName = computed(() => run.value?.repository?.full_name || run.value?.metadata?.repository_full_name)
const prNumber = computed(() => run.value?.metadata?.pull_request_number)
const prTitle = computed(() => run.value?.metadata?.pull_request_title)
const headBranch = computed(() => run.value?.metadata?.head_branch)
const baseBranch = computed(() => run.value?.metadata?.base_branch)
const findingsCount = computed(() => run.value?.findings?.length ?? 0)
const hasFindings = computed(() => findingsCount.value > 0)

const duration = computed(() => {
  if (!run.value?.started_at || !run.value?.completed_at) return null
  // Simple duration calculation could be added here if needed
  return null
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header Navigation -->
    <div class="mb-6">
      <button 
        @click="goBack"
        class="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 text-sm font-medium"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
        Back to Runs
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <BaseSkeleton class="h-32 w-full rounded-xl" />
      <BaseSkeleton class="h-64 w-full rounded-xl" />
    </div>

    <!-- Error State -->
    <BaseCard v-else-if="error" class="bg-error/5 border-error/10">
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
          <Icon name="lucide:alert-octagon" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-semibold text-text-primary mb-2">Run not found</h3>
        <p class="text-text-secondary mb-6">{{ error }}</p>
        <BaseButton variant="secondary" @click="goBack">
          Return to Runs
        </BaseButton>
      </div>
    </BaseCard>

    <template v-else-if="run">
      <!-- Run Header Card -->
      <div class="bg-bg-elevated border border-border-subtle rounded-xl p-6 mb-8 shadow-sm">
        <div class="flex items-start justify-between gap-6 mb-6">
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div class="w-12 h-12 rounded-xl bg-bg-surface ring-1 ring-border-subtle flex items-center justify-center shrink-0">
              <Icon name="lucide:play-circle" class="w-6 h-6 text-text-muted" />
            </div>

            <div>
              <div class="flex items-center gap-3 mb-2 flex-wrap">
                <h1 class="text-xl font-bold text-text-primary leading-tight">
                  <span v-if="prNumber" class="font-mono text-text-muted mr-1">#{{ prNumber }}</span>
                  {{ prTitle || 'Run Details' }}
                </h1>
                <DomainRunStatusBadge :status="run.status" />
              </div>

              <div class="flex items-center gap-x-6 gap-y-2 flex-wrap text-sm text-text-secondary">
                <span class="flex items-center gap-1.5">
                  <Icon name="lucide:folder-git-2" class="w-4 h-4 text-text-muted" />
                  {{ repositoryName }}
                </span>
                
                <span v-if="headBranch" class="flex items-center gap-1.5 font-mono text-xs">
                  <Icon name="lucide:git-branch" class="w-3.5 h-3.5 text-text-muted" />
                  {{ headBranch }}
                  <Icon name="lucide:arrow-right" class="w-3 h-3 text-text-muted" />
                  {{ baseBranch }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Meta Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border-subtle">
          <div>
            <div class="text-xs font-medium text-text-muted mb-1">Triggered</div>
            <div class="text-sm text-text-primary flex items-center gap-1.5">
              <BaseAvatar 
                v-if="run.metadata?.sender_avatar_url" 
                :src="String(run.metadata.sender_avatar_url)" 
                :name="String(run.metadata.sender_login)" 
                size="xs" 
              />
              <span v-else class="font-medium">{{ run.metadata?.sender_login || 'System' }}</span>
            </div>
          </div>
          
          <div>
            <div class="text-xs font-medium text-text-muted mb-1">Started</div>
            <div class="text-sm text-text-primary">
              {{ formatRelativeTime(run.started_at || run.created_at) }}
            </div>
          </div>

          <div>
            <div class="text-xs font-medium text-text-muted mb-1">Status</div>
            <div class="text-sm text-text-primary capitalize">{{ run.status.replace('_', ' ') }}</div>
          </div>

          <div>
            <div class="text-xs font-medium text-text-muted mb-1">Findings</div>
            <div class="text-sm font-medium" :class="hasFindings ? 'text-error' : 'text-success'">
              {{ findingsCount }} issues found
            </div>
          </div>
        </div>
      </div>

      <!-- Findings Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-text-primary">Findings</h2>
          <!-- Filter/Sort controls could go here -->
        </div>

        <div v-if="hasFindings">
          <DomainFindingList :findings="run.findings || []" />
        </div>

        <BaseEmptyState
          v-else-if="run.status === RunStatus.Completed"
          icon="lucide:check-circle-2"
          :variant="EmptyStateVariant.Success"
          title="No findings detected"
          description="Great job! No issues were found in this run."
        />

        <BaseEmptyState
          v-else-if="run.status === RunStatus.Queued || run.status === RunStatus.InProgress"
          icon="lucide:loader-2"
          title="Analysis in progress"
          description="Waiting for the review to complete..."
        >
          <div class="mt-4 flex justify-center">
            <Icon name="lucide:loader" class="w-6 h-6 animate-spin text-accent" />
          </div>
        </BaseEmptyState>
        
        <BaseEmptyState
          v-else
          icon="lucide:search"
          title="No findings"
          description="No findings have been recorded for this run."
        />
      </div>
    </template>
  </div>
</template>

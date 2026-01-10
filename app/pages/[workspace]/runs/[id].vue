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
  if (run.value?.metrics?.duration_ms) {
    const ms = run.value.metrics.duration_ms
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }
  if (!run.value?.started_at || !run.value?.completed_at) return null
  return null // Fallback calculation could go here
})

const reviewSummary = computed(() => run.value?.metadata?.review_summary)
const metrics = computed(() => run.value?.metrics)

// Risk level configuration
const riskConfig = computed(() => {
  const level = reviewSummary.value?.risk_level?.toLowerCase()
  if (!level) return null
  
  const configs: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    low: { color: 'text-success', bg: 'bg-success-light', icon: 'lucide:shield-check', label: 'Low Risk' },
    medium: { color: 'text-warning', bg: 'bg-warning-light', icon: 'lucide:alert-triangle', label: 'Medium Risk' },
    high: { color: 'text-error', bg: 'bg-error-light', icon: 'lucide:alert-circle', label: 'High Risk' },
    critical: { color: 'text-error', bg: 'bg-error-light', icon: 'lucide:siren', label: 'Critical' },
  }
  
  return configs[level] || { color: 'text-text-muted', bg: 'bg-bg-surface', icon: 'lucide:info', label: level }
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
                
                <!-- Risk Badge -->
                <div 
                  v-if="riskConfig"
                  class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent"
                  :class="[riskConfig.bg, riskConfig.color]"
                >
                  <Icon :name="riskConfig.icon" class="w-3.5 h-3.5" />
                  <span>{{ riskConfig.label }}</span>
                </div>
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

        <!-- Metrics Grid (Secondary Metadata) -->
        <div v-if="metrics" class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-border-subtle/50">
          <div>
            <div class="text-xs font-medium text-text-muted mb-1">Files Changed</div>
            <div class="text-sm text-text-primary font-mono">{{ metrics.files_changed }}</div>
          </div>
          
          <div>
            <div class="text-xs font-medium text-text-muted mb-1">Lines</div>
            <div class="text-sm text-text-primary font-mono">
              <span class="text-success">+{{ metrics.lines_added }}</span>
              <span class="text-border-muted mx-1">/</span>
              <span class="text-error">-{{ metrics.lines_deleted }}</span>
            </div>
          </div>

          <div>
            <div class="text-xs font-medium text-text-muted mb-1">Tokens</div>
            <div class="text-sm text-text-primary font-mono">{{ metrics.tokens_used_estimated.toLocaleString() }}</div>
          </div>

          <div>
            <div class="text-xs font-medium text-text-muted mb-1">Duration</div>
            <div class="text-sm text-text-primary font-mono">{{ duration || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- Review Summary Card -->
      <div 
        v-if="run.status === RunStatus.Completed || run.status === RunStatus.Failed"
        class="bg-bg-elevated border border-border-subtle rounded-xl p-6 mb-8 shadow-sm"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent">
            <Icon name="lucide:file-text" class="w-4 h-4" />
          </div>
          <h2 class="text-lg font-semibold text-text-primary">Review Summary</h2>
        </div>

        <div v-if="reviewSummary" class="space-y-4">
          <p class="text-text-secondary leading-relaxed">
            {{ reviewSummary.overview }}
          </p>

          <div v-if="reviewSummary.recommendations?.length" class="space-y-2">
            <h3 class="text-sm font-medium text-text-primary">Recommendations</h3>
            <ul class="space-y-1.5">
              <li 
                v-for="(rec, index) in reviewSummary.recommendations" 
                :key="index"
                class="flex items-start gap-2 text-sm text-text-secondary"
              >
                <Icon name="lucide:check-circle" class="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span>{{ rec }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div v-else class="flex items-center gap-2 text-text-muted text-sm py-2">
          <Icon name="lucide:clock" class="w-4 h-4" />
          <span>Review summary pending...</span>
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

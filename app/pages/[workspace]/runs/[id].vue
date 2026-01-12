<script setup lang="ts">
import { useRuns } from '~/composables/useRuns'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { formatRelativeTime } from '~/utils/date'
import { RunStatus, EmptyStateVariant, FindingSeverity, type RunVerdict } from '~/types'

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
const pr = computed(() => run.value?.pull_request)
const meta = computed(() => run.value?.metadata)

const repositoryName = computed(() => run.value?.repository?.full_name || meta.value?.repository_full_name)
const prNumber = computed(() => pr.value?.number ?? meta.value?.pull_request_number)
const prTitle = computed(() => pr.value?.title ?? meta.value?.pull_request_title)
const isDraft = computed(() => pr.value?.is_draft ?? false)

const headBranch = computed(() => pr.value?.head_branch ?? meta.value?.head_branch)
const baseBranch = computed(() => pr.value?.base_branch ?? meta.value?.base_branch)

const author = computed(() => {
  if (pr.value?.author) return pr.value.author
  if (meta.value?.sender_login) {
    return {
      login: meta.value.sender_login as string,
      avatar_url: meta.value.sender_avatar_url as string | null
    }
  }
  return null
})

const assignees = computed(() => pr.value?.assignees ?? [])
const reviewers = computed(() => pr.value?.reviewers ?? [])
const labels = computed(() => pr.value?.labels ?? [])

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

const reviewSummary = computed(() => run.value?.summary ?? run.value?.metadata?.review_summary)
const metrics = computed(() => run.value?.metrics)

const verdictBadge = computed(() => {
  const verdict = reviewSummary.value?.verdict as RunVerdict | undefined
  if (!verdict) return null

  const configs: Record<RunVerdict, { label: string; icon: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
    approve: { label: 'Approve', icon: 'lucide:check', variant: 'success' },
    request_changes: { label: 'Request Changes', icon: 'lucide:alert-triangle', variant: 'warning' },
    comment: { label: 'Comment', icon: 'lucide:message-square', variant: 'primary' },
  }

  return configs[verdict]
})

const riskBadge = computed(() => {
  const level = reviewSummary.value?.risk_level?.toLowerCase()
  if (!level) return null

  const configs: Record<string, { label: string; icon: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
    low: { label: 'Low Risk', icon: 'lucide:shield-check', variant: 'success' },
    medium: { label: 'Medium Risk', icon: 'lucide:alert-triangle', variant: 'warning' },
    high: { label: 'High Risk', icon: 'lucide:alert-circle', variant: 'error' },
    critical: { label: 'Critical', icon: 'lucide:siren', variant: 'error' },
  }

  return configs[level] ?? { label: level, icon: 'lucide:info', variant: 'default' as const }
})

// Collapsible state
const isReviewExpanded = ref(true)

// Findings Filter Logic
const selectedSeverity = ref<FindingSeverity | 'all'>('all')

const findingsBySeverity = computed(() => {
  const counts: Record<string, number> = {
    [FindingSeverity.Critical]: 0,
    [FindingSeverity.High]: 0,
    [FindingSeverity.Medium]: 0,
    [FindingSeverity.Low]: 0,
    [FindingSeverity.Info]: 0
  }
  
  run.value?.findings?.forEach(f => {
    const severity = f.severity?.toLowerCase() as FindingSeverity
    if (counts[severity] !== undefined) {
      counts[severity]++
    }
  })
  
  return counts
})

const filteredFindings = computed(() => {
  if (!run.value?.findings) return []
  if (selectedSeverity.value === 'all') return run.value.findings
  
  return run.value.findings.filter(f => 
    (f.severity?.toLowerCase() as FindingSeverity) === selectedSeverity.value
  )
})

const severityTabs = computed<{ label: string; value: FindingSeverity | 'all'; count: number; color: string }[]>(() => [
  { label: 'All', value: 'all', count: findingsCount.value, color: 'text-text-primary' },
  { label: 'Critical', value: FindingSeverity.Critical, count: findingsBySeverity.value[FindingSeverity.Critical] ?? 0, color: 'text-error' },
  { label: 'High', value: FindingSeverity.High, count: findingsBySeverity.value[FindingSeverity.High] ?? 0, color: 'text-error' },
  { label: 'Medium', value: FindingSeverity.Medium, count: findingsBySeverity.value[FindingSeverity.Medium] ?? 0, color: 'text-warning' },
  { label: 'Low', value: FindingSeverity.Low, count: findingsBySeverity.value[FindingSeverity.Low] ?? 0, color: 'text-success' },
  { label: 'Info', value: FindingSeverity.Info, count: findingsBySeverity.value[FindingSeverity.Info] ?? 0, color: 'text-text-muted' },
])

</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header Navigation -->
    <div class="mb-10">
      <button 
        class="text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 text-sm font-medium"
        @click="goBack"
      >
        <Icon
          name="lucide:arrow-left"
          class="w-4 h-4"
        />
        Back to Runs
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="space-y-6"
    >
      <BaseSkeleton class="h-32 w-full rounded-xl" />
      <BaseSkeleton class="h-64 w-full rounded-xl" />
    </div>

    <!-- Error State -->
    <BaseCard
      v-else-if="error"
      class="bg-error/5 border-error/10"
    >
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
          <Icon
            name="lucide:alert-octagon"
            class="w-6 h-6"
          />
        </div>
        <h3 class="text-lg font-semibold text-text-primary mb-2">
          Run not found
        </h3>
        <p class="text-text-secondary mb-6">
          {{ error }}
        </p>
        <BaseButton
          variant="secondary"
          @click="goBack"
        >
          Return to Runs
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Run Error State -->
    <div
      v-if="run && run.status === RunStatus.Skipped && run?.metadata?.skip_reason"
      class="mb-8 p-4 bg-error/5 border border-error/20 rounded-xl"
    >
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
          <Icon
            name="lucide:alert-circle"
            class="w-4 h-4 text-error"
          />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-text-primary mb-1">
            Analysis Failed
          </h3>
          <p class="text-sm text-text-secondary">
            {{ run.metadata.skip_message ?? run.metadata.skip_reason }}
          </p>
          <div
            v-if="run.metadata.skip_message?.toLowerCase().includes('provider key') || run.metadata.skip_reason?.toLowerCase() === 'no_provider_keys'"
            class="mt-3"
          >
            <NuxtLink
              v-if="run.repository_id"
              :to="`/${workspaceSlug}/repositories?settings=${run.repository_id}`"
              class="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover"
            >
              Configure Provider Keys
              <Icon
                name="lucide:arrow-right"
                class="w-4 h-4"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <template v-else-if="run">
      <!-- Run Header Card -->
      <div class="bg-bg-elevated border border-border-subtle rounded-xl shadow-sm overflow-hidden mb-8">
        <!-- Top Section: Identity & Context -->
        <div class="p-4 pb-4 sm:p-6 sm:pb-5 lg:p-8 lg:pb-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <!-- Icon -->
            <div class="w-14 h-14 rounded-xl bg-bg-surface ring-1 ring-border-subtle flex items-center justify-center shrink-0 shadow-sm">
              <Icon
                name="lucide:play-circle"
                class="w-7 h-7 text-text-muted"
              />
            </div>

            <div class="flex-1 min-w-0 pt-1">
              <!-- Title Row -->
              <div class="flex items-center gap-3 mb-3 flex-wrap">
                <div class="text-2xl flex items-baseline gap-2 leading-none">
                  <span
                    v-if="prNumber"
                    class="font-mono font-medium text-text-muted"
                  >#{{ prNumber }}</span>
                  <span class="font-bold text-text-primary">{{ prTitle || 'Run Details' }}</span>
                </div>
                
                <DomainRunStatusBadge :status="run.status" />
                
                <BaseBadge 
                  v-if="isDraft"
                  size="sm"
                  class="bg-bg-surface text-text-muted border border-border-subtle"
                >
                  Draft
                </BaseBadge>
              </div>

              <!-- Labels Row -->
              <div
                v-if="labels.length > 0"
                class="flex items-center gap-2 mb-4 flex-wrap"
              >
                <BaseLabel
                  v-for="label in labels"
                  :key="label.name"
                  :name="label.name"
                  :color="label.color"
                  size="sm"
                />
              </div>

              <!-- Context Row -->
              <div class="flex items-center gap-x-6 gap-y-2 flex-wrap text-sm text-text-secondary">
                <div class="flex items-center gap-2">
                  <Icon
                    name="lucide:folder-git-2"
                    class="w-4 h-4 text-text-muted"
                  />
                  <span class="font-medium">{{ repositoryName }}</span>
                </div>
                
                <div
                  v-if="headBranch"
                  class="flex items-center gap-2 font-mono text-xs text-text-muted"
                >
                  <Icon
                    name="lucide:git-branch"
                    class="w-3.5 h-3.5"
                  />
                  <span>{{ headBranch }}</span>
                  <Icon
                    name="lucide:arrow-right"
                    class="w-3 h-3 text-text-muted/50"
                  />
                  <span>{{ baseBranch }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-border-subtle w-full" />

        <!-- Primary Meta Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
          <!-- Author -->
          <div>
            <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Author
            </div>
            <div class="flex items-center gap-2 h-8">
              <template v-if="author">
                <BaseAvatar 
                  :src="author.avatar_url" 
                  :name="author.login" 
                  size="sm" 
                  class="ring-1 ring-border-subtle"
                />
                <span class="text-sm font-medium text-text-primary">{{ author.login }}</span>
              </template>
              <span
                v-else
                class="text-sm text-text-secondary"
              >System</span>
            </div>
          </div>

          <!-- Assignees -->
          <div>
            <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Assignees
            </div>
            <div
              v-if="assignees.length > 0"
              class="flex items-center -space-x-2 h-8"
            >
              <BaseAvatar
                v-for="user in assignees"
                :key="user.login"
                :src="user.avatar_url"
                :name="user.login"
                size="sm"
                class="ring-2 ring-bg-elevated hover:z-10 transition-all"
                :title="user.login"
              />
            </div>
            <div
              v-else
              class="h-8 flex items-center text-sm text-text-muted italic"
            >
              None assigned
            </div>
          </div>

          <!-- Started -->
          <div>
            <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Started
            </div>
            <div class="h-8 flex items-center text-sm font-medium text-text-primary">
              {{ formatRelativeTime(run.started_at || run.created_at) }}
            </div>
          </div>

          <!-- Status -->
          <div>
            <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Status
            </div>
            <div class="h-8 flex items-center text-sm font-medium text-text-primary capitalize">
              {{ run.status.replace('_', ' ') }}
            </div>
          </div>
        </div>

        <!-- Findings Summary -->
        <div class="px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8">
          <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Findings
          </div>
          <div
            class="text-sm font-medium"
            :class="hasFindings ? 'text-error' : 'text-success'"
          >
            {{ findingsCount }} issues found
          </div>
        </div>

        <!-- Metrics Grid (Secondary) -->
        <div
          v-if="metrics"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 border-t border-border-subtle bg-bg-surface/50"
        >
          <div>
            <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Files Changed
            </div>
            <div class="text-lg font-mono text-text-primary">
              {{ metrics.files_changed }}
            </div>
          </div>
          
          <div>
            <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Lines
            </div>
            <div class="text-lg font-mono flex items-center gap-2">
              <span class="text-success">+{{ metrics.lines_added }}</span>
              <span class="text-text-muted/30">|</span>
              <span class="text-error">-{{ metrics.lines_deleted }}</span>
            </div>
          </div>

          <div>
            <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Tokens
            </div>
            <div class="text-lg font-mono text-text-primary">
              {{ metrics.tokens_used_estimated.toLocaleString() }}
            </div>
          </div>

          <div>
            <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Duration
            </div>
            <div class="text-lg font-mono text-text-primary">
              {{ duration || '-' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Review Summary Card -->
      <div 
        v-if="run.status === RunStatus.Completed || run.status === RunStatus.Failed"
        class="bg-bg-elevated border border-border-subtle rounded-xl mb-8 shadow-sm transition-all duration-200"
      >
        <button 
          class="w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 hover:bg-bg-surface/50 transition-colors rounded-xl focus-ring"
          @click="isReviewExpanded = !isReviewExpanded"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent">
              <Icon
                name="lucide:file-text"
                class="w-4 h-4"
              />
            </div>
            <h2 class="text-lg font-semibold text-text-primary">
              Review Summary
            </h2>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <BaseBadge
              v-if="verdictBadge"
              size="sm"
              :variant="verdictBadge.variant"
              class="gap-1.5"
            >
              <Icon
                :name="verdictBadge.icon"
                class="w-3.5 h-3.5"
              />
              <span>{{ verdictBadge.label }}</span>
            </BaseBadge>

            <BaseBadge
              v-if="riskBadge"
              size="sm"
              :variant="riskBadge.variant"
              class="gap-1.5"
            >
              <Icon
                :name="riskBadge.icon"
                class="w-3.5 h-3.5"
              />
              <span>{{ riskBadge.label }}</span>
            </BaseBadge>

            <Icon 
              name="lucide:chevron-down" 
              class="w-5 h-5 text-text-muted transition-transform duration-200"
              :class="{ 'rotate-180': isReviewExpanded }"
            />
          </div>
        </button>

        <div
          v-show="isReviewExpanded"
          class="px-4 sm:px-6 pb-6"
        >
          <div
            v-if="reviewSummary"
            class="space-y-4 pt-2 border-t border-border-subtle"
          >
            <p class="text-text-secondary leading-relaxed mt-4 whitespace-pre-line">
              {{ reviewSummary.overview }}
            </p>

            <div
              v-if="reviewSummary.strengths?.length || reviewSummary.concerns?.length"
              class="grid gap-6 sm:grid-cols-2"
            >
              <div
                v-if="reviewSummary.strengths?.length"
                class="space-y-2"
              >
                <h3 class="text-sm font-medium text-text-primary flex items-center gap-2">
                  <Icon
                    name="lucide:check-circle"
                    class="w-4 h-4 text-success"
                  />
                  <span>Strengths</span>
                </h3>
                <ul class="space-y-1.5">
                  <li
                    v-for="(strength, index) in reviewSummary.strengths"
                    :key="index"
                    class="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span class="mt-1 w-1 h-1 rounded-full bg-border-muted shrink-0" />
                    <span>{{ strength }}</span>
                  </li>
                </ul>
              </div>

              <div class="space-y-2">
                <h3 class="text-sm font-medium text-text-primary flex items-center gap-2">
                  <Icon
                    name="lucide:alert-triangle"
                    class="w-4 h-4 text-warning"
                  />
                  <span>Concerns</span>
                </h3>
                <ul
                  v-if="reviewSummary.concerns?.length"
                  class="space-y-1.5"
                >
                  <li
                    v-for="(concern, index) in reviewSummary.concerns"
                    :key="index"
                    class="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <span class="mt-1 w-1 h-1 rounded-full bg-border-muted shrink-0" />
                    <span>{{ concern }}</span>
                  </li>
                </ul>
                <div
                  v-else
                  class="text-sm text-text-muted italic"
                >
                  No concerns identified
                </div>
              </div>
            </div>

            <div
              v-if="reviewSummary.recommendations?.length"
              class="space-y-2"
            >
              <h3 class="text-sm font-medium text-text-primary">
                Recommendations
              </h3>
              <ul class="space-y-1.5">
                <li 
                  v-for="(rec, index) in reviewSummary.recommendations" 
                  :key="index"
                  class="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <Icon
                    name="lucide:check-circle"
                    class="w-4 h-4 text-success mt-0.5 shrink-0"
                  />
                  <span>{{ rec }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div
            v-else
            class="flex items-center gap-2 text-text-muted text-sm pt-2"
          >
            <Icon
              name="lucide:clock"
              class="w-4 h-4"
            />
            <span>Review summary pending...</span>
          </div>
        </div>
      </div>

      <!-- Findings Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <h2 class="text-lg font-semibold text-text-primary">
            Findings
          </h2>
          
          <!-- Severity Filter Tabs -->
          <div
            v-if="hasFindings"
            class="flex flex-wrap items-center gap-1 p-1 bg-bg-elevated rounded-lg border border-border-subtle"
          >
            <button
              v-for="tab in severityTabs"
              :key="tab.value"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center gap-2"
              :class="[
                selectedSeverity === tab.value 
                  ? 'bg-bg-surface text-text-primary shadow-sm' 
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-surface/50'
              ]"
              @click="selectedSeverity = tab.value"
            >
              <span>{{ tab.label }}</span>
              <span 
                class="px-1.5 py-0.5 rounded-full bg-bg-surface text-[10px]"
                :class="selectedSeverity === tab.value ? tab.color : 'text-text-muted group-hover:text-text-primary'"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>
        </div>

        <div v-if="hasFindings">
          <div v-if="filteredFindings.length > 0">
            <DomainFindingList :findings="filteredFindings" />
          </div>
          
          <!-- Empty State for Filter -->
          <BaseEmptyState
            v-else
            icon="lucide:filter"
            :variant="EmptyStateVariant.Info"
            title="No matches found"
            description="There are no findings with this severity level."
          >
            <button 
              class="mt-4 text-sm text-accent hover:text-accent-hover font-medium"
              @click="selectedSeverity = 'all'"
            >
              Clear filters
            </button>
          </BaseEmptyState>
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
            <Icon
              name="lucide:loader"
              class="w-6 h-6 animate-spin text-accent"
            />
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

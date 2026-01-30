<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { formatRelativeTime } from '~/utils/date'
import { RunStatus, FindingSeverity, type RunVerdict } from '~/types'
import { useRuns } from '~/composables/reviews/useRuns'
import DomainReviewsFindingList from '~/components/domain/reviews/FindingList.vue'
import DomainReviewsRunStatusBadge from '~/components/domain/reviews/RunStatusBadge.vue'

/**
 * Run Details Page - Premium code review analysis view
 * State-of-the-art design with visual hierarchy and polish
 */

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
  return null
})

const reviewSummary = computed(() => run.value?.summary ?? run.value?.metadata?.review_summary)
const metrics = computed(() => run.value?.metrics)
const policySnapshot = computed(() => run.value?.policy_snapshot)

const policySource = computed(() => {
  const source = policySnapshot.value?.config_source

  if (source === 'branch') {
    return {
      label: 'Repository config',
      detail: policySnapshot.value?.config_branch ? `Branch: ${policySnapshot.value.config_branch}` : null,
    }
  }

  if (source === 'settings') {
    return { label: 'Workspace settings', detail: null }
  }

  return { label: 'Default policy', detail: null }
})

const confidenceThreshold = computed(() => {
  const value = policySnapshot.value?.confidence_thresholds?.finding
  return typeof value === 'number' ? value : null
})

const confidenceLabel = computed(() => {
  if (confidenceThreshold.value === null) return 'Not set'
  const percent = Math.round(confidenceThreshold.value * 100)
  return `${confidenceThreshold.value.toFixed(2)} (${percent}%)`
})

const enabledRules = computed(() => policySnapshot.value?.enabled_rules ?? [])
const ignoredPaths = computed(() => policySnapshot.value?.ignored_paths ?? [])

const formatRuleLabel = (rule: string) => rule
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (match) => match.toUpperCase())

const verdictBadge = computed(() => {
  const verdict = reviewSummary.value?.verdict as RunVerdict | undefined
  if (!verdict) return null

  const configs: Record<RunVerdict, { label: string; icon: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'error'; gradient: string }> = {
    approve: { label: 'Approve', icon: 'lucide:check', variant: 'success', gradient: 'from-success to-emerald-400' },
    request_changes: { label: 'Request Changes', icon: 'lucide:alert-triangle', variant: 'warning', gradient: 'from-warning to-amber-400' },
    comment: { label: 'Comment', icon: 'lucide:message-square', variant: 'primary', gradient: 'from-accent to-blue-400' },
  }

  return configs[verdict]
})

const riskBadge = computed(() => {
  const level = reviewSummary.value?.risk_level?.toLowerCase()
  if (!level) return null

  const configs: Record<string, { label: string; icon: string; variant: 'default' | 'success' | 'warning' | 'error'; color: string }> = {
    low: { label: 'Low Risk', icon: 'lucide:shield-check', variant: 'success', color: 'text-success' },
    medium: { label: 'Medium Risk', icon: 'lucide:alert-triangle', variant: 'warning', color: 'text-warning' },
    high: { label: 'High Risk', icon: 'lucide:alert-circle', variant: 'error', color: 'text-error' },
    critical: { label: 'Critical', icon: 'lucide:siren', variant: 'error', color: 'text-error' },
  }

  return configs[level] ?? { label: level, icon: 'lucide:info', variant: 'default' as const, color: 'text-text-muted' }
})

// Status configuration
const statusConfig = computed(() => {
  const configs: Record<string, { gradient: string; bgGradient: string; icon: string }> = {
    completed: {
      gradient: 'from-success to-emerald-400',
      bgGradient: 'from-success/10 via-success/5 to-transparent',
      icon: 'lucide:check-circle',
    },
    in_progress: {
      gradient: 'from-accent to-blue-400',
      bgGradient: 'from-accent/10 via-accent/5 to-transparent',
      icon: 'lucide:loader-2',
    },
    queued: {
      gradient: 'from-violet-500 to-purple-400',
      bgGradient: 'from-violet-500/10 via-violet-500/5 to-transparent',
      icon: 'lucide:clock',
    },
    failed: {
      gradient: 'from-error to-rose-400',
      bgGradient: 'from-error/10 via-error/5 to-transparent',
      icon: 'lucide:x-circle',
    },
    skipped: {
      gradient: 'from-text-muted to-slate-400',
      bgGradient: 'from-text-muted/10 via-text-muted/5 to-transparent',
      icon: 'lucide:skip-forward',
    },
  }
  return configs[run.value?.status ?? 'queued'] ?? configs.queued
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

const severityTabs = computed<{ label: string; value: FindingSeverity | 'all'; count: number; color: string; bgColor: string }[]>(() => [
  { label: 'All', value: 'all', count: findingsCount.value, color: 'text-text-primary', bgColor: 'bg-bg-surface' },
  { label: 'Critical', value: FindingSeverity.Critical, count: findingsBySeverity.value[FindingSeverity.Critical] ?? 0, color: 'text-error', bgColor: 'bg-error/10' },
  { label: 'High', value: FindingSeverity.High, count: findingsBySeverity.value[FindingSeverity.High] ?? 0, color: 'text-error', bgColor: 'bg-error/10' },
  { label: 'Medium', value: FindingSeverity.Medium, count: findingsBySeverity.value[FindingSeverity.Medium] ?? 0, color: 'text-warning', bgColor: 'bg-warning/10' },
  { label: 'Low', value: FindingSeverity.Low, count: findingsBySeverity.value[FindingSeverity.Low] ?? 0, color: 'text-success', bgColor: 'bg-success/10' },
  { label: 'Info', value: FindingSeverity.Info, count: findingsBySeverity.value[FindingSeverity.Info] ?? 0, color: 'text-text-muted', bgColor: 'bg-bg-surface' },
])
</script>

<template>
  <BaseContainer size="md">
    <!-- Header Navigation -->
    <div class="mb-8">
      <button
        class="group inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary bg-bg-elevated hover:bg-bg-surface border border-border-subtle hover:border-border-muted rounded-xl transition-all hover:shadow-sm"
        @click="goBack"
      >
        <Icon
          name="lucide:arrow-left"
          class="size-4 group-hover:-translate-x-0.5 transition-transform"
        />
        Back to Runs
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="space-y-6"
    >
      <BaseSkeleton class="h-64 w-full rounded-2xl" />
      <BaseSkeleton class="h-48 w-full rounded-2xl" />
      <BaseSkeleton class="h-96 w-full rounded-2xl" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="rounded-2xl border border-error/20 bg-bg-elevated p-12"
    >
      <div class="mx-auto max-w-md text-center">
        <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-error/10">
          <Icon
            name="lucide:alert-octagon"
            class="size-10 text-error"
          />
        </div>
        <h3 class="mb-2 text-xl font-bold text-text-primary">
          Run not found
        </h3>
        <p class="mb-8 text-sm text-text-secondary">
          {{ error }}
        </p>
        <BaseButton
          variant="secondary"
          @click="goBack"
        >
          <Icon
            name="lucide:arrow-left"
            class="size-4"
          />
          Return to Runs
        </BaseButton>
      </div>
    </div>

    <!-- Skipped Run State -->
    <div
      v-else-if="run && run.status === RunStatus.Skipped && run?.metadata?.skip_reason"
      class="mb-8 overflow-hidden rounded-2xl border border-warning/20 bg-bg-elevated"
    >
      <div class="bg-gradient-to-r from-warning/10 via-warning/5 to-transparent p-6">
        <div class="flex items-start gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-warning/10">
            <Icon
              name="lucide:skip-forward"
              class="size-6 text-warning"
            />
          </div>
          <div class="flex-1">
            <h3 class="mb-1 text-lg font-bold text-text-primary">
              Review Skipped
            </h3>
            <p class="text-sm text-text-secondary leading-relaxed">
              {{ run.metadata.skip_message ?? run.metadata.skip_reason }}
            </p>
            <div
              v-if="run.metadata.skip_message?.toLowerCase().includes('provider key') || run.metadata.skip_reason?.toLowerCase() === 'no_provider_keys'"
              class="mt-4"
            >
              <NuxtLink
                v-if="run.repository_id"
                :to="`/${workspaceSlug}/settings/api-keys`"
                class="inline-flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-2 text-sm font-semibold text-warning transition-colors hover:bg-warning/20"
              >
                <Icon
                  name="lucide:key"
                  class="size-4"
                />
                Configure Provider Keys
                <Icon
                  name="lucide:arrow-right"
                  class="size-4"
                />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-else-if="run">
      <!-- Run Header Card - Hero Section -->
      <section class="relative mb-8 overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated">
        <!-- Background gradient based on status -->
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50"
          :class="statusConfig.bgGradient"
        />

        <!-- Decorative elements -->
        <div
          class="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br opacity-20 blur-3xl"
          :class="statusConfig.gradient"
        />

        <div class="relative p-8">
          <!-- Top Row: Icon + Title + Status -->
          <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex items-start gap-4">
              <div
                class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg"
                :class="statusConfig.gradient"
              >
                <Icon
                  :name="statusConfig.icon"
                  class="size-7 text-white"
                  :class="{ 'animate-spin': run.status === RunStatus.InProgress }"
                />
              </div>
              <div>
                <div class="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    v-if="prNumber"
                    class="font-mono text-lg font-semibold text-text-muted"
                  >
                    #{{ prNumber }}
                  </span>
                  <DomainReviewsRunStatusBadge :status="run.status" />
                  <BaseBadge
                    v-if="isDraft"
                    size="sm"
                    class="border border-border-subtle bg-bg-surface text-text-muted"
                  >
                    <Icon
                      name="lucide:file-edit"
                      class="mr-1 size-3"
                    />
                    Draft
                  </BaseBadge>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-text-primary lg:text-3xl">
                  {{ prTitle || 'Run Details' }}
                </h1>
              </div>
            </div>

            <!-- Verdict & Risk Badges -->
            <div
              v-if="verdictBadge || riskBadge"
              class="flex flex-wrap gap-2"
            >
              <div
                v-if="verdictBadge"
                class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg"
                :class="`bg-gradient-to-r ${verdictBadge.gradient}`"
              >
                <Icon
                  :name="verdictBadge.icon"
                  class="size-4"
                />
                {{ verdictBadge.label }}
              </div>
              <div
                v-if="riskBadge"
                class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
                :class="[
                  riskBadge.color,
                  riskBadge.variant === 'error' ? 'border-error/20 bg-error/10' :
                  riskBadge.variant === 'warning' ? 'border-warning/20 bg-warning/10' :
                  riskBadge.variant === 'success' ? 'border-success/20 bg-success/10' :
                  'border-border-subtle bg-bg-surface'
                ]"
              >
                <Icon
                  :name="riskBadge.icon"
                  class="size-4"
                />
                {{ riskBadge.label }}
              </div>
            </div>
          </div>

          <!-- Labels -->
          <div
            v-if="labels.length > 0"
            class="mb-6 flex flex-wrap gap-2"
          >
            <BaseLabel
              v-for="label in labels"
              :key="label.name"
              :name="label.name"
              :color="label.color"
              size="md"
            />
          </div>

          <!-- Context Row -->
          <div class="flex flex-wrap items-center gap-6 text-sm">
            <div class="flex items-center gap-2.5">
              <div class="flex size-8 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface">
                <Icon
                  name="lucide:folder-git-2"
                  class="size-4 text-text-muted"
                />
              </div>
              <span class="font-semibold text-text-primary">{{ repositoryName }}</span>
            </div>

            <div
              v-if="headBranch"
              class="flex items-center gap-2 font-mono text-sm text-text-secondary"
            >
              <Icon
                name="lucide:git-branch"
                class="size-4 text-text-muted"
              />
              <span>{{ headBranch }}</span>
              <Icon
                name="lucide:arrow-right"
                class="size-3.5 text-text-muted/50"
              />
              <span>{{ baseBranch }}</span>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-px border-t border-border-subtle bg-border-subtle lg:grid-cols-4">
          <!-- Author -->
          <div class="bg-bg-elevated p-6">
            <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Author
            </p>
            <div class="flex items-center gap-3">
              <template v-if="author">
                <BaseAvatar
                  :src="author.avatar_url"
                  :name="author.login"
                  size="md"
                  class="ring-2 ring-border-subtle"
                />
                <span class="text-sm font-semibold text-text-primary">{{ author.login }}</span>
              </template>
              <span
                v-else
                class="text-sm italic text-text-muted"
              >System</span>
            </div>
          </div>

          <!-- Assignees -->
          <div class="bg-bg-elevated p-6">
            <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Assignees
            </p>
            <div
              v-if="assignees.length > 0"
              class="-space-x-2 flex items-center"
            >
              <BaseAvatar
                v-for="user in assignees"
                :key="user.login"
                :src="user.avatar_url"
                :name="user.login"
                size="md"
                class="ring-2 ring-bg-elevated transition-transform hover:z-10 hover:scale-110"
                :title="user.login"
              />
            </div>
            <span
              v-else
              class="text-sm italic text-text-muted"
            >None assigned</span>
          </div>

          <!-- Started -->
          <div class="bg-bg-elevated p-6">
            <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Started
            </p>
            <div class="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Icon
                name="lucide:clock"
                class="size-4 text-text-muted"
              />
              {{ formatRelativeTime(run.started_at || run.created_at) }}
            </div>
          </div>

          <!-- Findings Summary -->
          <div class="bg-bg-elevated p-6">
            <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Findings
            </p>
            <div class="flex items-center gap-3">
              <div
                class="flex size-10 items-center justify-center rounded-xl"
                :class="hasFindings ? 'bg-error/10' : 'bg-success/10'"
              >
                <Icon
                  :name="hasFindings ? 'lucide:alert-circle' : 'lucide:check-circle'"
                  class="size-5"
                  :class="hasFindings ? 'text-error' : 'text-success'"
                />
              </div>
              <div>
                <p
                  class="text-xl font-bold"
                  :class="hasFindings ? 'text-error' : 'text-success'"
                >
                  {{ findingsCount }}
                </p>
                <p class="text-xs text-text-muted">
                  {{ hasFindings ? 'issues found' : 'no issues' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Row -->
        <div
          v-if="metrics"
          class="grid grid-cols-2 gap-6 border-t border-border-subtle bg-bg-surface/50 p-6 lg:grid-cols-4"
        >
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Files Changed
            </p>
            <div class="flex items-center gap-2">
              <Icon
                name="lucide:file-diff"
                class="size-5 text-accent"
              />
              <span class="font-mono text-2xl font-bold text-text-primary">{{ metrics.files_changed }}</span>
            </div>
          </div>
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Lines Changed
            </p>
            <div class="flex items-center gap-2 font-mono text-lg font-semibold">
              <span class="text-success">+{{ metrics.lines_added }}</span>
              <span class="text-text-muted/30">|</span>
              <span class="text-error">-{{ metrics.lines_deleted }}</span>
            </div>
          </div>
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Tokens Used
            </p>
            <div class="flex items-center gap-2">
              <Icon
                name="lucide:zap"
                class="size-5 text-warning"
              />
              <span class="font-mono text-2xl font-bold text-text-primary">{{ metrics.tokens_used_estimated.toLocaleString() }}</span>
            </div>
          </div>
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Duration
            </p>
            <div class="flex items-center gap-2">
              <Icon
                name="lucide:timer"
                class="size-5 text-accent"
              />
              <span class="font-mono text-2xl font-bold text-text-primary">{{ duration || '-' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Policy Snapshot -->
      <section
        v-if="policySnapshot"
        class="mb-8 overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm"
      >
        <div class="border-b border-border-subtle bg-bg-surface/50 p-6">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-bg-elevated">
              <Icon
                name="lucide:sliders-horizontal"
                class="size-5 text-text-muted"
              />
            </div>
            <div>
              <h2 class="text-lg font-bold text-text-primary">
                Policy
              </h2>
              <p class="text-xs text-text-muted">
                Snapshot of the review policy used for this run
              </p>
            </div>
          </div>
        </div>

        <div class="grid gap-6 p-6 lg:grid-cols-2">
          <div class="flex items-start gap-3">
            <div class="flex size-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface">
              <Icon
                name="lucide:folder-check"
                class="size-4 text-text-muted"
              />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Policy Source
              </p>
              <p class="text-sm font-semibold text-text-primary">
                {{ policySource.label }}
              </p>
              <p
                v-if="policySource.detail"
                class="text-xs text-text-muted"
              >
                {{ policySource.detail }}
              </p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="flex size-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface">
              <Icon
                name="lucide:target"
                class="size-4 text-text-muted"
              />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Confidence Threshold
              </p>
              <p class="text-sm font-semibold text-text-primary">
                {{ confidenceLabel }}
              </p>
            </div>
          </div>

          <div class="lg:col-span-2">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Enabled Rules
            </p>
            <div
              v-if="enabledRules.length > 0"
              class="flex flex-wrap gap-2"
            >
              <span
                v-for="rule in enabledRules"
                :key="rule"
                class="inline-flex items-center rounded-full border border-border-subtle bg-bg-surface px-3 py-1 text-xs font-semibold text-text-secondary"
              >
                {{ formatRuleLabel(rule) }}
              </span>
            </div>
            <p
              v-else
              class="text-sm text-text-muted"
            >
              No enabled rules configured
            </p>
          </div>

          <div class="lg:col-span-2">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Ignored Paths
            </p>
            <div
              v-if="ignoredPaths.length > 0"
              class="flex flex-wrap gap-2"
            >
              <span
                v-for="path in ignoredPaths"
                :key="path"
                class="inline-flex items-center rounded-full border border-border-subtle bg-bg-elevated px-3 py-1 text-xs font-mono text-text-secondary"
              >
                {{ path }}
              </span>
            </div>
            <p
              v-else
              class="text-sm text-text-muted"
            >
              No ignored paths configured
            </p>
          </div>
        </div>
      </section>

      <!-- Review Summary Card -->
      <section
        v-if="run.status === RunStatus.Completed || run.status === RunStatus.Failed"
        class="mb-8 overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated shadow-sm"
      >
        <button
          class="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-bg-surface/50"
          @click="isReviewExpanded = !isReviewExpanded"
        >
          <div class="flex items-center gap-4">
            <div class="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 shadow-sm">
              <Icon
                name="lucide:file-text"
                class="size-6 text-accent"
              />
            </div>
            <h2 class="text-xl font-bold text-text-primary">
              Review Summary
            </h2>
          </div>
          <Icon
            name="lucide:chevron-down"
            class="size-5 text-text-muted transition-transform duration-300"
            :class="{ 'rotate-180': isReviewExpanded }"
          />
        </button>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isReviewExpanded"
            class="border-t border-border-subtle px-6 pb-6"
          >
            <div
              v-if="reviewSummary"
              class="space-y-6 pt-6"
            >
              <!-- Overview -->
              <BaseMarkdown
                v-if="reviewSummary.overview"
                :content="reviewSummary.overview"
                class="text-sm leading-relaxed"
              />

              <!-- Strengths & Concerns Grid -->
              <div
                v-if="reviewSummary.strengths?.length || reviewSummary.concerns?.length"
                class="grid gap-6 lg:grid-cols-2"
              >
                <!-- Strengths -->
                <div
                  v-if="reviewSummary.strengths?.length"
                  class="rounded-xl border border-success/20 bg-success/5 p-5"
                >
                  <h3 class="mb-4 flex items-center gap-2 text-sm font-bold text-text-primary">
                    <div class="flex size-8 items-center justify-center rounded-lg bg-success/10">
                      <Icon
                        name="lucide:check-circle"
                        class="size-4 text-success"
                      />
                    </div>
                    Strengths
                  </h3>
                  <ul class="space-y-2.5">
                    <li
                      v-for="(strength, index) in reviewSummary.strengths"
                      :key="index"
                      class="flex items-start gap-3 text-sm leading-relaxed text-text-secondary"
                    >
                      <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-success" />
                      {{ strength }}
                    </li>
                  </ul>
                </div>

                <!-- Concerns -->
                <div
                  class="rounded-xl border p-5"
                  :class="reviewSummary.concerns?.length ? 'border-warning/20 bg-warning/5' : 'border-border-subtle bg-bg-surface'"
                >
                  <h3 class="mb-4 flex items-center gap-2 text-sm font-bold text-text-primary">
                    <div
                      class="flex size-8 items-center justify-center rounded-lg"
                      :class="reviewSummary.concerns?.length ? 'bg-warning/10' : 'bg-bg-elevated'"
                    >
                      <Icon
                        name="lucide:alert-triangle"
                        class="size-4"
                        :class="reviewSummary.concerns?.length ? 'text-warning' : 'text-text-muted'"
                      />
                    </div>
                    Concerns
                  </h3>
                  <ul
                    v-if="reviewSummary.concerns?.length"
                    class="space-y-2.5"
                  >
                    <li
                      v-for="(concern, index) in reviewSummary.concerns"
                      :key="index"
                      class="flex items-start gap-3 text-sm leading-relaxed text-text-secondary"
                    >
                      <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                      {{ concern }}
                    </li>
                  </ul>
                  <p
                    v-else
                    class="text-sm italic text-text-muted"
                  >
                    No concerns identified
                  </p>
                </div>
              </div>

              <!-- Recommendations -->
              <div
                v-if="reviewSummary.recommendations?.length"
                class="rounded-xl border border-accent/20 bg-accent/5 p-5"
              >
                <h3 class="mb-4 flex items-center gap-2 text-sm font-bold text-text-primary">
                  <div class="flex size-8 items-center justify-center rounded-lg bg-accent/10">
                    <Icon
                      name="lucide:lightbulb"
                      class="size-4 text-accent"
                    />
                  </div>
                  Recommendations
                </h3>
                <ul class="space-y-3">
                  <li
                    v-for="(rec, index) in reviewSummary.recommendations"
                    :key="index"
                    class="flex items-start gap-3 text-sm leading-relaxed text-text-secondary"
                  >
                    <Icon
                      name="lucide:check-circle"
                      class="mt-0.5 size-4 shrink-0 text-accent"
                    />
                    {{ rec }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Pending State -->
            <div
              v-else
              class="flex items-center justify-center gap-3 py-12 text-text-muted"
            >
              <Icon
                name="lucide:loader"
                class="size-5 animate-spin"
              />
              <span class="text-sm">Review summary pending...</span>
            </div>
          </div>
        </Transition>
      </section>

      <!-- Findings Section -->
      <section class="space-y-6">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-text-primary">
              Findings
            </h2>
            <p class="mt-1 text-sm text-text-secondary">
              {{ hasFindings ? `${findingsCount} issue${findingsCount !== 1 ? 's' : ''} identified` : 'No issues found' }}
            </p>
          </div>

          <!-- Severity Filter Tabs -->
          <div
            v-if="hasFindings"
            class="w-full overflow-x-auto sm:w-auto"
          >
            <div class="flex min-w-max gap-1 rounded-xl border border-border-subtle bg-bg-elevated p-1.5">
              <button
                v-for="tab in severityTabs"
                :key="tab.value"
                type="button"
                class="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
                :class="selectedSeverity === tab.value
                  ? 'bg-bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:bg-bg-surface/50 hover:text-text-secondary'"
                @click="selectedSeverity = tab.value"
              >
                <span>{{ tab.label }}</span>
                <span
                  class="flex size-5 items-center justify-center rounded-full text-xs font-bold"
                  :class="selectedSeverity === tab.value ? [tab.bgColor, tab.color] : 'bg-bg-surface text-text-muted'"
                >
                  {{ tab.count }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Findings List -->
        <div v-if="hasFindings">
          <DomainReviewsFindingList
            v-if="filteredFindings.length > 0"
            :findings="filteredFindings"
          />

          <!-- Empty Filter State -->
          <div
            v-else
            class="rounded-2xl border border-border-subtle bg-bg-elevated p-12 text-center"
          >
            <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-bg-surface">
              <Icon
                name="lucide:filter"
                class="size-8 text-text-muted"
              />
            </div>
            <h3 class="mb-2 text-lg font-bold text-text-primary">
              No matches found
            </h3>
            <p class="mb-6 text-sm text-text-secondary">
              No findings with this severity level.
            </p>
            <button
              class="rounded-lg bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
              @click="selectedSeverity = 'all'"
            >
              <Icon
                name="lucide:x-circle"
                class="mr-2 inline size-4"
              />
              Clear filter
            </button>
          </div>
        </div>

        <!-- No Findings - Completed -->
        <div
          v-else-if="run.status === RunStatus.Completed"
          class="rounded-2xl border border-success/20 bg-bg-elevated p-12 text-center"
        >
          <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-success/10">
            <Icon
              name="lucide:check-circle-2"
              class="size-10 text-success"
            />
          </div>
          <h3 class="mb-2 text-xl font-bold text-text-primary">
            No findings detected
          </h3>
          <p class="text-sm text-text-secondary">
            Great job! No issues were found in this run.
          </p>
        </div>

        <!-- In Progress -->
        <div
          v-else-if="run.status === RunStatus.Queued || run.status === RunStatus.InProgress"
          class="rounded-2xl border border-accent/20 bg-bg-elevated p-12 text-center"
        >
          <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-accent/10">
            <Icon
              name="lucide:loader"
              class="size-10 animate-spin text-accent"
            />
          </div>
          <h3 class="mb-2 text-xl font-bold text-text-primary">
            Analysis in progress
          </h3>
          <p class="text-sm text-text-secondary">
            Waiting for the review to complete...
          </p>
        </div>

        <!-- Generic Empty -->
        <div
          v-else
          class="rounded-2xl border border-border-subtle bg-bg-elevated p-12 text-center"
        >
          <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-bg-surface">
            <Icon
              name="lucide:search"
              class="size-10 text-text-muted"
            />
          </div>
          <h3 class="mb-2 text-xl font-bold text-text-primary">
            No findings
          </h3>
          <p class="text-sm text-text-secondary">
            No findings have been recorded for this run.
          </p>
        </div>
      </section>
    </template>
  </BaseContainer>
</template>

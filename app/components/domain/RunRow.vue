<script setup lang="ts">
import type { Run } from '~/types'
import { formatRelativeTime } from '~/utils/date'

/**
 * RunRow - Displays a single run in a list
 * Matches premium design of RepositoryRow
 */

interface Props {
  run: Run
  workspaceSlug: string
  showRepository?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRepository: false
})

const pr = computed(() => props.run.pull_request)
const meta = computed(() => props.run.metadata)

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

const pullRequestNumber = computed(() => pr.value?.number ?? meta.value?.pull_request_number)
const pullRequestTitle = computed(() => pr.value?.title ?? meta.value?.pull_request_title)
const isDraft = computed(() => pr.value?.is_draft ?? false)
const labels = computed(() => pr.value?.labels ?? [])

const headBranch = computed(() => pr.value?.head_branch ?? meta.value?.head_branch)
const baseBranch = computed(() => pr.value?.base_branch ?? meta.value?.base_branch)
const riskLevel = computed(() => props.run.summary?.risk_level?.toLowerCase() ?? meta.value?.review_summary?.risk_level?.toLowerCase())
const repositoryName = computed(() => props.run.repository?.full_name ?? meta.value?.repository_full_name as string | undefined)

const runUrl = computed(() => `/${props.workspaceSlug}/runs/${props.run.id}`)

// Format duration
const formattedDuration = computed(() => {
  const ms = props.run.metrics?.duration_ms
  if (!ms) return null
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}m ${s}s`
})

// Limit labels to 3
const visibleLabels = computed(() => {
  return labels.value.slice(0, 3)
})

const remainingLabelsCount = computed(() => Math.max(0, labels.value.length - 3))

// Short SHA
const shortSha = computed(() => {
  const ref = props.run.external_reference
  if (!ref) return null

  if (ref.startsWith('github:')) {
    const sha = ref.replace('github:', '')
    return `github: ${sha.substring(0, 7)}`
  }

  return ref.length > 7 ? ref.substring(0, 7) : ref
})

// Risk level configuration
const riskConfig = computed(() => {
  if (!riskLevel.value) return null
  
  const configs: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    low: { color: 'text-success', bg: 'bg-success-light', icon: 'lucide:shield-check', label: 'Low Risk' },
    medium: { color: 'text-warning', bg: 'bg-warning-light', icon: 'lucide:alert-triangle', label: 'Medium Risk' },
    high: { color: 'text-error', bg: 'bg-error-light', icon: 'lucide:alert-circle', label: 'High Risk' },
    critical: { color: 'text-error', bg: 'bg-error-light', icon: 'lucide:siren', label: 'Critical' },
  }
  
  return configs[riskLevel.value] || { color: 'text-text-muted', bg: 'bg-bg-surface', icon: 'lucide:info', label: riskLevel.value }
})
</script>

<template>
  <NuxtLink
    :to="runUrl"
    class="group block bg-bg-elevated border border-border-subtle rounded-xl px-6 py-4 hover:border-border-muted hover:shadow-sm transition-all duration-200"
  >
    <div class="flex items-center justify-between gap-4">
      <!-- Left Group: Avatar + Main Info -->
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <!-- Avatar -->
        <div class="shrink-0">
          <BaseAvatar
            v-if="author"
            :src="author.avatar_url"
            :name="author.login"
            size="md"
            class="ring-1 ring-border-subtle bg-bg-surface"
          />
          <div 
            v-else
            class="w-10 h-10 rounded-full bg-bg-surface ring-1 ring-border-subtle flex items-center justify-center"
          >
            <Icon
              name="lucide:play-circle"
              class="w-5 h-5 text-text-muted"
            />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <!-- Row 1: Title • Status • Labels -->
          <div class="flex items-center gap-3 mb-1">
            <h3 class="text-sm font-semibold text-text-primary truncate">
              {{ pullRequestTitle || 'Run #' + run.id }}
            </h3>

            <!-- Status (Minimal) -->
            <DomainRunStatusBadge
              :status="run.status"
              variant="minimal"
            />

            <!-- Labels -->
            <div
              v-if="visibleLabels.length > 0"
              class="hidden sm:flex items-center gap-1.5"
            >
              <BaseLabel
                v-for="label in visibleLabels"
                :key="label.name"
                :name="label.name"
                :color="label.color"
                size="sm"
              />
              <span
                v-if="remainingLabelsCount > 0"
                class="text-xs text-text-muted font-medium bg-bg-surface px-1.5 py-0.5 rounded"
              >
                +{{ remainingLabelsCount }}
              </span>
            </div>
          </div>

          <!-- Row 2: Repository + Branch Info -->
          <div class="flex items-center gap-3 text-xs text-text-muted">
            <!-- Repository Name (when showRepository is true) -->
            <div
              v-if="props.showRepository && repositoryName"
              class="flex items-center gap-1.5"
            >
              <Icon
                name="lucide:folder-git-2"
                class="w-3.5 h-3.5"
              />
              <span class="font-medium text-text-secondary">{{ repositoryName }}</span>
              <span class="text-text-muted/30">•</span>
            </div>

            <div class="flex items-center gap-1.5 font-mono">
              <Icon
                name="lucide:git-branch"
                class="w-3.5 h-3.5"
              />
              <template v-if="headBranch && baseBranch">
                <span>{{ headBranch }}</span>
                <span class="text-text-muted/50">→</span>
                <span>{{ baseBranch }}</span>
              </template>
              <span v-else>No branch info</span>
              
              <template v-if="pullRequestNumber">
                <Icon
                  name="lucide:git-pull-request"
                  class="w-3.5 h-3.5 ml-1.5 text-text-muted/50"
                />
                <span>#{{ pullRequestNumber }}</span>
              </template>
              <template v-else-if="shortSha">
                <Icon
                  name="lucide:git-commit-horizontal"
                  class="w-3.5 h-3.5 ml-1.5 text-text-muted/50"
                />
                <span>{{ shortSha }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Group: Metrics + Time + Author -->
      <div class="flex items-center gap-6 shrink-0 text-sm text-text-secondary">
        <!-- Duration -->
        <div
          v-if="formattedDuration"
          class="hidden md:flex items-center gap-1.5 tabular-nums w-20 justify-end"
        >
          <Icon
            name="lucide:play"
            class="w-3 h-3 text-text-muted"
          />
          <span>{{ formattedDuration }}</span>
        </div>
        <div
          v-else
          class="hidden md:block w-20 text-right text-text-muted"
        >
          -
        </div>

        <!-- Time -->
        <div class="hidden sm:block w-24 text-right">
          {{ formatRelativeTime(run.created_at) }}
        </div>

        <!-- Author (Text) -->
        <div
          v-if="author"
          class="hidden lg:block w-32 text-right truncate"
        >
          by {{ author.login }}
        </div>

        <!-- Chevron -->
        <Icon
          name="lucide:chevron-right"
          class="w-4 h-4 text-text-muted/50 group-hover:text-text-muted transition-colors"
        />
      </div>
    </div>
  </NuxtLink>
</template>

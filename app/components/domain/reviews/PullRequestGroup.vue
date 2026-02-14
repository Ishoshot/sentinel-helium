<script setup lang="ts">
import type { PullRequestGroup } from '~/types'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'

const props = defineProps<{
  group: PullRequestGroup
}>()

const isExpanded = ref(true)

const workspaceStore = useWorkspaceStore()
const workspaceSlug = computed(() => workspaceStore.currentWorkspace?.slug ?? workspaceStore.currentWorkspaceSlug)

const defaultStatusDotConfig = { dot: 'bg-zinc-400', label: 'Pending' }
const defaultLatestStatusConfig = {
  bg: 'bg-bg-surface',
  color: 'text-text-muted',
  label: 'Pending',
}

const navigateToRun = (runId: number) => {
  if (!workspaceSlug.value) return
  navigateTo(`/${workspaceSlug.value}/runs/${runId}`)
}

// Status badge config
const getStatusConfig = (status: string) => {
  const configs: Record<string, { dot: string; label: string }> = {
    completed: { dot: 'bg-emerald-500', label: 'Completed' },
    running: { dot: 'bg-amber-500 animate-pulse', label: 'Running' },
    in_progress: { dot: 'bg-amber-500 animate-pulse', label: 'In Progress' },
    failed: { dot: 'bg-red-500', label: 'Failed' },
    skipped: { dot: 'bg-zinc-400', label: 'Skipped' },
    queued: { dot: 'bg-blue-500 animate-pulse', label: 'Queued' },
    pending: { dot: 'bg-zinc-400', label: 'Pending' },
  }
  return configs[status] ?? defaultStatusDotConfig
}

// Latest status badge
const latestStatusConfig = computed(() => {
  const status = props.group.latest_status
  const configs: Record<string, { bg: string; color: string; label: string }> = {
    completed: { bg: 'bg-emerald-500/10', color: 'text-emerald-400', label: 'Completed' },
    running: { bg: 'bg-amber-500/10', color: 'text-amber-400', label: 'Running' },
    in_progress: { bg: 'bg-amber-500/10', color: 'text-amber-400', label: 'In Progress' },
    failed: { bg: 'bg-red-500/10', color: 'text-red-400', label: 'Failed' },
    skipped: { bg: 'bg-bg-surface', color: 'text-text-muted', label: 'Skipped' },
    queued: { bg: 'bg-blue-500/10', color: 'text-blue-400', label: 'Queued' },
    pending: { bg: 'bg-bg-surface', color: 'text-text-muted', label: 'Pending' },
  }
  return configs[status] ?? defaultLatestStatusConfig
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatDuration = (startedAt: string | null, completedAt: string | null) => {
  if (!startedAt || !completedAt) return null
  const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated transition-colors hover:border-border-muted">
    <!-- Header -->
    <button
      type="button"
      class="w-full px-4 py-4 text-left transition-colors hover:bg-bg-hover"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 flex-1 items-start gap-3">
          <!-- PR Icon -->
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bg-surface">
            <Icon
              name="lucide:git-pull-request"
              class="size-5 text-text-muted"
            />
          </div>

          <!-- PR Info -->
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex flex-wrap items-center gap-2">
              <span class="text-xs font-medium text-text-muted">
                #{{ group.pull_request_number }}
              </span>
              <span
                class="rounded px-1.5 py-0.5 text-[10px] font-medium"
                :class="[latestStatusConfig.bg, latestStatusConfig.color]"
              >
                {{ latestStatusConfig.label }}
              </span>
            </div>
            <h3 class="text-sm font-semibold text-text-primary">
              {{ group.pull_request_title || 'Untitled Pull Request' }}
            </h3>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <span class="font-medium text-text-secondary">{{ group.repository.name }}</span>
              <span class="text-border-muted">·</span>
              <span>{{ group.runs_count }} {{ group.runs_count === 1 ? 'run' : 'runs' }}</span>
            </div>
          </div>
        </div>

        <!-- Expand/Collapse -->
        <Icon
          name="lucide:chevron-down"
          class="size-5 shrink-0 text-text-muted transition-transform"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </button>

    <!-- Runs List -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[2000px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-[2000px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-if="isExpanded"
        class="border-t border-border-subtle"
      >
        <div class="divide-y divide-border-subtle">
          <button
            v-for="run in group.runs"
            :key="run.id"
            type="button"
            class="group w-full px-4 py-3 text-left transition-colors hover:bg-bg-hover"
            @click="navigateToRun(run.id)"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <!-- Status dot -->
                <div
                  class="size-2 shrink-0 rounded-full"
                  :class="getStatusConfig(run.status).dot"
                  :title="getStatusConfig(run.status).label"
                />

                <!-- Run info -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-text-primary">
                      {{ formatDate(run.created_at) }}
                    </span>
                    <span
                      v-if="formatDuration(run.started_at, run.completed_at)"
                      class="text-xs text-text-muted"
                    >
                      {{ formatDuration(run.started_at, run.completed_at) }}
                    </span>
                    <span
                      v-if="run.status === 'skipped'"
                      class="rounded bg-bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-muted"
                    >
                      Skipped
                    </span>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    <span v-if="run.metrics">
                      {{ run.metrics.files_changed }} files
                    </span>
                    <span
                      v-if="run.metadata?.sender_login"
                      class="flex items-center gap-1"
                    >
                      <span class="text-border-muted">·</span>
                      {{ run.metadata.sender_login }}
                    </span>
                  </div>
                </div>

                <!-- Findings count -->
                <span
                  v-if="run.findings && run.findings.length > 0"
                  class="shrink-0 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400"
                >
                  {{ run.findings.length }} findings
                </span>
              </div>

              <!-- Arrow -->
              <Icon
                name="lucide:chevron-right"
                class="size-4 shrink-0 text-text-muted/50 transition-colors group-hover:text-text-muted"
              />
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

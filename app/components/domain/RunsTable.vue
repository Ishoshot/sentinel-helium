<script setup lang="ts">
import type { Run } from '~/types'
import { formatRelativeTime } from '~/utils/date'

interface Props {
  runs: readonly Run[]
  workspaceSlug: string
}

defineProps<Props>()

// Helper to format duration
const formatDuration = (ms: number | undefined | null) => {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}m ${s}s`
}

const getReviewTitle = (run: Run) => {
  return run.pull_request?.title ?? run.metadata?.pull_request_title ?? `Run #${run.id}`
}

// Helper to get author info
const getAuthor = (run: Run) => {
  if (run.pull_request?.author) return run.pull_request.author
  if (run.metadata?.sender_login) {
    return {
      login: run.metadata.sender_login as string,
      avatar_url: (run.metadata.sender_avatar_url as string | null) ?? ''
    }
  }
  return null
}

const getRepositoryName = (run: Run) => {
  return run.repository?.full_name ?? (run.metadata?.repository_full_name as string | undefined) ?? 'Unknown Repo'
}
</script>

<template>
  <div class="overflow-hidden bg-bg-elevated border border-border-subtle rounded-xl shadow-subtle">
    <table
      class="min-w-full divide-y divide-border-subtle"
      aria-label="Reviews"
    >
      <caption class="sr-only">
        Reviews
      </caption>
      <thead class="bg-bg-surface">
        <tr>
          <th
            scope="col"
            class="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-12"
          >
            Status
          </th>
          <th
            scope="col"
            class="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
          >
            Review
          </th>
          <th
            scope="col"
            class="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-48"
          >
            Repository
          </th>
          <th
            scope="col"
            class="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-32"
          >
            Author
          </th>
          <th
            scope="col"
            class="px-4 py-2.5 text-right text-xs font-medium text-text-muted uppercase tracking-wider w-24"
          >
            Duration
          </th>
          <th
            scope="col"
            class="px-4 py-2.5 text-right text-xs font-medium text-text-muted uppercase tracking-wider w-32"
          >
            Date
          </th>
        </tr>
      </thead>
      <tbody class="bg-bg-elevated divide-y divide-border-subtle">
        <tr
          v-for="run in runs"
          :key="run.id"
          tabindex="0"
          role="link"
          :aria-label="`Open review: ${getReviewTitle(run)}`"
          class="group cursor-pointer transition-default hover:bg-bg-surface focus-visible:outline-none focus-visible:bg-bg-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
          @click="navigateTo(`/${workspaceSlug}/runs/${run.id}`)"
          @keydown.enter.prevent="navigateTo(`/${workspaceSlug}/runs/${run.id}`)"
        >
          <!-- Status -->
          <td class="px-4 py-2.5 whitespace-nowrap">
            <DomainRunStatusBadge
              :status="run.status"
              variant="minimal"
            />
          </td>

          <!-- Review / PR Info -->
          <td class="px-4 py-2.5">
            <div class="flex flex-col gap-0.5">
              <span
                class="text-sm font-medium text-text-primary truncate max-w-md"
                :title="getReviewTitle(run)"
              >
                {{ getReviewTitle(run) }}
              </span>
              <div class="flex items-center gap-2 text-xs text-text-muted">
                <span
                  v-if="run.pull_request?.number || run.metadata?.pull_request_number"
                  class="font-mono"
                >
                  #{{ run.pull_request?.number ?? run.metadata?.pull_request_number }}
                </span>
                <span
                  v-if="run.pull_request?.is_draft"
                  class="px-1.5 py-0.5 rounded-full bg-bg-surface border border-border-subtle text-[10px]"
                >
                  Draft
                </span>
                <div class="flex items-center gap-1 font-mono">
                  <Icon
                    name="lucide:git-branch"
                    class="w-3 h-3"
                  />
                  <span
                    class="truncate max-w-[150px]"
                    :title="run.pull_request?.head_branch ?? run.metadata?.head_branch ?? ''"
                  >
                    {{ run.pull_request?.head_branch ?? run.metadata?.head_branch }}
                  </span>
                </div>
              </div>
            </div>
          </td>

          <!-- Repository -->
          <td class="px-4 py-2.5 whitespace-nowrap">
            <div class="flex items-center gap-1.5 text-sm text-text-secondary">
              <Icon
                name="lucide:folder-git-2"
                class="w-3.5 h-3.5 text-text-muted"
              />
              <span
                class="truncate max-w-[180px]"
                :title="getRepositoryName(run)"
              >
                {{ getRepositoryName(run) }}
              </span>
            </div>
          </td>

          <!-- Author -->
          <td class="px-4 py-2.5 whitespace-nowrap">
            <div class="flex items-center gap-2">
              <BaseAvatar
                v-if="getAuthor(run)"
                :src="getAuthor(run)?.avatar_url ?? undefined"
                :name="getAuthor(run)?.login ?? 'Unknown'"
                size="sm"
              />
              <span
                class="text-sm text-text-secondary truncate max-w-[100px]"
                :title="getAuthor(run)?.login ?? ''"
              >
                {{ getAuthor(run)?.login ?? '-' }}
              </span>
            </div>
          </td>

          <!-- Duration -->
          <td class="px-4 py-2.5 whitespace-nowrap text-right text-sm text-text-secondary tabular-nums">
            {{ formatDuration(run.metrics?.duration_ms) }}
          </td>

          <!-- Date -->
          <td class="px-4 py-2.5 whitespace-nowrap text-right text-sm text-text-secondary tabular-nums">
            {{ formatRelativeTime(run.created_at) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

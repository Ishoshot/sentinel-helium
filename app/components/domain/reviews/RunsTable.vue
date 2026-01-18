<script setup lang="ts">
import type { Run } from '~/types'
import { formatRelativeTime } from '~/utils/date'
import DomainRunStatusBadge from '~/components/domain/reviews/RunStatusBadge.vue'

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
  <div class="overflow-hidden bg-bg-elevated border border-border-subtle rounded-2xl shadow-sm">
    <!-- Desktop Table View -->
    <div class="hidden lg:block overflow-x-auto">
      <table
        class="min-w-full w-full"
        aria-label="Reviews"
      >
        <caption class="sr-only">
          Reviews
        </caption>
        <thead class="bg-bg-surface/50 backdrop-blur-sm border-b border-border-subtle">
          <tr>
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Review Details
            </th>
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Repository
            </th>
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Author
            </th>
            <th
              scope="col"
              class="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Duration
            </th>
            <th
              scope="col"
              class="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider"
            >
              Created
            </th>
            <th
              scope="col"
              class="px-6 py-4 w-12"
            >
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-bg-elevated divide-y divide-border-subtle/50">
          <tr
            v-for="run in runs"
            :key="run.id"
            tabindex="0"
            role="link"
            :aria-label="`Open review: ${getReviewTitle(run)}`"
            class="group cursor-pointer transition-all duration-200 hover:bg-bg-surface/70 hover:shadow-sm focus-visible:outline-none focus-visible:bg-bg-surface/70 focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-inset"
            @click="navigateTo(`/${workspaceSlug}/runs/${run.id}`)"
            @keydown.enter.prevent="navigateTo(`/${workspaceSlug}/runs/${run.id}`)"
          >
            <!-- Status -->
            <td class="px-6 py-5 whitespace-nowrap">
              <DomainRunStatusBadge
                :status="run.status"
                variant="default"
              />
            </td>

            <!-- Review / PR Info -->
            <td class="px-6 py-5 max-w-md">
              <div class="flex flex-col gap-1.5">
                <span
                  class="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors"
                  :title="getReviewTitle(run)"
                >
                  {{ getReviewTitle(run) }}
                </span>
                <div class="flex items-center gap-3 text-xs text-text-muted">
                  <span
                    v-if="run.pull_request?.number || run.metadata?.pull_request_number"
                    class="inline-flex items-center gap-1 font-mono"
                  >
                    <Icon
                      name="lucide:git-pull-request"
                      class="w-3 h-3"
                    />
                    #{{ run.pull_request?.number ?? run.metadata?.pull_request_number }}
                  </span>
                  <span
                    v-if="run.pull_request?.is_draft"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bg-surface border border-border-subtle text-[10px] font-medium"
                  >
                    <Icon
                      name="lucide:file-edit"
                      class="w-2.5 h-2.5"
                    />
                    Draft
                  </span>
                  <div class="flex items-center gap-1.5 font-mono">
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
            <td class="px-6 py-5 whitespace-nowrap">
              <div class="flex items-center gap-2 text-sm text-text-secondary">
                <div class="w-8 h-8 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center shrink-0">
                  <Icon
                    name="lucide:folder-git-2"
                    class="w-4 h-4 text-text-muted"
                  />
                </div>
                <span
                  class="truncate max-w-[180px] font-medium"
                  :title="getRepositoryName(run)"
                >
                  {{ getRepositoryName(run) }}
                </span>
              </div>
            </td>

            <!-- Author -->
            <td class="px-6 py-5 whitespace-nowrap">
              <div class="flex items-center gap-2.5">
                <BaseAvatar
                  v-if="getAuthor(run)"
                  :src="getAuthor(run)?.avatar_url ?? undefined"
                  :name="getAuthor(run)?.login ?? 'Unknown'"
                  size="md"
                  class="ring-2 ring-border-subtle"
                />
                <div
                  v-else
                  class="w-9 h-9 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center"
                >
                  <Icon
                    name="lucide:user"
                    class="w-4 h-4 text-text-muted"
                  />
                </div>
                <span
                  class="text-sm text-text-secondary truncate max-w-[100px] font-medium"
                  :title="getAuthor(run)?.login ?? ''"
                >
                  {{ getAuthor(run)?.login ?? '-' }}
                </span>
              </div>
            </td>

            <!-- Duration -->
            <td class="px-6 py-5 whitespace-nowrap text-right">
              <div class="inline-flex items-center gap-1.5 text-sm text-text-secondary tabular-nums font-medium">
                <Icon
                  name="lucide:clock"
                  class="w-3.5 h-3.5 text-text-muted"
                />
                {{ formatDuration(run.metrics?.duration_ms) }}
              </div>
            </td>

            <!-- Date -->
            <td class="px-6 py-5 whitespace-nowrap text-right text-sm text-text-secondary tabular-nums">
              {{ formatRelativeTime(run.created_at) }}
            </td>

            <!-- Action -->
            <td class="px-6 py-5 whitespace-nowrap text-right">
              <Icon
                name="lucide:chevron-right"
                class="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="lg:hidden divide-y divide-border-subtle/50">
      <div
        v-for="run in runs"
        :key="run.id"
        tabindex="0"
        role="link"
        :aria-label="`Open review: ${getReviewTitle(run)}`"
        class="group cursor-pointer p-5 transition-all duration-200 hover:bg-bg-surface/70 active:scale-[0.99] focus-visible:outline-none focus-visible:bg-bg-surface/70 focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-inset"
        @click="navigateTo(`/${workspaceSlug}/runs/${run.id}`)"
        @keydown.enter.prevent="navigateTo(`/${workspaceSlug}/runs/${run.id}`)"
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <BaseAvatar
              v-if="getAuthor(run)"
              :src="getAuthor(run)?.avatar_url ?? undefined"
              :name="getAuthor(run)?.login ?? 'Unknown'"
              size="md"
              class="ring-2 ring-border-subtle shrink-0"
            />
            <div
              v-else
              class="w-9 h-9 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center shrink-0"
            >
              <Icon
                name="lucide:user"
                class="w-4 h-4 text-text-muted"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                {{ getReviewTitle(run) }}
              </p>
              <p class="text-xs text-text-muted truncate">
                {{ getAuthor(run)?.login ?? 'Unknown' }}
              </p>
            </div>
          </div>
          <DomainRunStatusBadge
            :status="run.status"
            variant="default"
            class="shrink-0"
          />
        </div>

        <!-- Meta Info -->
        <div class="flex flex-wrap items-center gap-3 text-xs text-text-muted mb-3">
          <span
            v-if="run.pull_request?.number || run.metadata?.pull_request_number"
            class="inline-flex items-center gap-1 font-mono"
          >
            <Icon
              name="lucide:git-pull-request"
              class="w-3 h-3"
            />
            #{{ run.pull_request?.number ?? run.metadata?.pull_request_number }}
          </span>
          <span
            v-if="run.pull_request?.is_draft"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bg-surface border border-border-subtle font-medium"
          >
            <Icon
              name="lucide:file-edit"
              class="w-2.5 h-2.5"
            />
            Draft
          </span>
          <span class="inline-flex items-center gap-1.5 font-mono">
            <Icon
              name="lucide:git-branch"
              class="w-3 h-3"
            />
            {{ run.pull_request?.head_branch ?? run.metadata?.head_branch ?? 'N/A' }}
          </span>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-3 pt-3 border-t border-border-subtle/50">
          <div class="flex items-center gap-2 text-xs text-text-muted">
            <Icon
              name="lucide:folder-git-2"
              class="w-3.5 h-3.5"
            />
            <span class="truncate max-w-[140px] font-medium">{{ getRepositoryName(run) }}</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-text-muted">
            <span class="inline-flex items-center gap-1 tabular-nums">
              <Icon
                name="lucide:clock"
                class="w-3 h-3"
              />
              {{ formatDuration(run.metrics?.duration_ms) }}
            </span>
            <span class="tabular-nums">{{ formatRelativeTime(run.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

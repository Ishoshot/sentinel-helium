<script setup lang="ts">
import type { Run } from '~/types'
import { formatRelativeTime } from '~/utils/date'
import DomainRunStatusBadge from '~/components/domain/reviews/RunStatusBadge.vue'

interface Props {
  runs: readonly Run[]
  workspaceSlug: string
  hideRepository?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hideRepository: false,
})

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

// Get branch info for movement display
const getBranches = (run: Run) => {
  const head = run.pull_request?.head_branch ?? run.metadata?.head_branch as string | undefined
  const base = run.pull_request?.base_branch ?? run.metadata?.base_branch as string | undefined
  return { head, base }
}

// Get PR labels (limit to 3)
const getLabels = (run: Run) => {
  const labels = run.pull_request?.labels ?? []
  return {
    visible: labels.slice(0, 3),
    remaining: Math.max(0, labels.length - 3),
  }
}

// Get risk level config
const getRiskConfig = (run: Run) => {
  const level = run.summary?.risk_level?.toLowerCase() ?? (run.metadata?.review_summary as { risk_level?: string } | undefined)?.risk_level?.toLowerCase()
  if (!level) return null

  const configs: Record<string, { color: string; bg: string; label: string }> = {
    low: { color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Low' },
    medium: { color: 'text-amber-700', bg: 'bg-amber-50', label: 'Medium' },
    high: { color: 'text-red-700', bg: 'bg-red-50', label: 'High' },
    critical: { color: 'text-red-700', bg: 'bg-red-50', label: 'Critical' },
  }

  return configs[level] || null
}

// Get findings count
const getFindingsCount = (run: Run) => {
  return run.findings?.length ?? run.metrics?.findings_count ?? 0
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
    <!-- Desktop Table View -->
    <div class="hidden lg:block overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50/50">
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Status
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Review
            </th>
            <th
              v-if="!props.hideRepository"
              class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              Repository
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Author
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
              Duration
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
              Created
            </th>
            <th class="w-10 px-4 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="run in runs"
            :key="run.id"
            tabindex="0"
            role="link"
            class="group cursor-pointer transition-colors hover:bg-gray-50"
            @click="navigateTo(`/${workspaceSlug}/runs/${run.id}`)"
            @keydown.enter.prevent="navigateTo(`/${workspaceSlug}/runs/${run.id}`)"
          >
            <!-- Status -->
            <td class="px-4 py-4 whitespace-nowrap">
              <DomainRunStatusBadge
                :status="run.status"
                variant="badge"
              />
            </td>

            <!-- Review / PR Info -->
            <td class="px-4 py-4 max-w-md">
              <div class="space-y-1">
                <!-- Title row with labels -->
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="text-sm font-medium text-gray-900 group-hover:text-gray-700"
                    :title="getReviewTitle(run)"
                  >
                    {{ getReviewTitle(run) }}
                  </span>
                  <!-- Labels -->
                  <template v-if="getLabels(run).visible.length > 0">
                    <BaseLabel
                      v-for="label in getLabels(run).visible"
                      :key="label.name"
                      :name="label.name"
                      :color="label.color"
                      size="sm"
                    />
                    <span
                      v-if="getLabels(run).remaining > 0"
                      class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
                    >
                      +{{ getLabels(run).remaining }}
                    </span>
                  </template>
                  <!-- Risk Level -->
                  <span
                    v-if="getRiskConfig(run)"
                    class="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    :class="[getRiskConfig(run)?.bg, getRiskConfig(run)?.color]"
                  >
                    {{ getRiskConfig(run)?.label }}
                  </span>
                  <!-- Findings -->
                  <span
                    v-if="getFindingsCount(run) > 0"
                    class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                  >
                    {{ getFindingsCount(run) }} {{ getFindingsCount(run) === 1 ? 'finding' : 'findings' }}
                  </span>
                </div>
                <!-- Meta row -->
                <div class="flex items-center gap-3 text-xs text-gray-500">
                  <span
                    v-if="run.pull_request?.number || run.metadata?.pull_request_number"
                    class="inline-flex items-center gap-1 font-mono"
                  >
                    <Icon
                      name="lucide:git-pull-request"
                      class="size-3"
                    />
                    #{{ run.pull_request?.number ?? run.metadata?.pull_request_number }}
                  </span>
                  <span
                    v-if="run.pull_request?.is_draft"
                    class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
                  >
                    Draft
                  </span>
                  <!-- Branch movement -->
                  <div
                    v-if="getBranches(run).head"
                    class="flex items-center gap-1 font-mono"
                  >
                    <Icon
                      name="lucide:git-branch"
                      class="size-3"
                    />
                    <span class="max-w-[100px] truncate">{{ getBranches(run).head }}</span>
                    <template v-if="getBranches(run).base">
                      <span class="text-gray-300">→</span>
                      <span class="max-w-[80px] truncate">{{ getBranches(run).base }}</span>
                    </template>
                  </div>
                </div>
              </div>
            </td>

            <!-- Repository -->
            <td
              v-if="!props.hideRepository"
              class="px-4 py-4 whitespace-nowrap"
            >
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <div class="flex size-8 items-center justify-center rounded-lg bg-gray-100">
                  <Icon
                    name="lucide:folder-git-2"
                    class="size-4 text-gray-500"
                  />
                </div>
                <span
                  class="max-w-[180px] truncate"
                  :title="getRepositoryName(run)"
                >
                  {{ getRepositoryName(run) }}
                </span>
              </div>
            </td>

            <!-- Author -->
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <BaseAvatar
                  v-if="getAuthor(run)"
                  :src="getAuthor(run)?.avatar_url ?? undefined"
                  :name="getAuthor(run)?.login ?? 'Unknown'"
                  size="sm"
                />
                <div
                  v-else
                  class="flex size-8 items-center justify-center rounded-full bg-gray-100"
                >
                  <Icon
                    name="lucide:user"
                    class="size-4 text-gray-400"
                  />
                </div>
                <span class="max-w-[100px] truncate text-sm text-gray-600">
                  {{ getAuthor(run)?.login ?? '-' }}
                </span>
              </div>
            </td>

            <!-- Duration -->
            <td class="px-4 py-4 whitespace-nowrap text-right">
              <span class="inline-flex items-center gap-1.5 text-sm tabular-nums text-gray-500">
                <Icon
                  name="lucide:clock"
                  class="size-3.5"
                />
                {{ formatDuration(run.metrics?.duration_ms) }}
              </span>
            </td>

            <!-- Date -->
            <td class="px-4 py-4 whitespace-nowrap text-right text-sm tabular-nums text-gray-500">
              {{ formatRelativeTime(run.created_at) }}
            </td>

            <!-- Action -->
            <td class="px-4 py-4 whitespace-nowrap">
              <Icon
                name="lucide:chevron-right"
                class="size-4 text-gray-300 group-hover:text-gray-500"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Card View -->
    <div class="lg:hidden divide-y divide-gray-100">
      <div
        v-for="run in runs"
        :key="run.id"
        tabindex="0"
        role="link"
        class="group cursor-pointer p-4 transition-colors hover:bg-gray-50"
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
              size="sm"
            />
            <div
              v-else
              class="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100"
            >
              <Icon
                name="lucide:user"
                class="size-4 text-gray-400"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900">
                {{ getReviewTitle(run) }}
              </p>
              <p class="text-xs text-gray-500">
                {{ getAuthor(run)?.login ?? 'Unknown' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span
              v-if="getRiskConfig(run)"
              class="rounded px-1.5 py-0.5 text-[10px] font-medium"
              :class="[getRiskConfig(run)?.bg, getRiskConfig(run)?.color]"
            >
              {{ getRiskConfig(run)?.label }}
            </span>
            <DomainRunStatusBadge
              :status="run.status"
              variant="badge"
            />
          </div>
        </div>

        <!-- Labels -->
        <div
          v-if="getLabels(run).visible.length > 0"
          class="flex flex-wrap items-center gap-1.5 mb-3"
        >
          <BaseLabel
            v-for="label in getLabels(run).visible"
            :key="label.name"
            :name="label.name"
            :color="label.color"
            size="sm"
          />
          <span
            v-if="getLabels(run).remaining > 0"
            class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
          >
            +{{ getLabels(run).remaining }}
          </span>
        </div>

        <!-- Meta Info -->
        <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
          <span
            v-if="run.pull_request?.number || run.metadata?.pull_request_number"
            class="inline-flex items-center gap-1 font-mono"
          >
            <Icon
              name="lucide:git-pull-request"
              class="size-3"
            />
            #{{ run.pull_request?.number ?? run.metadata?.pull_request_number }}
          </span>
          <span
            v-if="run.pull_request?.is_draft"
            class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium"
          >
            Draft
          </span>
          <div
            v-if="getBranches(run).head"
            class="inline-flex items-center gap-1 font-mono"
          >
            <Icon
              name="lucide:git-branch"
              class="size-3"
            />
            <span class="max-w-[80px] truncate">{{ getBranches(run).head }}</span>
            <template v-if="getBranches(run).base">
              <span class="text-gray-300">→</span>
              <span class="max-w-[60px] truncate">{{ getBranches(run).base }}</span>
            </template>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div
            v-if="!props.hideRepository"
            class="flex items-center gap-2 text-xs text-gray-500"
          >
            <Icon
              name="lucide:folder-git-2"
              class="size-3.5"
            />
            <span class="max-w-[140px] truncate">{{ getRepositoryName(run) }}</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span class="inline-flex items-center gap-1 tabular-nums">
              <Icon
                name="lucide:clock"
                class="size-3"
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

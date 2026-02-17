<script setup lang="ts">
/**
 * RepositoryActivityTable - Repository activity overview
 * Shows most active repositories with runs and findings counts
 */
import type { RepositoryActivity } from '~/types'
import { formatRelativeTime } from '~/utils/date'

interface Props {
  data: RepositoryActivity[]
  isLoading?: boolean
}

defineProps<Props>()
</script>

<template>
  <BaseCard padding="none">
    <div class="p-5">
      <div class="mb-4">
        <div class="flex items-center gap-2">
          <Icon
            name="lucide:git-fork"
            class="w-4 h-4 text-accent"
          />
          <h3 class="text-base font-medium text-text-primary">
            Repository Activity
          </h3>
        </div>
        <p class="mt-1 text-sm text-text-muted">
          Most active repositories by review count
        </p>
      </div>

      <div
        v-if="isLoading"
        class="space-y-3"
      >
        <div
          v-for="i in 5"
          :key="i"
          class="flex items-center gap-4 p-3 bg-bg-surface rounded-lg border border-border-subtle"
        >
          <div class="flex-shrink-0 w-8 text-center">
            <div class="h-6 w-4 mx-auto bg-bg-hover rounded skeleton" />
          </div>
          <div class="w-10 h-10 rounded-full bg-bg-hover skeleton" />
          <div class="flex-1 space-y-2">
            <div class="h-4 w-44 bg-bg-hover rounded skeleton" />
            <div class="h-3 w-32 bg-bg-hover rounded skeleton" />
          </div>
          <div class="flex items-center gap-6">
            <div class="text-center space-y-1">
              <div class="h-4 w-8 bg-bg-hover rounded skeleton" />
              <div class="h-3 w-8 bg-bg-hover rounded skeleton" />
            </div>
            <div class="text-center space-y-1">
              <div class="h-4 w-8 bg-bg-hover rounded skeleton" />
              <div class="h-3 w-14 bg-bg-hover rounded skeleton" />
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="data.length > 0"
        class="space-y-3 max-h-[400px] overflow-y-auto pr-1"
      >
        <div
          v-for="(repo, index) in data"
          :key="repo.repository_id"
          class="flex items-center gap-4 p-3 bg-bg-surface rounded-lg border border-border-subtle hover:bg-bg-hover transition-colors cursor-pointer"
        >
          <div class="flex-shrink-0 w-8 text-center">
            <span class="text-lg font-bold text-text-muted">{{ index + 1 }}</span>
          </div>

          <div
            class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"
          >
            <Icon
              name="lucide:folder-git-2"
              class="w-5 h-5 text-accent"
            />
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-text-primary truncate">
              {{ repo.repository_name }}
            </p>
            <p class="text-xs text-text-muted">
              {{ repo.last_run_at ? `Last run ${formatRelativeTime(repo.last_run_at)}` : 'No runs yet' }}
            </p>
          </div>

          <div class="flex items-center gap-6 text-sm">
            <div class="text-center">
              <p class="font-semibold text-text-primary">
                {{ repo.runs_count }}
              </p>
              <p class="text-xs text-text-muted">
                Runs
              </p>
            </div>

            <div class="text-center">
              <p class="font-semibold text-text-primary">
                {{ repo.findings_count }}
              </p>
              <p class="text-xs text-text-muted">
                Findings
              </p>
            </div>
          </div>
        </div>
      </div>

      <BaseEmptyState
        v-else
        icon="lucide:folder-git-2"
        title="No repository data"
        description="Repository activity will appear once reviews are run"
      />
    </div>
  </BaseCard>
</template>

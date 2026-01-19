<script setup lang="ts">
/**
 * DeveloperLeaderboardTable - Developer performance leaderboard
 * Shows most active developers with their performance metrics
 */
import type { DeveloperStats } from '~/types'

interface Props {
  data: DeveloperStats[]
  isLoading?: boolean
}

defineProps<Props>()

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}
</script>

<template>
  <BaseCard padding="none">
    <div class="p-5">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-text-primary">
          Developer Leaderboard
        </h3>
        <p class="mt-1 text-sm text-text-muted">
          Most active developers and their performance
        </p>
      </div>

      <div
        v-if="isLoading"
        class="flex items-center justify-center py-12"
      >
        <BaseSpinner size="lg" />
      </div>

      <div
        v-else-if="data.length > 0"
        class="space-y-3"
      >
        <div
          v-for="(developer, index) in data"
          :key="developer.id"
          class="flex items-center gap-4 p-3 bg-bg-surface rounded-lg border border-border-subtle"
        >
          <div class="flex-shrink-0 w-8 text-center">
            <span class="text-lg font-bold text-text-muted">{{ index + 1 }}</span>
          </div>

          <img
            v-if="developer.avatar_url"
            :src="developer.avatar_url"
            :alt="developer.name"
            class="w-10 h-10 rounded-full"
          >
          <div
            v-else
            class="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"
          >
            <Icon
              name="lucide:user"
              class="w-5 h-5 text-accent"
            />
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-text-primary truncate">
              {{ developer.name }}
            </p>
            <p class="text-xs text-text-muted truncate">
              {{ developer.email }}
            </p>
          </div>

          <div class="flex items-center gap-6 text-sm">
            <div class="text-center">
              <p class="font-semibold text-text-primary">
                {{ developer.runs_count }}
              </p>
              <p class="text-xs text-text-muted">
                Runs
              </p>
            </div>

            <div class="text-center">
              <p class="font-semibold text-text-primary">
                {{ developer.successful_runs }}
              </p>
              <p class="text-xs text-text-muted">
                Success
              </p>
            </div>

            <div class="text-center">
              <p class="font-semibold text-text-primary">
                {{ formatDuration(developer.avg_duration) }}
              </p>
              <p class="text-xs text-text-muted">
                Avg Time
              </p>
            </div>
          </div>
        </div>
      </div>

      <BaseEmptyState
        v-else
        icon="lucide:users"
        title="No developer data"
        description="Developer activity will appear once reviews are run"
      />
    </div>
  </BaseCard>
</template>

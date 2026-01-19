<script setup lang="ts">
/**
 * AnalyticsOverview - Overview metrics cards
 * Displays key workspace metrics
 */
import DomainWorkspaceStatCard from '~/components/domain/workspace/StatCard.vue'
import type { OverviewMetrics } from '~/types'

interface Props {
  metrics: OverviewMetrics | null
  isLoading?: boolean
}

const props = defineProps<Props>()

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

const overviewCards = computed(() => [
  {
    label: 'Total Runs',
    value: props.metrics?.total_runs ?? 0,
    description: 'Code reviews executed',
    icon: 'lucide:play-circle',
  },
  {
    label: 'Total Findings',
    value: props.metrics?.total_findings ?? 0,
    description: 'Issues discovered',
    icon: 'lucide:alert-circle',
  },
  {
    label: 'Avg Duration',
    value: props.metrics ? formatDuration(props.metrics.average_duration_seconds) : '0s',
    description: 'Average review time',
    icon: 'lucide:timer',
  },
  {
    label: 'Active Repositories',
    value: props.metrics?.active_repositories ?? 0,
    description: 'Repositories with recent activity',
    icon: 'lucide:folder-git-2',
  },
])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <template v-if="isLoading">
      <BaseCard
        v-for="i in 4"
        :key="i"
        padding="lg"
      >
        <div class="flex items-center justify-center h-20">
          <BaseSpinner />
        </div>
      </BaseCard>
    </template>

    <DomainWorkspaceStatCard
      v-for="card in overviewCards"
      v-else
      :key="card.label"
      :label="card.label"
      :value="card.value"
      :description="card.description"
      :icon="card.icon"
    />
  </div>
</template>

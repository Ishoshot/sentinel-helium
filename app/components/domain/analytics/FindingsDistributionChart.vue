<script setup lang="ts">
/**
 * FindingsDistributionChart - Findings by severity distribution
 * Shows distribution of findings across severity levels
 */
import type { FindingsDistribution } from '~/types'
import type { ChartData, ChartOptions } from 'chart.js'
import AnalyticsChart from './AnalyticsChart.vue'

interface Props {
  data: FindingsDistribution[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const severityColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  info: '#71717a',
}

const chartData = computed<ChartData>(() => ({
  labels: props.data.map(
    (item) => item.severity.charAt(0).toUpperCase() + item.severity.slice(1)
  ),
  datasets: [
    {
      data: props.data.map((item) => item.count),
      backgroundColor: props.data.map(
        (item) => severityColors[item.severity] || '#71717a'
      ),
      borderWidth: 2,
      borderColor: '#18181b',
      hoverOffset: 4,
    },
  ],
}))

const chartOptions = {
  cutout: '70%',
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#a1a1aa',
        padding: 16,
      },
    },
  },
} as unknown as ChartOptions
</script>

<template>
  <AnalyticsChart
    v-if="!isLoading && data.length > 0"
    type="doughnut"
    :data="chartData"
    :options="chartOptions"
    title="Findings by Severity"
    description="Distribution of findings across severity levels"
    height="400px"
  />
  <BaseCard
    v-else-if="isLoading"
    padding="lg"
  >
    <div class="space-y-4">
      <div class="space-y-2">
        <div class="h-5 w-40 bg-bg-hover rounded skeleton" />
        <div class="h-4 w-56 bg-bg-hover rounded skeleton" />
      </div>
      <div class="h-80 bg-bg-hover rounded-xl skeleton" />
    </div>
  </BaseCard>
  <BaseCard
    v-else
    padding="lg"
  >
    <BaseEmptyState
      icon="lucide:pie-chart"
      title="No findings yet"
      description="Start reviewing code to see finding distributions"
    />
  </BaseCard>
</template>

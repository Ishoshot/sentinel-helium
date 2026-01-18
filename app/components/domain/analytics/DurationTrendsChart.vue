<script setup lang="ts">
/**
 * DurationTrendsChart - Review duration trends
 * Shows average, min, and max review duration over time
 */
import type { DurationTrend } from '~/types'
import type { ChartData, ChartOptions } from 'chart.js'
import AnalyticsChart from './AnalyticsChart.vue'

interface Props {
  data: DurationTrend[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

const chartData = computed<ChartData>(() => ({
  labels: props.data.map((item) => item.date),
  datasets: [
    {
      label: 'Average',
      data: props.data.map((item) => item.avg_duration),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Min',
      data: props.data.map((item) => item.min_duration),
      borderColor: '#10b981',
      backgroundColor: 'transparent',
      tension: 0.4,
      borderDash: [5, 5],
    },
    {
      label: 'Max',
      data: props.data.map((item) => item.max_duration),
      borderColor: '#f59e0b',
      backgroundColor: 'transparent',
      tension: 0.4,
      borderDash: [5, 5],
    },
  ],
}))

const chartOptions: ChartOptions = {
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => formatDuration(Number(value)),
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          return `${label}: ${formatDuration(value)}`
        },
      },
    },
  },
}
</script>

<template>
  <AnalyticsChart
    v-if="!isLoading && data.length > 0"
    type="line"
    :data="chartData"
    :options="chartOptions"
    title="Review Duration Trends"
    description="Average, minimum, and maximum review duration over time"
    height="400px"
  />
  <BaseCard v-else-if="isLoading" padding="lg">
    <div class="flex items-center justify-center h-64">
      <BaseSpinner size="lg" />
    </div>
  </BaseCard>
  <BaseCard v-else padding="lg">
    <BaseEmptyState
      icon="lucide:clock"
      title="No duration data"
      description="Run code reviews to track duration trends"
    />
  </BaseCard>
</template>

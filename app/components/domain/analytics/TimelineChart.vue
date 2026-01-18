<script setup lang="ts">
/**
 * TimelineChart - Run activity timeline chart
 * Shows successful vs failed runs over time
 */
import type { TimelineData } from '~/types'
import type { ChartData, ChartOptions } from 'chart.js'
import AnalyticsChart from './AnalyticsChart.vue'

interface Props {
  data: TimelineData[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const chartData = computed<ChartData>(() => ({
  labels: props.data.map((item) => item.date),
  datasets: [
    {
      label: 'Successful',
      data: props.data.map((item) => item.successful),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Failed',
      data: props.data.map((item) => item.failed),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
}))

const chartOptions: ChartOptions = {
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
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
    title="Run Activity"
    description="Successful and failed runs over time"
    height="400px"
  />
  <BaseCard v-else-if="isLoading" padding="lg">
    <div class="flex items-center justify-center h-64">
      <BaseSpinner size="lg" />
    </div>
  </BaseCard>
  <BaseCard v-else padding="lg">
    <BaseEmptyState
      icon="lucide:chart-line"
      title="No data available"
      description="Run some code reviews to see activity data"
    />
  </BaseCard>
</template>

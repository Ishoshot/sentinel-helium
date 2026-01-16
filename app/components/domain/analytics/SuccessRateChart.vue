<script setup lang="ts">
/**
 * SuccessRateChart - Success vs failure rate
 * Shows success rate percentage over time
 */
import type { SuccessRate } from '~/types'
import type { ChartData, ChartOptions } from 'chart.js'
import AnalyticsChart from './AnalyticsChart.vue'

interface Props {
  data: SuccessRate[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const chartData = computed<ChartData>(() => ({
  labels: props.data.map((item) => item.date),
  datasets: [
    {
      label: 'Success Rate %',
      data: props.data.map((item) => item.success_rate),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
}))

const chartOptions: ChartOptions = {
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value) => `${value}%`,
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
    title="Success Rate"
    description="Percentage of successful runs over time"
    height="400px"
  />
  <BaseCard v-else-if="isLoading" padding="lg">
    <div class="flex items-center justify-center h-64">
      <BaseSpinner size="lg" />
    </div>
  </BaseCard>
  <BaseCard v-else padding="lg">
    <BaseEmptyState
      icon="lucide:trending-up"
      title="No success rate data"
      description="Run code reviews to track success metrics"
    />
  </BaseCard>
</template>

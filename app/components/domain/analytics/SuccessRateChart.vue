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
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#10b981',
      pointHoverBorderColor: '#18181b',
      pointHoverBorderWidth: 2,
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
    icon="lucide:check-circle-2"
    icon-color="text-emerald-400"
    title="Success Rate"
    description="Percentage of successful runs over time"
    height="400px"
  />
  <BaseCard
    v-else-if="isLoading"
    padding="lg"
  >
    <div class="space-y-4">
      <div class="space-y-2">
        <div class="h-5 w-28 bg-bg-hover rounded skeleton" />
        <div class="h-4 w-60 bg-bg-hover rounded skeleton" />
      </div>
      <div class="h-80 bg-bg-hover rounded-xl skeleton" />
    </div>
  </BaseCard>
  <BaseCard
    v-else
    padding="lg"
  >
    <BaseEmptyState
      icon="lucide:trending-up"
      title="No success rate data"
      description="Run code reviews to track success metrics"
    />
  </BaseCard>
</template>

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
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#10b981',
      pointHoverBorderColor: '#18181b',
      pointHoverBorderWidth: 2,
    },
    {
      label: 'Failed',
      data: props.data.map((item) => item.failed),
      borderColor: '#f43f5e',
      backgroundColor: 'rgba(244, 63, 94, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#f43f5e',
      pointHoverBorderColor: '#18181b',
      pointHoverBorderWidth: 2,
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
  <BaseCard
    v-else-if="isLoading"
    padding="lg"
  >
    <div class="space-y-4">
      <div class="space-y-2">
        <div class="h-5 w-32 bg-bg-hover rounded skeleton" />
        <div class="h-4 w-48 bg-bg-hover rounded skeleton" />
      </div>
      <div class="h-80 bg-bg-hover rounded-xl skeleton" />
    </div>
  </BaseCard>
  <BaseCard
    v-else
    padding="lg"
  >
    <BaseEmptyState
      icon="lucide:chart-line"
      title="No data available"
      description="Run some code reviews to see activity data"
    />
  </BaseCard>
</template>

<script setup lang="ts">
/**
 * VelocityChart - Review velocity metrics
 * Shows review throughput and completion rate over time
 */
import type { Velocity } from '~/types'
import type { ChartData, ChartOptions } from 'chart.js'
import AnalyticsChart from './AnalyticsChart.vue'

interface Props {
  data: Velocity[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const chartData = computed<ChartData>(() => ({
  labels: props.data.map((item) => item.period),
  datasets: [
    {
      label: 'Total Reviews',
      data: props.data.map((item) => item.reviews_count),
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(20, 184, 166, 0.6)',
      type: 'bar',
      borderRadius: 4,
    },
    {
      label: 'Completed',
      data: props.data.map((item) => item.completed_count),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      type: 'bar',
      borderRadius: 4,
    },
    {
      label: 'Active Repos',
      data: props.data.map((item) => item.active_repositories),
      borderColor: '#f59e0b',
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0.4,
      type: 'line',
      yAxisID: 'y1',
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#f59e0b',
      pointHoverBorderColor: '#18181b',
      pointHoverBorderWidth: 2,
    },
  ],
}))

const chartOptions: ChartOptions = {
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
      title: {
        display: true,
        text: 'Reviews',
      },
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        precision: 0,
      },
      title: {
        display: true,
        text: 'Active Repositories',
      },
    },
  },
}
</script>

<template>
  <AnalyticsChart
    v-if="!isLoading && data.length > 0"
    type="bar"
    :data="chartData"
    :options="chartOptions"
    icon="lucide:zap"
    icon-color="text-amber-400"
    title="Review Velocity"
    description="Review throughput and active repositories over time"
    height="400px"
  />
  <BaseCard
    v-else-if="isLoading"
    padding="lg"
  >
    <div class="space-y-4">
      <div class="space-y-2">
        <div class="h-5 w-32 bg-bg-hover rounded skeleton" />
        <div class="h-4 w-64 bg-bg-hover rounded skeleton" />
      </div>
      <div class="h-80 bg-bg-hover rounded-xl skeleton" />
    </div>
  </BaseCard>
  <BaseCard
    v-else
    padding="lg"
  >
    <BaseEmptyState
      icon="lucide:zap"
      title="No velocity data"
      description="Run code reviews to track review velocity"
    />
  </BaseCard>
</template>

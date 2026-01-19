<script setup lang="ts">
/**
 * ResolutionRateChart - Finding resolution/annotation rate
 * Shows how quickly findings are being addressed over time
 */
import type { ResolutionRate } from '~/types'
import type { ChartData, ChartOptions } from 'chart.js'
import AnalyticsChart from './AnalyticsChart.vue'

interface Props {
  data: ResolutionRate[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const chartData = computed<ChartData>(() => ({
  labels: props.data.map((item) => item.date),
  datasets: [
    {
      label: 'Resolution Rate %',
      data: props.data.map((item) => item.annotation_rate),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
      yAxisID: 'y',
    },
    {
      label: 'Resolved',
      data: props.data.map((item) => item.annotated_findings),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
      type: 'bar',
      yAxisID: 'y1',
    },
    {
      label: 'Total Findings',
      data: props.data.map((item) => item.total_findings),
      borderColor: '#94a3b8',
      backgroundColor: 'rgba(148, 163, 184, 0.3)',
      type: 'bar',
      yAxisID: 'y1',
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
      max: 100,
      ticks: {
        callback: (value) => `${value}%`,
      },
      title: {
        display: true,
        text: 'Resolution Rate',
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
        text: 'Findings Count',
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
    title="Finding Resolution Rate"
    description="Percentage of findings resolved and total counts over time"
    height="400px"
  />
  <BaseCard
    v-else-if="isLoading"
    padding="lg"
  >
    <div class="flex items-center justify-center h-64">
      <BaseSpinner size="lg" />
    </div>
  </BaseCard>
  <BaseCard
    v-else
    padding="lg"
  >
    <BaseEmptyState
      icon="lucide:check-circle"
      title="No resolution data"
      description="Resolution metrics will appear once findings are addressed"
    />
  </BaseCard>
</template>

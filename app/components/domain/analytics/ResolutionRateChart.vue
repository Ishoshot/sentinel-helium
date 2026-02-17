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
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      yAxisID: 'y',
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#10b981',
      pointHoverBorderColor: '#18181b',
      pointHoverBorderWidth: 2,
    },
    {
      label: 'Resolved',
      data: props.data.map((item) => item.annotated_findings),
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(20, 184, 166, 0.6)',
      type: 'bar',
      yAxisID: 'y1',
      borderRadius: 4,
    },
    {
      label: 'Total Findings',
      data: props.data.map((item) => item.total_findings),
      borderColor: '#3f3f46',
      backgroundColor: 'rgba(63, 63, 70, 0.4)',
      type: 'bar',
      yAxisID: 'y1',
      borderRadius: 4,
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
    icon="lucide:target"
    icon-color="text-accent"
    title="Finding Resolution Rate"
    description="Percentage of findings resolved and total counts over time"
    height="400px"
  />
  <BaseCard
    v-else-if="isLoading"
    padding="lg"
  >
    <div class="space-y-4">
      <div class="space-y-2">
        <div class="h-5 w-44 bg-bg-hover rounded skeleton" />
        <div class="h-4 w-72 bg-bg-hover rounded skeleton" />
      </div>
      <div class="h-80 bg-bg-hover rounded-xl skeleton" />
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

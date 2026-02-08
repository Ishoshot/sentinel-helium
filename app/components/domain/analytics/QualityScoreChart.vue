<script setup lang="ts">
/**
 * QualityScoreChart - Code quality score trend
 * Shows code quality score based on finding severity
 */
import type { QualityScore } from '~/types'
import type { ChartData, ChartOptions } from 'chart.js'
import AnalyticsChart from './AnalyticsChart.vue'

interface Props {
  data: QualityScore[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const chartData = computed<ChartData>(() => ({
  labels: props.data.map((item) => item.date),
  datasets: [
    {
      label: 'Quality Score',
      data: props.data.map((item) => item.quality_score),
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(20, 184, 166, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#14b8a6',
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
        callback: (value) => `${value}`,
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
    title="Code Quality Score"
    description="Quality score based on finding severity (100 = perfect)"
    height="400px"
  />
  <BaseCard
    v-else-if="isLoading"
    padding="lg"
  >
    <div class="space-y-4">
      <div class="space-y-2">
        <div class="h-5 w-36 bg-bg-hover rounded skeleton" />
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
      icon="lucide:shield-check"
      title="No quality data"
      description="Code quality metrics will appear after reviews"
    />
  </BaseCard>
</template>

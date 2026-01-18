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
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
  <BaseCard v-else-if="isLoading" padding="lg">
    <div class="flex items-center justify-center h-64">
      <BaseSpinner size="lg" />
    </div>
  </BaseCard>
  <BaseCard v-else padding="lg">
    <BaseEmptyState
      icon="lucide:shield-check"
      title="No quality data"
      description="Code quality metrics will appear after reviews"
    />
  </BaseCard>
</template>

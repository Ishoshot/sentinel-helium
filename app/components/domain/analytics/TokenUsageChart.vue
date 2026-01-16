<script setup lang="ts">
/**
 * TokenUsageChart - Token usage over time
 * Shows input/output token consumption trends
 */
import type { TokenUsage } from '~/types'
import type { ChartData, ChartOptions } from 'chart.js'
import AnalyticsChart from './AnalyticsChart.vue'

interface Props {
  data: TokenUsage[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const chartData = computed<ChartData>(() => ({
  labels: props.data.map((item) => item.date),
  datasets: [
    {
      label: 'Input Tokens',
      data: props.data.map((item) => item.total_input_tokens),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Output Tokens',
      data: props.data.map((item) => item.total_output_tokens),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
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
        callback: (value) => {
          const num = Number(value)
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
          if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
          return num.toString()
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
    title="Token Usage"
    description="API token consumption over time"
    height="400px"
  />
  <BaseCard v-else-if="isLoading" padding="lg">
    <div class="flex items-center justify-center h-64">
      <BaseSpinner size="lg" />
    </div>
  </BaseCard>
  <BaseCard v-else padding="lg">
    <BaseEmptyState
      icon="lucide:activity"
      title="No token usage data"
      description="Token metrics will appear after running reviews"
    />
  </BaseCard>
</template>

<script setup lang="ts">
/**
 * FindingsDistributionChart - Findings by severity distribution
 * Shows distribution of findings across severity levels
 */
import type { FindingsDistribution } from '~/types'
import type { ChartData, ChartOptions } from 'chart.js'
import AnalyticsChart from './AnalyticsChart.vue'

interface Props {
  data: FindingsDistribution[]
  isLoading?: boolean
}

const props = defineProps<Props>()

// Severity colors mapping
const severityColors: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#f59e0b',
  low: '#3b82f6',
  info: '#6b7280',
}

const chartData = computed<ChartData>(() => ({
  labels: props.data.map(
    (item) => item.severity.charAt(0).toUpperCase() + item.severity.slice(1)
  ),
  datasets: [
    {
      data: props.data.map((item) => item.count),
      backgroundColor: props.data.map(
        (item) => severityColors[item.severity] || '#6b7280'
      ),
      borderWidth: 2,
      borderColor: '#ffffff',
    },
  ],
}))

const chartOptions: ChartOptions = {
  plugins: {
    legend: {
      position: 'right',
    },
  },
}
</script>

<template>
  <AnalyticsChart
    v-if="!isLoading && data.length > 0"
    type="doughnut"
    :data="chartData"
    :options="chartOptions"
    title="Findings by Severity"
    description="Distribution of findings across severity levels"
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
      icon="lucide:pie-chart"
      title="No findings yet"
      description="Start reviewing code to see finding distributions"
    />
  </BaseCard>
</template>

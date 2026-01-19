<script setup lang="ts">
/**
 * TopCategoriesChart - Top finding categories chart
 * Shows most frequent finding categories
 */
import type { TopCategory } from '~/types'
import type { ChartData, ChartOptions } from 'chart.js'
import AnalyticsChart from './AnalyticsChart.vue'

interface Props {
  data: TopCategory[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const chartData = computed<ChartData>(() => ({
  labels: props.data.map((item) => item.category),
  datasets: [
    {
      label: 'Findings',
      data: props.data.map((item) => item.count),
      backgroundColor: '#6366f1',
      borderColor: '#4f46e5',
      borderWidth: 1,
    },
  ],
}))

const chartOptions: ChartOptions = {
  indexAxis: 'y' as const,
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
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
    title="Top Finding Categories"
    description="Most frequent categories of code findings"
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
      icon="lucide:bar-chart"
      title="No categories yet"
      description="Code review findings will appear here by category"
    />
  </BaseCard>
</template>

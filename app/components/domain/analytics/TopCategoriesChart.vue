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
      backgroundColor: '#14b8a6',
      borderColor: '#0d9488',
      borderWidth: 1,
      borderRadius: 4,
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
    icon="lucide:tag"
    icon-color="text-violet-400"
    title="Top Finding Categories"
    description="Most frequent categories of code findings"
    height="400px"
  />
  <BaseCard
    v-else-if="isLoading"
    padding="lg"
  >
    <div class="space-y-4">
      <div class="space-y-2">
        <div class="h-5 w-44 bg-bg-hover rounded skeleton" />
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
      icon="lucide:bar-chart"
      title="No categories yet"
      description="Code review findings will appear here by category"
    />
  </BaseCard>
</template>

<script setup lang="ts">
/**
 * AnalyticsChart - Base chart wrapper using PrimeVue Chart
 * Wraps PrimeVue's Chart component with consistent styling
 */
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement)

interface Props {
  type: 'line' | 'bar' | 'doughnut' | 'pie' | 'radar' | 'polarArea'
  data: ChartData
  options?: ChartOptions
  title?: string
  description?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
})

// Default chart options with theme colors
const defaultOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 13,
      },
      bodyFont: {
        size: 12,
      },
      cornerRadius: 6,
    },
  },
}

// Merge default options with provided options
const chartOptions = computed(() => ({
  ...defaultOptions,
  ...props.options,
}))
</script>

<template>
  <BaseCard padding="none">
    <div class="p-5">
      <div
        v-if="title || description"
        class="mb-4"
      >
        <h3
          v-if="title"
          class="text-lg font-semibold text-text-primary"
        >
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="mt-1 text-sm text-text-muted"
        >
          {{ description }}
        </p>
      </div>

      <div
        class="relative"
        :style="{ height }"
      >
        <Chart
          :type="type"
          :data="data"
          :options="chartOptions"
          class="!absolute inset-0 !h-full !w-full"
        />
      </div>
    </div>
  </BaseCard>
</template>

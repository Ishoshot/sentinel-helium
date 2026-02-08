<script setup lang="ts">
/**
 * AnalyticsChart - Base chart wrapper with dark theme styling
 */
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Filler } from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Filler)

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

const defaultOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#71717a',
        font: { size: 11, family: 'Instrument Sans' },
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        color: 'rgba(63, 63, 70, 0.3)',
      },
      ticks: {
        color: '#71717a',
        font: { size: 11, family: 'Instrument Sans' },
        padding: 8,
      },
      border: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#a1a1aa',
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: { size: 12, family: 'Instrument Sans' },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#18181b',
      titleColor: '#fafafa',
      bodyColor: '#a1a1aa',
      borderColor: '#27272a',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      displayColors: true,
      boxPadding: 4,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
    },
  },
  animation: {
    duration: 750,
    easing: 'easeOutQuart',
  },
}

const chartOptions = computed(() => {
  const merged = { ...defaultOptions }

  if (props.options) {
    Object.assign(merged, props.options)
    if (props.options.scales) {
      merged.scales = { ...defaultOptions.scales, ...props.options.scales }
    }
    if (props.options.plugins) {
      merged.plugins = { ...defaultOptions.plugins, ...props.options.plugins }
    }
  }

  return merged
})
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
          class="text-base font-medium text-text-primary"
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

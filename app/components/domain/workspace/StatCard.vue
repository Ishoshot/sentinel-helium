<script setup lang="ts">
/**
 * StatCard - Dashboard statistic display card with hero numbers
 */

interface Props {
  label: string
  value: string | number
  description?: string
  icon: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const props = defineProps<Props>()

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})
</script>

<template>
  <BaseCard
    padding="none"
    class="cursor-pointer"
  >
    <div class="p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-text-muted">
            {{ label }}
          </p>
          <p class="mt-2 text-3xl font-semibold tracking-tight text-text-primary tabular-nums">
            {{ formattedValue }}
          </p>
        </div>
        <div class="flex-shrink-0 w-10 h-10 bg-bg-hover rounded-xl flex items-center justify-center">
          <Icon
            :name="icon"
            class="w-5 h-5 text-accent"
          />
        </div>
      </div>
      <div
        v-if="trend || description"
        class="mt-2 flex items-center gap-2"
      >
        <span
          v-if="trend"
          class="inline-flex items-center text-xs font-medium"
          :class="trend.isPositive ? 'text-emerald-400' : 'text-red-400'"
        >
          <Icon
            :name="trend.isPositive ? 'lucide:trending-up' : 'lucide:trending-down'"
            class="size-3 mr-0.5"
          />
          {{ trend.isPositive ? '+' : '' }}{{ trend.value }}%
        </span>
        <p
          v-if="description"
          class="text-xs text-text-faint truncate"
        >
          {{ description }}
        </p>
      </div>
    </div>
  </BaseCard>
</template>

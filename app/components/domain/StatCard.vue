<script setup lang="ts">
/**
 * StatCard - Dashboard statistic display card
 * Domain component for displaying key metrics
 */

interface Props {
  label: string
  value: string | number
  description?: string
  icon: string
}

defineProps<Props>()
</script>

<template>
  <BaseCard padding="none">
    <div class="p-5">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm text-text-muted">
            {{ label }}
          </p>
          <p class="mt-2 text-2xl font-semibold text-text-primary">
            {{ value }}
          </p>
          <p
            v-if="description"
            class="mt-1 text-xs text-text-muted"
          >
            {{ description }}
          </p>
        </div>
        <div class="flex-shrink-0 w-10 h-10 bg-bg-surface rounded-lg flex items-center justify-center">
          <Icon
            :name="icon"
            class="w-5 h-5 text-text-muted"
          />
        </div>
      </div>
    </div>
  </BaseCard>
</template>

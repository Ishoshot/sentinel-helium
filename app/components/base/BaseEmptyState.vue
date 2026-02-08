<script setup lang="ts">
import { EmptyStateVariant } from '~/types'

/**
 * BaseEmptyState - V2 Versatile component for empty, error, and loading states
 * Dark theme with subtle icon backgrounds and semantic colors
 */

interface Props {
  variant?: EmptyStateVariant
  icon?: string
  title: string
  description?: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: EmptyStateVariant.Empty,
  icon: '',
  compact: false,
})

const variantConfig = computed(() => {
  const configs: Record<EmptyStateVariant, {
    defaultIcon: string
    iconBg: string
    iconColor: string
  }> = {
    [EmptyStateVariant.Empty]: {
      defaultIcon: 'lucide:inbox',
      iconBg: 'bg-bg-hover',
      iconColor: 'text-text-faint',
    },
    [EmptyStateVariant.Error]: {
      defaultIcon: 'lucide:alert-circle',
      iconBg: 'bg-error-light',
      iconColor: 'text-error',
    },
    [EmptyStateVariant.Success]: {
      defaultIcon: 'lucide:check-circle',
      iconBg: 'bg-success-light',
      iconColor: 'text-success',
    },
    [EmptyStateVariant.Warning]: {
      defaultIcon: 'lucide:alert-triangle',
      iconBg: 'bg-warning-light',
      iconColor: 'text-warning',
    },
    [EmptyStateVariant.Info]: {
      defaultIcon: 'lucide:info',
      iconBg: 'bg-accent-glow',
      iconColor: 'text-accent',
    },
    [EmptyStateVariant.Offline]: {
      defaultIcon: 'lucide:wifi-off',
      iconBg: 'bg-bg-hover',
      iconColor: 'text-text-faint',
    },
  }

  return configs[props.variant]
})

const iconName = computed(() => props.icon || variantConfig.value.defaultIcon)
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-center"
    :class="compact ? 'py-8 px-4' : 'py-16 px-6'"
  >
    <!-- Icon -->
    <div
      class="rounded-xl flex items-center justify-center mb-4"
      :class="[
        variantConfig.iconBg,
        compact ? 'w-12 h-12' : 'w-16 h-16',
      ]"
    >
      <Icon
        :name="iconName"
        :class="[
          variantConfig.iconColor,
          compact ? 'w-6 h-6' : 'w-8 h-8',
        ]"
      />
    </div>

    <!-- Title -->
    <h3
      class="font-medium text-text-secondary"
      :class="compact ? 'text-base mb-1' : 'text-lg mb-2'"
    >
      {{ title }}
    </h3>

    <!-- Description -->
    <p
      v-if="description"
      class="text-text-muted max-w-sm"
      :class="compact ? 'text-sm' : 'text-sm'"
    >
      {{ description }}
    </p>

    <!-- Actions slot -->
    <div
      v-if="$slots.default"
      class="mt-6"
    >
      <slot />
    </div>
  </div>
</template>

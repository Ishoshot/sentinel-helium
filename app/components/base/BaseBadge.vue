<script setup lang="ts">
/**
 * BaseBadge - V2 Status/role badge component
 * Dark theme with semantic colors and subtle glow backgrounds
 */

interface Props {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})

const badgeClasses = computed(() => {
  const base = 'inline-flex items-center font-medium rounded-full'

  const variants = {
    default: 'bg-bg-hover text-text-secondary',
    accent: 'bg-accent-glow text-accent',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    error: 'bg-error-light text-error',
    info: 'bg-info-light text-info',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return [base, variants[props.variant], sizes[props.size]]
})
</script>

<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

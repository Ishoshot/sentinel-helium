<script setup lang="ts">
/**
 * BaseBadge - Status/role badge component
 * Follows Sentinel design system with semantic colors
 */

interface Props {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})

const badgeClasses = computed(() => {
  const base = 'inline-flex items-center font-medium rounded-full'

  const variants = {
    default: 'bg-bg-surface text-text-secondary',
    primary: 'bg-accent-light text-accent',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    error: 'bg-error-light text-error',
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

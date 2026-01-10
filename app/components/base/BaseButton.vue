<script setup lang="ts">
/**
 * BaseButton - Primary action button component
 * Follows Sentinel design system with grayscale-first approach
 */

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Compute button classes based on variant and size
const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-default focus-ring disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-bg-surface text-text-primary border border-border-muted hover:bg-bg-app',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-surface',
    danger: 'bg-error text-white hover:bg-red-700',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  return [base, variants[props.variant], sizes[props.size]]
})

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <Icon
      v-if="loading"
      name="lucide:loader-2"
      class="w-4 h-4 mr-2 animate-spin"
    />

    <slot />
  </button>
</template>

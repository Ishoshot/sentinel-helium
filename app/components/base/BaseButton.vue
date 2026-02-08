<script setup lang="ts">
/**
 * BaseButton - V2 Primary action button component
 * Dark theme with gradient primary, glow effects, and micro-interactions
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

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 focus:ring-offset-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none'

  const variants = {
    primary: 'btn-v2-primary text-white hover:-translate-y-0.5 active:scale-[0.98]',
    secondary: 'bg-transparent text-text-secondary border border-border-muted hover:bg-bg-hover hover:border-border-subtle hover:text-text-primary',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
    danger: 'bg-error text-white hover:bg-rose-600 shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.5)] hover:-translate-y-0.5 active:scale-[0.98]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
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

<style scoped>
.btn-v2-primary {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.3);
}

.btn-v2-primary:hover:not(:disabled) {
  box-shadow: 0 0 30px -5px rgba(20, 184, 166, 0.5);
}
</style>

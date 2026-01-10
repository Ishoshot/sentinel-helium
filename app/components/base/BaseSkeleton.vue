<script setup lang="ts">
/**
 * BaseSkeleton - Loading placeholder component
 * Preserves layout during loading states
 */

interface Props {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  width: '100%',
  height: '',
})

const skeletonClasses = computed(() => {
  const base = 'animate-pulse bg-bg-surface'

  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return [base, variants[props.variant]]
})

const skeletonStyle = computed(() => {
  const style: Record<string, string> = {
    width: props.width,
  }

  if (props.height) {
    style.height = props.height
  }
  else if (props.variant === 'text') {
    style.height = '1em'
  }
  else if (props.variant === 'circular') {
    style.height = props.width
  }

  return style
})
</script>

<template>
  <div
    :class="skeletonClasses"
    :style="skeletonStyle"
  />
</template>

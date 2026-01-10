<script setup lang="ts">
/**
 * BaseSpinner - Loading indicator component
 * Subtle animation following Sentinel design principles
 */

interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }
  return sizes[props.size]
})
</script>

<template>
  <Icon
    name="lucide:loader-2"
    class="animate-spin text-text-muted"
    :class="sizeClasses"
  />
</template>

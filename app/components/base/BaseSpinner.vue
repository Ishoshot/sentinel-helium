<script setup lang="ts">
/**
 * BaseSpinner - V2 Loading indicator component
 * Teal accent color with smooth animation
 */

interface Props {
  size?: 'sm' | 'md' | 'lg'
  muted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  muted: false,
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
    class="animate-spin"
    :class="[sizeClasses, muted ? 'text-text-muted' : 'text-accent']"
  />
</template>

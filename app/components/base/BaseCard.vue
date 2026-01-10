<script setup lang="ts">
/**
 * BaseCard - Content container component
 * Follows Sentinel design system with elevated surface
 */

interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
})

const paddingClasses = computed(() => {
  const sizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  return sizes[props.padding]
})
</script>

<template>
  <div
    class="bg-bg-elevated border border-border-subtle rounded-xl shadow-subtle"
    :class="paddingClasses"
  >
    <slot />
  </div>
</template>

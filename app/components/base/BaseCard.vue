<script setup lang="ts">
/**
 * BaseCard - V2 Content container component
 * Dark theme with elevated surface, optional hover effects and glow
 */

interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  highlighted?: boolean
  glow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  interactive: false,
  highlighted: false,
  glow: false,
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

const cardClasses = computed(() => [
  'bg-bg-elevated border rounded-xl transition-all duration-200',
  props.highlighted ? 'border-border-accent shadow-glow' : 'border-border-subtle shadow-elevated',
  props.interactive && 'cursor-pointer hover:border-border-accent hover:-translate-y-0.5 hover:shadow-glow',
  props.glow && 'relative overflow-hidden',
])
</script>

<template>
  <div
    :class="[cardClasses, paddingClasses]"
  >
    <!-- Inner glow effect -->
    <div
      v-if="glow"
      class="base-card-glow-overlay absolute inset-0 pointer-events-none rounded-xl"
    />
    <slot />
  </div>
</template>

<style scoped>
.base-card-glow-overlay {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
}
</style>

<script setup lang="ts">
/**
 * BaseContainer - Page content container
 * Provides consistent padding and optional max-width for page content
 */

interface Props {
  /**
   * Maximum width of the container
   * @default 'full' - No max width constraint
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /**
   * Whether to add padding
   * @default true
   */
  padded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'full',
  padded: true,
})

const containerClasses = computed(() => {
  const classes = []

  // Padding classes
  if (props.padded) {
    classes.push('px-6 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-10')
  }

  // Max-width classes
  switch (props.size) {
    case 'sm':
      classes.push('max-w-3xl mx-auto')
      break
    case 'md':
      classes.push('max-w-5xl mx-auto')
      break
    case 'lg':
      classes.push('max-w-7xl mx-auto')
      break
    case 'xl':
      classes.push('max-w-[1600px] mx-auto')
      break
    case 'full':
      // No max-width constraint
      break
  }

  return classes.join(' ')
})
</script>

<template>
  <div :class="containerClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * BaseLabel - GitHub label component
 * Displays a label with custom hex color background
 */

interface Props {
  name: string
  color: string // Hex code without #
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

// Calculate text color based on background brightness
// Using YIQ formula: light backgrounds get dark text, dark backgrounds get white text
const textColorClass = computed(() => {
  const hex = props.color
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return yiq >= 128 ? 'text-gray-900' : 'text-white'
})

const classes = computed(() => {
  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
  }

  return [
    'inline-flex items-center font-medium rounded-md leading-none',
    sizes[props.size],
    textColorClass.value
  ]
})
</script>

<template>
  <span
    :class="classes"
    :style="{ backgroundColor: `#${color}` }"
  >
    {{ name }}
  </span>
</template>

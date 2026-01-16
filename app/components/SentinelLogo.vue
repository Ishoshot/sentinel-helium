<script setup lang="ts">
/**
 * Sentinel logo component
 * Reusable logo with configurable size and color inversion
 */

const props = withDefaults(defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  inverted?: boolean
}>(), {
  size: 'md',
  inverted: false,
})

const sizeClasses: Record<string, string> = {
  xs: 'h-6 w-auto',
  sm: 'h-8 w-auto',
  md: 'h-10 w-auto',
  lg: 'h-14 w-auto',
  xl: 'h-20 w-auto',
}
</script>

<template>
  <img
    src="~/assets/images/sentinel-logo-wordmark.svg"
    alt="Sentinel"
    :class="[sizeClasses[props.size], props.inverted ? 'brightness-0 invert' : '']"
  >
</template>

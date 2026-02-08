<script setup lang="ts">
/**
 * Sentinel logo component
 * Reusable logo with configurable size and color inversion
 */

const props = withDefaults(defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  inverted?: boolean
  showText?: boolean
}>(), {
  size: 'md',
  inverted: false,
  showText: true,
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
    src="~/assets/images/sentinel-logo-icon.svg"
    alt="Sentinel"
    :class="[sizeClasses[props.size], props.inverted ? 'brightness-0 invert' : '']"
  >
  <h1
    v-if="props.showText"
    class="text-xl font-bold text-text-primary px-2"
  >
    Sentinel
  </h1>
</template>

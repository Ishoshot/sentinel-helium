<script setup lang="ts">
/**
 * BaseAvatar - User avatar display component
 * Shows image or initials fallback
 */

interface Props {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  size: 'md',
})

// Generate initials from name
const initials = computed(() => {
  return props.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }
  return sizes[props.size]
})

// Handle image load error
const imageError = ref(false)

function handleImageError() {
  imageError.value = true
}
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center rounded-full bg-bg-surface text-text-secondary font-medium overflow-hidden"
    :class="sizeClasses"
  >
    <!-- Image -->
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="name"
      class="w-full h-full object-cover"
      @error="handleImageError"
    >

    <!-- Initials fallback -->
    <span v-else>
      {{ initials }}
    </span>
  </div>
</template>

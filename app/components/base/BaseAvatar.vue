<script setup lang="ts">
/**
 * BaseAvatar - V2 User avatar display component
 * Dark theme with subtle border and optional status indicator
 */

interface Props {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'away' | 'offline' | null
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  size: 'md',
  status: null,
})

const initials = computed(() => {
  return props.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }
  return sizes[props.size]
})

const statusClasses = computed(() => {
  const statuses = {
    online: 'bg-success',
    away: 'bg-warning',
    offline: 'bg-text-muted',
  }
  return props.status ? statuses[props.status] : ''
})

const statusSizeClasses = computed(() => {
  const sizes = {
    xs: 'w-1.5 h-1.5 border',
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-3.5 h-3.5 border-2',
  }
  return sizes[props.size]
})

const imageError = ref(false)

function handleImageError() {
  imageError.value = true
}
</script>

<template>
  <div class="relative inline-block">
    <div
      class="inline-flex items-center justify-center rounded-full bg-bg-hover text-text-secondary font-medium overflow-hidden border-2 border-border-subtle"
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

    <!-- Status indicator -->
    <span
      v-if="status"
      class="absolute bottom-0 right-0 rounded-full border-bg-elevated"
      :class="[statusClasses, statusSizeClasses]"
    />
  </div>
</template>

<script setup lang="ts">
import type { OAuthProvider } from '~/types'

/**
 * OAuthButton - OAuth provider login button
 * Domain component for initiating OAuth flow
 */

interface Props {
  provider: OAuthProvider
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [provider: OAuthProvider]
}>()

// Provider display info
const providerInfo = computed(() => {
  const info: Record<OAuthProvider, { name: string; icon: string }> = {
    github: {
      name: 'GitHub',
      icon: 'lucide:github',
    },
    google: {
      name: 'Google',
      icon: 'lucide:chrome',
    },
  }
  return info[props.provider]
})

function handleClick() {
  emit('click', props.provider)
}
</script>

<template>
  <button
    type="button"
    class="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-text-primary bg-bg-elevated border border-border-muted rounded-lg hover:bg-bg-surface hover:border-border-subtle transition-default focus-ring"
    @click="handleClick"
  >
    <Icon
      :name="providerInfo.icon"
      class="w-5 h-5"
    />
    <span>Continue with {{ providerInfo.name }}</span>
  </button>
</template>

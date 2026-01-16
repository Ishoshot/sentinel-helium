<script setup lang="ts">
import { useAuth } from '~/composables/auth/useAuth'

/**
 * Root application component
 * Initializes authentication state on app load
 */

const { initialize } = useAuth()

// Initialize auth on client-side
onMounted(() => {
  initialize()
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global toast notifications -->
    <BaseToastContainer />
  </div>
</template>

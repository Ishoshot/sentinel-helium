<script setup lang="ts">
/**
 * Auth error page - displays authentication errors
 * Shows error message and link back to login
 */

definePageMeta({
  layout: 'auth',
})

const route = useRoute()

// Get error message from query
const errorMessage = computed(() => {
  return (route.query.message as string) || 'An authentication error occurred'
})
</script>

<template>
  <div class="text-center">
    <BaseCard>
      <!-- Error icon -->
      <div class="mb-4">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error-light">
          <Icon
            name="lucide:alert-circle"
            class="w-6 h-6 text-error"
          />
        </div>
      </div>

      <!-- Error message -->
      <h1 class="text-lg font-semibold text-text-primary mb-2">
        Authentication Error
      </h1>
      <p class="text-text-secondary mb-6">
        {{ errorMessage }}
      </p>

      <!-- Back to login -->
      <NuxtLink to="/login">
        <BaseButton variant="primary">
          Back to Sign In
        </BaseButton>
      </NuxtLink>
    </BaseCard>
  </div>
</template>

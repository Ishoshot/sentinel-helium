<script setup lang="ts">
import type { OAuthProvider } from '~/types'
import { useAuth } from '~/composables/useAuth'

/**
 * Login page - OAuth-only authentication
 * Displays OAuth provider buttons for GitHub and Google
 */

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { login } = useAuth()

function handleOAuthClick(provider: OAuthProvider) {
  login(provider)
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-2xl font-semibold text-text-primary mb-2">
        Sign in to Sentinel
      </h1>
      <p class="text-text-secondary">
        AI-powered code review for your team
      </p>
    </div>

    <!-- OAuth buttons -->
    <BaseCard>
      <div class="space-y-3">
        <DomainOAuthButton
          provider="github"
          @click="handleOAuthClick"
        />
        <DomainOAuthButton
          provider="google"
          @click="handleOAuthClick"
        />
      </div>

      <!-- Terms notice -->
      <p class="mt-6 text-xs text-text-muted text-center">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </BaseCard>
  </div>
</template>

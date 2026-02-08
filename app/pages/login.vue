<script setup lang="ts">
import { OAuthProvider } from '~/types'
import { useAuth } from '~/composables/auth/useAuth'
import { usePageSeo } from '~/composables/seo/usePageSeo'

/**
 * Login page - Premium dark OAuth authentication
 */

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

usePageSeo({
  title: 'Sign In',
  description: 'Sign in to Sentinel to start reviewing code with AI. Connect with GitHub or Google for instant access.',
  path: '/login',
})

const { login } = useAuth()

const loadingProvider = ref<OAuthProvider | null>(null)

function handleOAuthClick(provider: OAuthProvider) {
  loadingProvider.value = provider
  login(provider)
}

const providers = [
  {
    provider: OAuthProvider.GitHub,
    name: 'GitHub',
    icon: 'ph:github-logo-bold',
    primary: true,
  },
  {
    provider: OAuthProvider.Google,
    name: 'Google',
    icon: 'ph:google-logo-bold',
    primary: false,
  },
]
</script>

<template>
  <div class="space-y-8 animate-fade-in-up">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-3xl font-semibold tracking-tight text-text-primary mb-3">
        Welcome back
      </h1>
      <p class="text-text-secondary">
        Sign in to continue to Sentinel
      </p>
    </div>

    <!-- Auth card -->
    <div class="relative">
      <!-- Card -->
      <div class="relative rounded-2xl border border-border-subtle bg-bg-elevated p-8">
        <!-- OAuth buttons -->
        <div class="space-y-3">
          <button
            v-for="item in providers"
            :key="item.provider"
            type="button"
            :disabled="loadingProvider !== null"
            class="group w-full flex items-center justify-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            :class="item.primary
              ? 'bg-gradient-to-r from-accent to-teal-600 text-white hover:shadow-glow disabled:hover:shadow-none'
              : 'bg-bg-surface text-text-primary border border-border-subtle hover:border-border-muted hover:bg-bg-hover disabled:hover:bg-bg-surface disabled:hover:border-border-subtle'"
            @click="handleOAuthClick(item.provider)"
          >
            <Icon
              :name="item.icon"
              class="w-5 h-5"
            />
            <span>Continue with {{ item.name }}</span>
            <Icon
              v-if="loadingProvider === item.provider"
              name="ph:spinner-bold"
              class="w-4 h-4 animate-spin"
            />
          </button>
        </div>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border-subtle" />
          </div>
          <div class="relative flex justify-center">
            <span class="bg-bg-elevated px-4 text-xs text-text-muted">
              Secure OAuth authentication
            </span>
          </div>
        </div>

        <!-- Features -->
        <div class="space-y-3 flex flex-col items-center">
          <div class="flex items-center gap-3 text-sm text-text-secondary">
            <Icon
              name="ph:shield-check-bold"
              class="w-4 h-4 text-success"
            />
            <span>No passwords to remember</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-text-secondary">
            <Icon
              name="ph:lock-bold"
              class="w-4 h-4 text-success"
            />
            <span>Enterprise-grade security</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-text-secondary">
            <Icon
              name="ph:lightning-bold"
              class="w-4 h-4 text-success"
            />
            <span>Get started in seconds</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Terms notice -->
    <p class="text-xs text-text-muted text-center leading-relaxed">
      By signing in, you agree to our
      <NuxtLink
        to="/terms"
        class="text-text-secondary hover:text-text-primary transition-colors"
      >
        Terms of Service
      </NuxtLink>
      and
      <NuxtLink
        to="/privacy"
        class="text-text-secondary hover:text-text-primary transition-colors"
      >
        Privacy Policy
      </NuxtLink>.
    </p>

    <!-- Back to home -->
    <div class="text-center">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <Icon
          name="ph:arrow-left-bold"
          class="w-4 h-4"
        />
        <span>Back to home</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.hover\:shadow-glow:hover {
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.4);
}
</style>

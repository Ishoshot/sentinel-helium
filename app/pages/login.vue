<script setup lang="ts">
import { OAuthProvider } from '~/types'
import { useAuth } from '~/composables/auth/useAuth'

/**
 * Login page - Premium OAuth authentication
 * Light theme with clean card design
 */

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { login } = useAuth()

function handleOAuthClick(provider: OAuthProvider) {
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
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-3xl font-semibold tracking-tight text-slate-900 mb-3">
        Welcome back
      </h1>
      <p class="text-slate-600">
        Sign in to continue to Sentinel
      </p>
    </div>

    <!-- Auth card -->
    <div class="relative">
      <!-- Card -->
      <div class="relative rounded-2xl border border-slate-200 bg-white shadow-md p-8">
        <!-- OAuth buttons -->
        <div class="space-y-3">
          <button
            v-for="item in providers"
            :key="item.provider"
            type="button"
            class="group w-full flex items-center justify-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200"
            :class="item.primary
              ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'
              : 'bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'"
            @click="handleOAuthClick(item.provider)"
          >
            <Icon
              :name="item.icon"
              class="w-5 h-5"
            />
            <span>Continue with {{ item.name }}</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200" />
          </div>
          <div class="relative flex justify-center">
            <span class="bg-white px-4 text-xs text-slate-400">
              Secure OAuth authentication
            </span>
          </div>
        </div>

        <!-- Features -->
        <div class="space-y-3 flex flex-col items-center">
          <div class="flex items-center gap-3 text-sm text-slate-600">
            <Icon
              name="ph:shield-check-bold"
              class="w-4 h-4 text-emerald-500"
            />
            <span>No passwords to remember</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-slate-600">
            <Icon
              name="ph:lock-bold"
              class="w-4 h-4 text-emerald-500"
            />
            <span>Enterprise-grade security</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-slate-600">
            <Icon
              name="ph:lightning-bold"
              class="w-4 h-4 text-emerald-500"
            />
            <span>Get started in seconds</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Terms notice -->
    <p class="text-xs text-slate-400 text-center leading-relaxed">
      By signing in, you agree to our
      <a
        href="#"
        class="text-slate-600 hover:text-slate-900 transition-colors"
      >Terms of Service</a>
      and
      <a
        href="#"
        class="text-slate-600 hover:text-slate-900 transition-colors"
      >Privacy Policy</a>.
    </p>

    <!-- Back to home -->
    <div class="text-center">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 transition-colors"
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

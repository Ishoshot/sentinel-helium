<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useInvitations } from '~/composables/useInvitations'
import { OAuthProvider } from '~/types'

/**
 * Accept invitation page - handles invitation acceptance
 * Shows invitation details and prompts login if needed
 */

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const router = useRouter()
const { isAuthenticated, login } = useAuth()
const { acceptInvitation, isLoading, error } = useInvitations(ref(null))

const token = computed(() => route.params.token as string)
const accepted = ref(false)
const workspaceSlug = ref<string | null>(null)

// Try to accept invitation on mount if authenticated
onMounted(async () => {
  if (isAuthenticated.value) {
    await tryAccept()
  }
})

// Watch for auth changes
watch(isAuthenticated, async (isAuth) => {
  if (isAuth && !accepted.value) {
    await tryAccept()
  }
})

async function tryAccept() {
  const invitation = await acceptInvitation(token.value)
  if (invitation) {
    accepted.value = true
    workspaceSlug.value = invitation.workspace.slug
    // Redirect to workspace after a brief delay
    setTimeout(() => {
      router.push(`/${invitation.workspace.slug}`)
    }, 2000)
  }
}

function handleLogin(provider: OAuthProvider) {
  // Store the invitation token to process after login
  if (import.meta.client) {
    sessionStorage.setItem('pending_invitation', token.value)
  }
  login(provider)
}
</script>

<template>
  <div class="text-center">
    <BaseCard>
      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="py-8"
      >
        <BaseSpinner size="lg" />
        <p class="mt-4 text-text-secondary">
          Processing invitation...
        </p>
      </div>

      <!-- Success state -->
      <div
        v-else-if="accepted"
        class="py-8"
      >
        <div class="mb-4">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-light">
            <Icon
              name="lucide:check"
              class="w-6 h-6 text-success"
            />
          </div>
        </div>
        <h1 class="text-lg font-semibold text-text-primary mb-2">
          Welcome to the team!
        </h1>
        <p class="text-text-secondary">
          Redirecting you to your new workspace...
        </p>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="py-8"
      >
        <div class="mb-4">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error-light">
            <Icon
              name="lucide:alert-circle"
              class="w-6 h-6 text-error"
            />
          </div>
        </div>
        <h1 class="text-lg font-semibold text-text-primary mb-2">
          Unable to Accept Invitation
        </h1>
        <p class="text-text-secondary mb-6">
          {{ error }}
        </p>
        <NuxtLink to="/login">
          <BaseButton variant="secondary">
            Go to Sign In
          </BaseButton>
        </NuxtLink>
      </div>

      <!-- Not authenticated - prompt to sign in -->
      <div
        v-else-if="!isAuthenticated"
        class="py-4"
      >
        <div class="mb-4">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-light">
            <Icon
              name="lucide:mail"
              class="w-6 h-6 text-accent"
            />
          </div>
        </div>
        <h1 class="text-lg font-semibold text-text-primary mb-2">
          You've Been Invited
        </h1>
        <p class="text-text-secondary mb-6">
          Sign in to accept this invitation and join the workspace.
        </p>

        <div class="space-y-3">
          <DomainOAuthButton
            :provider="OAuthProvider.GitHub"
            @click="handleLogin"
          />
          <DomainOAuthButton
            :provider="OAuthProvider.Google"
            @click="handleLogin"
          />
        </div>
      </div>
    </BaseCard>
  </div>
</template>

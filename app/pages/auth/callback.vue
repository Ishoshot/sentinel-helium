<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useWorkspaces } from '~/composables/useWorkspaces'

/**
 * OAuth callback page - handles the redirect from OAuth provider
 * Stores token and redirects to workspace
 */

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const router = useRouter()
const { handleCallback, isLoading, error } = useAuth()
const { fetchWorkspaces } = useWorkspaces()

// Process callback on mount
onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    router.push('/auth/error?message=No authentication token received')
    return
  }

  const success = await handleCallback(token)

  if (success) {
    // Fetch workspaces and redirect to the first one (oldest first)
    const workspaces = await fetchWorkspaces()
    const sortedWorkspaces = [...workspaces].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const firstWorkspace = sortedWorkspaces[0]
    if (firstWorkspace) {
      router.push(`/${firstWorkspace.slug}`)
    }
    else {
      // New user with no workspaces - they should have one created automatically
      // but fallback to root which will handle it
      router.push('/')
    }
  }
  else {
    router.push(`/auth/error?message=${encodeURIComponent(error.value || 'Authentication failed')}`)
  }
})
</script>

<template>
  <div class="text-center">
    <BaseCard>
      <div class="py-8">
        <BaseSpinner
          v-if="isLoading"
          size="lg"
        />
        <div class="mt-4 text-text-secondary">
          {{ isLoading ? 'Signing you in...' : 'Processing...' }}
        </div>
      </div>
    </BaseCard>
  </div>
</template>

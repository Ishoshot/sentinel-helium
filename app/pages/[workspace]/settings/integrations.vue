<script setup lang="ts">
import { MemberRole } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useMembers } from '~/composables/useMembers'
import { useGitHub } from '~/composables/useGitHub'

/**
 * Integrations settings page - Premium workspace integrations hub
 * Elevated design with clear visual hierarchy and rich interactions
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const router = useRouter()
const route = useRoute()
const toast = useAppToast()
const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const workspaceId = computed(() => workspaceStore.currentWorkspaceId)
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug)

// Composables
const { members, fetchMembers } = useMembers(workspaceId)
const {
  connection,
  isLoading: isLoadingConnection,
  isConnecting,
  isDisconnecting,
  isSyncing,
  error,
  fetchConnection,
  connect,
  disconnect,
  syncRepositories,
  clearError,
} = useGitHub(workspaceId)

// Check permissions
const currentMember = computed(() =>
  members.value.find((m) => m.user_id === userStore.user?.id)
)

const canManage = computed(
  () =>
    currentMember.value?.role === MemberRole.Owner ||
    currentMember.value?.role === MemberRole.Admin
)

// Integration stats
const activeIntegrationsCount = computed(() => {
  return connection.value?.is_active ? 1 : 0
})

// Coming soon integrations data
const comingSoonIntegrations = [
  {
    name: 'GitLab',
    description: 'Self-hosted and cloud Git repository management',
    icon: 'lucide:gitlab',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    features: ['Merge request reviews', 'CI/CD integration', 'Issue tracking'],
  },
  {
    name: 'Bitbucket',
    description: 'Atlassian\'s Git solution for teams',
    icon: 'lucide:server',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    features: ['Pull request reviews', 'Pipelines integration', 'Jira sync'],
  },
  {
    name: 'Azure DevOps',
    description: 'Microsoft\'s DevOps platform',
    icon: 'lucide:cloud',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    features: ['PR reviews', 'Boards integration', 'Pipeline triggers'],
  },
  {
    name: 'Slack',
    description: 'Real-time notifications and alerts',
    icon: 'lucide:message-square',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    features: ['Review notifications', 'Finding alerts', 'Team updates'],
  },
]

// Fetch data on mount
onMounted(async () => {
  clearError()
  await Promise.all([fetchMembers(), fetchConnection()])

  // Check for flash messages from GitHub callback
  const success = route.query.success as string | undefined
  const errorMsg = route.query.error as string | undefined

  if (success) {
    toast.success(success)
    // Clear query params
    router.replace({ query: {} })
    // Refresh connection after successful callback
    await fetchConnection()
  }

  if (errorMsg) {
    toast.error(errorMsg)
    router.replace({ query: {} })
  }
})

// Watch for errors and show toast (only new errors, not stale ones)
watch(error, (newError, oldError) => {
  if (newError && newError !== oldError) {
    toast.error(newError)
  }
})

// Handle connect
async function handleConnect() {
  if (!workspaceId.value) {
    toast.error('Unable to connect: workspace not found')
    return
  }
  toast.info('Connecting to GitHub...')
  await connect()
}

// Handle disconnect
async function handleDisconnect() {
  await disconnect()
  if (!error.value) {
    toast.success('GitHub disconnected successfully')
  }
}

// Handle sync
async function handleSync() {
  await syncRepositories()
  if (!error.value) {
    toast.success('Repositories synced successfully')
  }
}

// Navigate to repositories
function goToRepositories() {
  router.push(`/${workspaceSlug.value}/repositories`)
}
</script>

<template>
  <div>
    <!-- Stats Summary - full width grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 my-10">
      <!-- Active Integrations -->
      <div class="p-5 rounded-xl bg-bg-elevated border border-border-subtle">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <Icon
              name="lucide:plug-zap"
              class="w-6 h-6 text-success"
            />
          </div>
          <div>
            <p class="text-3xl font-bold text-text-primary">
              {{ activeIntegrationsCount }}
            </p>
            <p class="text-sm text-text-muted">
              Active
            </p>
          </div>
        </div>
      </div>

      <!-- Available Integrations -->
      <div class="p-5 rounded-xl bg-bg-elevated border border-border-subtle">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Icon
              name="lucide:puzzle"
              class="w-6 h-6 text-accent"
            />
          </div>
          <div>
            <p class="text-3xl font-bold text-text-primary">
              1
            </p>
            <p class="text-sm text-text-muted">
              Available
            </p>
          </div>
        </div>
      </div>

      <!-- Coming Soon -->
      <div class="p-5 rounded-xl bg-bg-elevated border border-border-subtle">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-bg-surface flex items-center justify-center">
            <Icon
              name="lucide:clock"
              class="w-6 h-6 text-text-muted"
            />
          </div>
          <div>
            <p class="text-3xl font-bold text-text-primary">
              {{ comingSoonIntegrations.length }}
            </p>
            <p class="text-sm text-text-muted">
              Coming Soon
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Two Column Layout for main content - 60/40 split -->
    <div class="grid xl:grid-cols-5 gap-8 my-10">
      <!-- Left Column - Source Control (60%) -->
      <div class="xl:col-span-3">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-9 h-9 rounded-xl bg-text-primary flex items-center justify-center">
            <Icon
              name="lucide:git-branch"
              class="w-4.5 h-4.5 text-white"
            />
          </div>
          <div>
            <h2 class="text-base font-semibold text-text-primary">
              Source Control
            </h2>
            <p class="text-sm text-text-muted">
              Connect your repositories for automated code reviews
            </p>
          </div>
        </div>

        <!-- GitHub Integration Card -->
        <DomainGitHubConnectionCard
          :connection="connection"
          :is-loading="isLoadingConnection"
          :is-connecting="isConnecting || isSyncing"
          :is-disconnecting="isDisconnecting"
          :can-manage="canManage"
          @connect="handleConnect"
          @disconnect="handleDisconnect"
          @sync="handleSync"
          @view-repositories="goToRepositories"
        />

        <!-- Integration Benefits Card -->
        <div class="mt-6 p-6 rounded-2xl bg-gradient-to-br from-accent/5 via-transparent to-transparent border border-accent/10">
          <div class="flex items-start gap-4">
            <div class="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Icon
                name="lucide:lightbulb"
                class="w-5 h-5 text-accent"
              />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-text-primary mb-1">
                Why connect integrations?
              </h3>
              <p class="text-sm text-text-secondary mb-4">
                Enable automated code reviews, security scanning, and real-time alerts across your workflow.
              </p>
              <div class="flex flex-wrap gap-4">
                <div class="flex items-center gap-2">
                  <Icon
                    name="lucide:zap"
                    class="w-4 h-4 text-accent"
                  />
                  <span class="text-xs text-text-secondary">Automated reviews</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon
                    name="lucide:shield-check"
                    class="w-4 h-4 text-accent"
                  />
                  <span class="text-xs text-text-secondary">Security scanning</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon
                    name="lucide:bell"
                    class="w-4 h-4 text-accent"
                  />
                  <span class="text-xs text-text-secondary">Real-time alerts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Coming Soon (40%) -->
      <div class="xl:col-span-2">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-9 h-9 rounded-xl bg-bg-surface flex items-center justify-center">
            <Icon
              name="lucide:sparkles"
              class="w-4.5 h-4.5 text-text-muted"
            />
          </div>
          <div>
            <h2 class="text-base font-semibold text-text-primary">
              Coming Soon
            </h2>
            <p class="text-sm text-text-muted">
              More integrations on the roadmap
            </p>
          </div>
        </div>

        <!-- Integration Stack - vertical layout -->
        <div class="space-y-4">
          <DomainIntegrationCard
            v-for="integration in comingSoonIntegrations"
            :key="integration.name"
            :name="integration.name"
            :description="integration.description"
            :icon="integration.icon"
            :icon-bg="integration.iconBg"
            :icon-color="integration.iconColor"
            :features="integration.features"
            status="coming_soon"
          />
        </div>
      </div>
    </div>
  </div>
</template>

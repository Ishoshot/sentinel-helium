<script setup lang="ts">
import { MemberRole } from '~/types'
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useAppToast } from '~/composables/shared/useAppToast'
import { useMembers } from '~/composables/members/useMembers'
import { useGitHub } from '~/composables/integrations/useGitHub'
import { useSlack } from '~/composables/integrations/useSlack'
import { useWebSocket } from '~/composables/useWebSocket'
import DomainIntegrationsGitHubConnectionCard from '~/components/domain/integrations/GitHubConnectionCard.vue'
import DomainIntegrationsSlackConnectionCard from '~/components/domain/integrations/SlackConnectionCard.vue'
import DomainIntegrationsIntegrationCard from '~/components/domain/integrations/IntegrationCard.vue'

/**
 * Integrations settings page
 * Connect workspace tools and services
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

// Page ready state for animations
const isInitializing = ref(true)
const isPageReady = ref(false)

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

const {
  slackIntegration,
  channels: slackChannels,
  isLoading: isLoadingSlack,
  isConnecting: isConnectingSlack,
  isDisconnecting: isDisconnectingSlack,
  isFetchingChannels,
  isUpdatingChannel,
  error: slackError,
  fetchIntegration: fetchSlackIntegration,
  connect: connectSlack,
  fetchChannels: fetchSlackChannels,
  updateChannel: updateSlackChannel,
  disconnect: disconnectSlack,
  clearError: clearSlackError,
} = useSlack(workspaceId)

// WebSocket for config PR events
const { subscribeToRepositories, unsubscribeFromRepositories } = useWebSocket(workspaceId)

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
  let count = 0
  if (connection.value?.is_active) count++
  if (slackIntegration.value?.is_connected) count++
  return count
})

// Coming soon integrations data
const comingSoonIntegrations = [
  {
    name: 'GitLab',
    description: 'Self-hosted and cloud Git repository management',
    icon: 'lucide:gitlab',
    iconGradient: 'from-orange-500 to-red-500',
    features: ['Merge request reviews', 'CI/CD integration', 'Issue tracking'],
  },
  {
    name: 'Bitbucket',
    description: 'Atlassian\'s Git solution for teams',
    icon: 'lucide:server',
    iconGradient: 'from-blue-500 to-indigo-500',
    features: ['Pull request reviews', 'Pipelines integration', 'Jira sync'],
  },
  {
    name: 'Azure DevOps',
    description: 'Microsoft\'s DevOps platform',
    icon: 'lucide:cloud',
    iconGradient: 'from-sky-500 to-blue-500',
    features: ['PR reviews', 'Boards integration', 'Pipeline triggers'],
  },
]

// Fetch data on mount
onMounted(async () => {
  clearError()
  clearSlackError()
  await Promise.all([fetchMembers(), fetchConnection(), fetchSlackIntegration()])

  // Check for flash messages from GitHub callback
  const success = route.query.success as string | undefined
  const errorMsg = route.query.error as string | undefined

  if (success) {
    toast.success(success)
    router.replace({ query: {} })
    await fetchConnection()
  }

  if (errorMsg) {
    toast.error(errorMsg)
    router.replace({ query: {} })
  }

  // Check for Slack OAuth callback success
  const slackStatus = route.query.slack as string | undefined
  if (slackStatus === 'connected') {
    toast.success('Slack connected successfully')
    router.replace({ query: {} })
    await fetchSlackIntegration()
  }

  isInitializing.value = false
  setTimeout(() => {
    isPageReady.value = true
  }, 50)

  // Subscribe to WebSocket for config PR events
  subscribeToRepositories({
    onConfigPrCreated: (event) => {
      const opened = window.open(event.pr_url, '_blank', 'noopener,noreferrer')
      if (!opened) {
        toast.info({
          title: 'Config branch ready!',
          action: {
            label: 'Open',
            onClick: () => window.open(event.pr_url, '_blank', 'noopener,noreferrer'),
          },
        })
      } else {
        toast.success(`Config branch ready for ${event.repository_name}`)
      }
    },
  })
})

// Cleanup WebSocket subscription on unmount
onUnmounted(() => {
  unsubscribeFromRepositories()
})

// Watch for errors and show toast
watch(error, (newError, oldError) => {
  if (newError && newError !== oldError) {
    toast.error(newError)
  }
})

watch(slackError, (newError, oldError) => {
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
    toast.success('GitHub disconnected')
  }
}

// Handle sync
async function handleSync() {
  await syncRepositories()
  if (!error.value) {
    toast.success('Repositories synced')
  }
}

// Handle Slack connect (OAuth flow - opens new tab)
async function handleSlackConnect() {
  if (!workspaceId.value) {
    toast.error('Unable to connect: workspace not found')
    return
  }
  toast.info('Connecting to Slack...')
  await connectSlack()
}

// Handle Slack disconnect
async function handleSlackDisconnect() {
  await disconnectSlack()
  if (!slackError.value) {
    toast.success('Slack disconnected')
  }
}

// Handle Slack channel fetch
async function handleFetchSlackChannels() {
  await fetchSlackChannels()
}

// Handle Slack channel update
async function handleSlackChannelUpdate(channelId: string, channelName: string) {
  await updateSlackChannel(channelId, channelName)
  if (!slackError.value) {
    toast.success('Slack channel updated')
  }
}

// Navigate to repositories
function goToRepositories() {
  router.push(`/${workspaceSlug.value}/repositories`)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Hero Header -->
    <section
      class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 transition-all duration-700 ease-out"
      :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    >
      <!-- Decorative elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -right-20 -top-20 size-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div class="absolute -bottom-20 -left-20 size-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div class="absolute right-1/4 top-1/2 size-32 rounded-full bg-violet-500/10 blur-2xl" />
      </div>

      <!-- Grid pattern overlay -->
      <div
        class="absolute inset-0 opacity-[0.03]"
        style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 24px 24px;"
      />

      <div class="relative">
        <div class="flex items-start justify-between gap-6">
          <div class="flex items-center gap-5">
            <div class="flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <Icon
                name="lucide:plug-zap"
                class="size-8 text-white"
              />
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-white">
                Integrations
              </h1>
              <p class="mt-1 text-slate-400">
                Connect your tools to unlock automated workflows
              </p>
            </div>
          </div>

          <!-- Stats Pills -->
          <div class="hidden items-center gap-3 sm:flex">
            <div class="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm ring-1 ring-white/10">
              <span class="flex size-2 rounded-full bg-emerald-400" />
              <span class="text-sm font-medium text-white">{{ activeIntegrationsCount }} Active</span>
            </div>
            <div class="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm ring-1 ring-white/10">
              <span class="flex size-2 rounded-full bg-zinc-400" />
              <span class="text-sm font-medium text-white">{{ comingSoonIntegrations.length }} Coming</span>
            </div>
          </div>
        </div>

        <!-- Feature highlights -->
        <div class="mt-8 grid grid-cols-3 gap-4">
          <div
            class="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 transition-all duration-700 delay-100"
            :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
          >
            <div class="flex size-9 items-center justify-center rounded-lg bg-emerald-500/20">
              <Icon
                name="lucide:zap"
                class="size-4 text-emerald-400"
              />
            </div>
            <span class="text-sm text-slate-300">Automated Reviews</span>
          </div>
          <div
            class="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 transition-all duration-700 delay-150"
            :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
          >
            <div class="flex size-9 items-center justify-center rounded-lg bg-blue-500/20">
              <Icon
                name="lucide:shield-check"
                class="size-4 text-blue-400"
              />
            </div>
            <span class="text-sm text-slate-300">Security Scanning</span>
          </div>
          <div
            class="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 transition-all duration-700 delay-200"
            :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
          >
            <div class="flex size-9 items-center justify-center rounded-lg bg-violet-500/20">
              <Icon
                name="lucide:bell"
                class="size-4 text-violet-400"
              />
            </div>
            <span class="text-sm text-slate-300">Real-time Alerts</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Grid -->
    <div class="grid gap-8 xl:grid-cols-5 py-4">
      <!-- Left Column - Source Control (60%) -->
      <div
        class="xl:col-span-3 transition-all duration-700 delay-200"
        :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <!-- Section Header -->
        <div class="mb-5 flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-bg-surface">
            <Icon
              name="lucide:git-branch"
              class="size-5 text-text-primary"
            />
          </div>
          <div>
            <h2 class="text-base font-semibold text-text-primary">
              Source Control
            </h2>
            <p class="text-sm text-text-muted">
              Connect repositories for automated code reviews
            </p>
          </div>
        </div>

        <!-- GitHub Integration Card -->
        <DomainIntegrationsGitHubConnectionCard
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

        <!-- Notifications Section -->
        <div class="mt-8 mb-5 flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-bg-surface">
            <Icon
              name="lucide:bell"
              class="size-5 text-text-primary"
            />
          </div>
          <div>
            <h2 class="text-base font-semibold text-text-primary">
              Notifications
            </h2>
            <p class="text-sm text-text-muted">
              Connect notification channels for briefings and alerts
            </p>
          </div>
        </div>

        <!-- Slack Integration Card -->
        <DomainIntegrationsSlackConnectionCard
          :integration="slackIntegration"
          :channels="slackChannels"
          :is-loading="isLoadingSlack"
          :is-connecting="isConnectingSlack"
          :is-disconnecting="isDisconnectingSlack"
          :is-fetching-channels="isFetchingChannels"
          :is-updating-channel="isUpdatingChannel"
          :can-manage="canManage"
          @connect="handleSlackConnect"
          @disconnect="handleSlackDisconnect"
          @fetch-channels="handleFetchSlackChannels"
          @update-channel="handleSlackChannelUpdate"
        />

        <!-- Integration Benefits Card -->
        <div
          class="mt-6 rounded-2xl border border-border-subtle bg-gradient-to-br from-bg-surface to-bg-elevated p-6 transition-all duration-700 delay-300"
          :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <div class="flex items-start gap-4">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Icon
                name="lucide:lightbulb"
                class="size-5 text-amber-400"
              />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-text-primary">
                Why connect integrations?
              </h3>
              <p class="mt-1 text-sm text-text-secondary">
                Enable automated code reviews, security scanning, and real-time alerts across your entire workflow.
              </p>
              <div class="mt-4 flex flex-wrap gap-3">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary">
                  <Icon
                    name="lucide:check"
                    class="size-3 text-emerald-400"
                  />
                  Instant feedback
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary">
                  <Icon
                    name="lucide:check"
                    class="size-3 text-emerald-400"
                  />
                  Zero setup
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary">
                  <Icon
                    name="lucide:check"
                    class="size-3 text-emerald-400"
                  />
                  Secure by default
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Coming Soon (40%) -->
      <div
        class="xl:col-span-2 transition-all duration-700 delay-250"
        :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <!-- Section Header -->
        <div class="mb-5 flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Icon
              name="lucide:sparkles"
              class="size-5 text-white"
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

        <!-- Integration Stack -->
        <div class="space-y-3">
          <DomainIntegrationsIntegrationCard
            v-for="(integration, index) in comingSoonIntegrations"
            :key="integration.name"
            :name="integration.name"
            :description="integration.description"
            :icon="integration.icon"
            :icon-gradient="integration.iconGradient"
            :features="integration.features"
            status="coming_soon"
            class="transition-all duration-500"
            :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
            :style="{ transitionDelay: `${300 + index * 50}ms` }"
          />
        </div>

        <!-- Request Integration -->
        <div
          class="mt-6 rounded-xl border-2 border-dashed border-border-subtle p-5 text-center transition-all duration-700 delay-500"
          :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <div class="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-bg-surface">
            <Icon
              name="lucide:plus"
              class="size-5 text-text-muted"
            />
          </div>
          <p class="text-sm font-medium text-text-secondary">
            Need a different integration?
          </p>
          <p class="mt-1 text-xs text-text-muted">
            Let us know what tools you'd like to connect
          </p>
          <button
            class="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-bg-surface px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover"
          >
            <Icon
              name="lucide:message-circle"
              class="size-3.5"
            />
            Request Integration
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

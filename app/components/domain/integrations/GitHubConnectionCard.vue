<script setup lang="ts">
import type { Connection } from '~/types'
import { ConnectionStatus, InstallationStatus } from '~/types'

/**
 * GitHubConnectionCard - Premium GitHub integration card
 * Hero-style design with rich visual states and smooth transitions
 */

interface Props {
  connection: Connection | null
  isLoading?: boolean
  isConnecting?: boolean
  isDisconnecting?: boolean
  canManage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isConnecting: false,
  isDisconnecting: false,
  canManage: false,
})

const emit = defineEmits<{
  connect: []
  disconnect: []
  viewRepositories: []
  sync: []
}>()

// Connection state helpers
const isNotConnected = computed(
  () => !props.connection || props.connection.status === ConnectionStatus.Disconnected
)
const isPending = computed(() => props.connection?.status === ConnectionStatus.Pending)
const isConnected = computed(() => props.connection?.is_active)
const isSuspended = computed(
  () => props.connection?.installation?.status === InstallationStatus.Suspended
)
const isFailed = computed(() => props.connection?.status === ConnectionStatus.Failed)

// Installation info
const installation = computed(() => props.connection?.installation)
const accountLogin = computed(() => installation.value?.account_login ?? '')
const accountAvatar = computed(() => installation.value?.account_avatar_url ?? '')
const repositoriesCount = computed(() => installation.value?.repositories_count ?? 0)
const isOrganization = computed(() => installation.value?.is_organization ?? false)

// Hover state
const isHovered = ref(false)

// Animation pulse for syncing
const isSyncing = ref(false)

// Status configuration with rich styling
const statusConfig = computed(() => {
  if (isConnected.value) {
    return {
      label: 'Connected',
      icon: 'lucide:check-circle-2',
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
      ring: 'ring-success/20',
      gradient: 'from-success/5 via-transparent to-transparent',
      pulse: false,
    }
  }
  if (isPending.value) {
    return {
      label: 'Awaiting Setup',
      icon: 'lucide:loader-2',
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      ring: 'ring-warning/20',
      gradient: 'from-warning/5 via-transparent to-transparent',
      pulse: true,
    }
  }
  if (isSuspended.value) {
    return {
      label: 'Suspended',
      icon: 'lucide:alert-triangle',
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      ring: 'ring-warning/20',
      gradient: 'from-warning/5 via-transparent to-transparent',
      pulse: false,
    }
  }
  if (isFailed.value) {
    return {
      label: 'Connection Failed',
      icon: 'lucide:x-circle',
      color: 'text-error',
      bg: 'bg-error/10',
      border: 'border-error/20',
      ring: 'ring-error/20',
      gradient: 'from-error/5 via-transparent to-transparent',
      pulse: false,
    }
  }
  return null
})

// Show disconnect confirmation
const showDisconnectModal = ref(false)

function handleDisconnect() {
  showDisconnectModal.value = false
  emit('disconnect')
}

async function handleSync() {
  isSyncing.value = true
  emit('sync')
  // Reset after a delay
  setTimeout(() => {
    isSyncing.value = false
  }, 2000)
}

// Features list for not connected state
const features = [
  { icon: 'lucide:git-pull-request', text: 'Automated PR reviews' },
  { icon: 'lucide:shield-check', text: 'Security analysis' },
  { icon: 'lucide:zap', text: 'Instant feedback' },
]
</script>

<template>
  <div
    class="group relative"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Main Card -->
    <div
      class="relative overflow-hidden rounded-2xl border transition-all duration-300"
      :class="[
        statusConfig
          ? `${statusConfig.border} ${isHovered ? 'shadow-elevated' : 'shadow-subtle'}`
          : 'border-border-subtle hover:border-border-muted hover:shadow-elevated',
        isConnected ? 'ring-1 ' + statusConfig?.ring : '',
      ]"
    >
      <!-- Status gradient overlay -->
      <div
        v-if="statusConfig"
        class="absolute inset-0 bg-gradient-to-br pointer-events-none"
        :class="statusConfig.gradient"
      />

      <!-- Top accent line -->
      <div
        class="absolute inset-x-0 top-0 h-0.5 transition-colors duration-300"
        :class="[
          isConnected ? 'bg-success' : isPending ? 'bg-warning' : isFailed ? 'bg-error' : 'bg-gradient-to-r from-transparent via-border-muted to-transparent',
        ]"
      />

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="p-8"
      >
        <div class="flex items-start gap-5">
          <BaseSkeleton class="w-16 h-16 rounded-2xl flex-shrink-0" />
          <div class="flex-1 space-y-3">
            <BaseSkeleton class="h-5 w-32" />
            <BaseSkeleton class="h-4 w-48" />
            <BaseSkeleton class="h-4 w-24" />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div
        v-else
        class="relative p-6"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-start gap-4">
            <!-- GitHub Icon Container -->
            <div
              class="relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
              :class="[
                isConnected
                  ? 'bg-text-primary'
                  : isPending
                    ? 'bg-warning/10'
                    : isFailed
                      ? 'bg-error/10'
                      : 'bg-bg-surface group-hover:bg-bg-elevated',
              ]"
            >
              <Icon
                name="lucide:github"
                class="w-7 h-7 transition-colors duration-300"
                :class="[
                  isConnected
                    ? 'text-white'
                    : isPending
                      ? 'text-warning'
                      : isFailed
                        ? 'text-error'
                        : 'text-text-primary',
                ]"
              />
              <!-- Connected indicator -->
              <div
                v-if="isConnected"
                class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-bg-elevated flex items-center justify-center"
              >
                <Icon
                  name="lucide:check"
                  class="w-2.5 h-2.5 text-white"
                />
              </div>
            </div>

            <!-- Title & Description -->
            <div>
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold text-text-primary">
                  GitHub
                </h3>
                <!-- Status Badge -->
                <div
                  v-if="statusConfig"
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="[statusConfig.bg, statusConfig.color]"
                >
                  <Icon
                    :name="statusConfig.icon"
                    class="w-3.5 h-3.5"
                    :class="{ 'animate-spin': statusConfig.pulse }"
                  />
                  {{ statusConfig.label }}
                </div>
              </div>
              <p class="text-sm text-text-muted mt-1">
                {{ isConnected
                  ? 'Source control integration active'
                  : 'Connect to enable AI-powered code reviews'
                }}
              </p>
            </div>
          </div>

          <!-- Sync indicator for connected state -->
          <div
            v-if="isConnected && canManage"
            class="flex items-center gap-2"
          >
            <button
              class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-default"
              :class="{ 'animate-spin': isSyncing }"
              title="Sync repositories"
              @click="handleSync"
            >
              <Icon
                name="lucide:refresh-cw"
                class="w-4 h-4"
              />
            </button>
          </div>
        </div>

        <!-- Not Connected State -->
        <template v-if="isNotConnected">
          <!-- Features -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div
              v-for="feature in features"
              :key="feature.text"
              class="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-surface/50 border border-transparent hover:border-border-subtle transition-default"
            >
              <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Icon
                  :name="feature.icon"
                  class="w-5 h-5 text-accent"
                />
              </div>
              <span class="text-xs text-text-secondary text-center font-medium">
                {{ feature.text }}
              </span>
            </div>
          </div>

          <!-- Connect CTA -->
          <div
            v-if="canManage"
            class="flex flex-col gap-3"
          >
            <BaseButton
              size="lg"
              :loading="isConnecting"
              class="w-full justify-center"
              @click="$emit('connect')"
            >
              <Icon
                name="lucide:github"
                class="w-5 h-5 mr-2"
              />
              Connect GitHub
            </BaseButton>
            <p class="text-xs text-text-muted text-center">
              We'll redirect you to GitHub to authorize access
            </p>
          </div>
          <div
            v-else
            class="p-4 rounded-xl bg-bg-surface border border-border-subtle"
          >
            <div class="flex items-center gap-3">
              <Icon
                name="lucide:lock"
                class="w-5 h-5 text-text-muted flex-shrink-0"
              />
              <p class="text-sm text-text-muted">
                Only workspace owners and admins can connect integrations.
              </p>
            </div>
          </div>
        </template>

        <!-- Pending State -->
        <template v-else-if="isPending">
          <div class="mb-6">
            <!-- Progress steps -->
            <div class="flex items-center gap-3 mb-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                  <Icon
                    name="lucide:check"
                    class="w-4 h-4 text-white"
                  />
                </div>
                <span class="text-sm text-text-secondary">Authorized</span>
              </div>
              <div class="flex-1 h-px bg-border-muted" />
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-warning/20 border-2 border-warning flex items-center justify-center">
                  <Icon
                    name="lucide:loader-2"
                    class="w-4 h-4 text-warning animate-spin"
                  />
                </div>
                <span class="text-sm text-warning font-medium">Install app</span>
              </div>
              <div class="flex-1 h-px bg-border-subtle" />
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-bg-surface border border-border-muted flex items-center justify-center">
                  <Icon
                    name="lucide:check"
                    class="w-4 h-4 text-text-muted"
                  />
                </div>
                <span class="text-sm text-text-muted">Complete</span>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-warning/5 border border-warning/20">
              <p class="text-sm text-text-secondary">
                Complete the GitHub App installation to activate your connection. Select the repositories you want Sentinel to access.
              </p>
            </div>
          </div>

          <div
            v-if="canManage"
            class="flex items-center gap-3"
          >
            <BaseButton
              variant="secondary"
              class="flex-1"
              @click="showDisconnectModal = true"
            >
              Cancel
            </BaseButton>
            <BaseButton
              :loading="isConnecting"
              class="flex-1"
              @click="$emit('connect')"
            >
              <Icon
                name="lucide:external-link"
                class="w-4 h-4 mr-1.5"
              />
              Continue on GitHub
            </BaseButton>
          </div>
        </template>

        <!-- Connected State -->
        <template v-else-if="isConnected">
          <!-- Account Info -->
          <div class="flex items-center gap-4 p-4 rounded-xl bg-bg-surface/50 border border-border-subtle mb-6">
            <div class="relative">
              <BaseAvatar
                :src="accountAvatar"
                :name="accountLogin"
                size="lg"
              />
              <div
                v-if="isOrganization"
                class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center border-2 border-bg-elevated"
              >
                <Icon
                  name="lucide:building-2"
                  class="w-2.5 h-2.5 text-white"
                />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-semibold text-text-primary truncate">
                  {{ accountLogin }}
                </p>
                <span
                  v-if="isOrganization"
                  class="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-accent/10 text-accent rounded"
                >
                  Organization
                </span>
              </div>
              <p class="text-sm text-text-muted mt-0.5">
                Connected via GitHub App
              </p>
            </div>

            <!-- Stats -->
            <div class="flex items-center gap-6 pl-4 border-l border-border-subtle">
              <div class="text-center">
                <p class="text-2xl font-bold text-text-primary">
                  {{ repositoriesCount }}
                </p>
                <p class="text-xs text-text-muted">
                  {{ repositoriesCount === 1 ? 'Repository' : 'Repositories' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div
            v-if="canManage"
            class="flex items-center gap-3"
          >
            <button
              class="flex items-center gap-2 px-4 py-2.5 text-sm text-text-muted hover:text-error hover:bg-error/5 rounded-lg transition-default"
              @click="showDisconnectModal = true"
            >
              <Icon
                name="lucide:unlink"
                class="w-4 h-4"
              />
              Disconnect
            </button>
            <div class="flex-1" />
            <BaseButton
              variant="secondary"
              @click="$emit('viewRepositories')"
            >
              <Icon
                name="lucide:folder-git-2"
                class="w-4 h-4 mr-1.5"
              />
              View Repositories
            </BaseButton>
          </div>
          <div
            v-else
            class="flex justify-end"
          >
            <BaseButton @click="$emit('viewRepositories')">
              <Icon
                name="lucide:folder-git-2"
                class="w-4 h-4 mr-1.5"
              />
              View Repositories
            </BaseButton>
          </div>
        </template>

        <!-- Suspended State -->
        <template v-else-if="isSuspended">
          <div class="p-4 rounded-xl bg-warning/5 border border-warning/20 mb-6">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                <Icon
                  name="lucide:alert-triangle"
                  class="w-5 h-5 text-warning"
                />
              </div>
              <div>
                <p class="text-sm font-medium text-warning">
                  App Suspended
                </p>
                <p class="text-sm text-text-secondary mt-1">
                  The GitHub App has been suspended. Reactivate it in your GitHub settings to continue using Sentinel.
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="canManage"
            class="flex items-center gap-3"
          >
            <BaseButton
              variant="secondary"
              @click="showDisconnectModal = true"
            >
              Disconnect
            </BaseButton>
            <BaseButton
              as="a"
              :href="`https://github.com/settings/installations/${installation?.installation_id}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                name="lucide:external-link"
                class="w-4 h-4 mr-1.5"
              />
              Manage on GitHub
            </BaseButton>
          </div>
        </template>

        <!-- Failed State -->
        <template v-else-if="isFailed">
          <div class="p-4 rounded-xl bg-error/5 border border-error/20 mb-6">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center flex-shrink-0">
                <Icon
                  name="lucide:x-circle"
                  class="w-5 h-5 text-error"
                />
              </div>
              <div>
                <p class="text-sm font-medium text-error">
                  Connection Failed
                </p>
                <p class="text-sm text-text-secondary mt-1">
                  We couldn't complete the connection to GitHub. This might be due to network issues or permission problems.
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="canManage"
            class="flex items-center gap-3"
          >
            <BaseButton
              variant="secondary"
              @click="showDisconnectModal = true"
            >
              Cancel
            </BaseButton>
            <BaseButton
              :loading="isConnecting"
              @click="$emit('connect')"
            >
              <Icon
                name="lucide:refresh-cw"
                class="w-4 h-4 mr-1.5"
              />
              Try Again
            </BaseButton>
          </div>
        </template>
      </div>
    </div>

    <!-- Disconnect Confirmation Modal -->
    <BaseModal
      v-model="showDisconnectModal"
      title="Disconnect GitHub"
      size="sm"
    >
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error/10 flex items-center justify-center">
          <Icon
            name="lucide:unlink"
            class="w-8 h-8 text-error"
          />
        </div>
        <h3 class="text-lg font-semibold text-text-primary mb-2">
          Disconnect GitHub?
        </h3>
        <p class="text-sm text-text-secondary">
          This will disable automated code reviews for all repositories in this workspace. You can reconnect anytime.
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            class="flex-1"
            @click="showDisconnectModal = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            variant="danger"
            class="flex-1"
            :loading="isDisconnecting"
            @click="handleDisconnect"
          >
            <Icon
              name="lucide:unlink"
              class="w-4 h-4 mr-1.5"
            />
            Disconnect
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

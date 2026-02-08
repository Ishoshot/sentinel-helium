<script setup lang="ts">
import type { Connection } from '~/types'
import { ConnectionStatus, InstallationStatus } from '~/types'

/**
 * GitHubConnectionCard - Premium+ GitHub integration card
 * Refined design with elevated visual states and smooth transitions
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
      class="relative overflow-hidden rounded-2xl border bg-bg-elevated transition-all duration-300"
      :class="[
        isConnected
          ? 'border-emerald-500/30 shadow-sm hover:shadow-md'
          : isPending
            ? 'border-amber-500/30'
            : isFailed
              ? 'border-red-500/30'
              : 'border-border-subtle hover:border-border-muted hover:shadow-md',
      ]"
    >
      <!-- Top accent line -->
      <div
        class="absolute inset-x-0 top-0 h-1 transition-colors duration-300"
        :class="[
          isConnected
            ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500'
            : isPending
              ? 'bg-gradient-to-r from-amber-400 to-orange-400'
              : isFailed
                ? 'bg-gradient-to-r from-red-400 to-rose-400'
                : 'bg-gradient-to-r from-border-subtle via-border-muted to-border-subtle',
        ]"
      />

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="p-8"
      >
        <div class="flex items-start gap-5">
          <BaseSkeleton class="size-14 flex-shrink-0 rounded-2xl" />
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
        <div class="mb-6 flex items-start justify-between">
          <div class="flex items-start gap-4">
            <!-- GitHub Icon Container -->
            <div
              class="relative flex size-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300"
              :class="[
                isConnected
                  ? 'bg-bg-surface'
                  : isPending
                    ? 'bg-amber-500/10'
                    : isFailed
                      ? 'bg-red-500/10'
                      : 'bg-bg-surface group-hover:bg-bg-hover',
              ]"
            >
              <Icon
                name="lucide:github"
                class="size-7 transition-colors duration-300"
                :class="[
                  isConnected
                    ? 'text-text-primary'
                    : isPending
                      ? 'text-amber-400'
                      : isFailed
                        ? 'text-red-400'
                        : 'text-text-secondary',
                ]"
              />
              <!-- Connected indicator -->
              <div
                v-if="isConnected"
                class="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-bg-elevated bg-emerald-500"
              >
                <Icon
                  name="lucide:check"
                  class="size-2.5 text-white"
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
                <span
                  v-if="isConnected"
                  class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
                >
                  <span class="flex size-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
                <span
                  v-else-if="isPending"
                  class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400"
                >
                  <Icon
                    name="lucide:loader-2"
                    class="size-3 animate-spin"
                  />
                  Awaiting Setup
                </span>
                <span
                  v-else-if="isSuspended"
                  class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400"
                >
                  <Icon
                    name="lucide:alert-triangle"
                    class="size-3"
                  />
                  Suspended
                </span>
                <span
                  v-else-if="isFailed"
                  class="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400"
                >
                  <Icon
                    name="lucide:x-circle"
                    class="size-3"
                  />
                  Failed
                </span>
              </div>
              <p class="mt-1 text-sm text-text-muted">
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
              class="flex size-9 items-center justify-center rounded-lg text-text-muted transition-all hover:bg-bg-hover hover:text-text-secondary"
              title="Sync repositories"
              @click="handleSync"
            >
              <Icon
                name="lucide:refresh-cw"
                class="size-4"
                :class="{ 'animate-spin': isSyncing }"
              />
            </button>
          </div>
        </div>

        <!-- Not Connected State -->
        <template v-if="isNotConnected">
          <!-- Features -->
          <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div
              v-for="feature in features"
              :key="feature.text"
              class="flex flex-col items-center gap-2 rounded-xl border border-border-subtle bg-bg-surface/50 p-4 transition-colors hover:bg-bg-surface"
            >
              <div class="flex size-10 items-center justify-center rounded-xl bg-bg-elevated shadow-sm">
                <Icon
                  :name="feature.icon"
                  class="size-5 text-text-secondary"
                />
              </div>
              <span class="text-center text-xs font-medium text-text-secondary">
                {{ feature.text }}
              </span>
            </div>
          </div>

          <!-- Connect CTA -->
          <div
            v-if="canManage"
            class="flex flex-col gap-3"
          >
            <button
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-teal-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isConnecting"
              @click="$emit('connect')"
            >
              <Icon
                v-if="isConnecting"
                name="lucide:loader-2"
                class="size-5 animate-spin"
              />
              <Icon
                v-else
                name="lucide:github"
                class="size-5"
              />
              {{ isConnecting ? 'Connecting...' : 'Connect GitHub' }}
            </button>
            <p class="text-center text-xs text-text-muted">
              We'll redirect you to GitHub to authorize access
            </p>
          </div>
          <div
            v-else
            class="rounded-xl border border-border-subtle bg-bg-surface p-4"
          >
            <div class="flex items-center gap-3">
              <Icon
                name="lucide:lock"
                class="size-5 shrink-0 text-text-muted"
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
            <div class="mb-4 flex items-center gap-3">
              <div class="flex items-center gap-2">
                <div class="flex size-8 items-center justify-center rounded-full bg-emerald-500">
                  <Icon
                    name="lucide:check"
                    class="size-4 text-white"
                  />
                </div>
                <span class="text-sm text-text-secondary">Authorized</span>
              </div>
              <div class="h-px flex-1 bg-border-subtle" />
              <div class="flex items-center gap-2">
                <div class="flex size-8 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-500/10">
                  <Icon
                    name="lucide:loader-2"
                    class="size-4 animate-spin text-amber-400"
                  />
                </div>
                <span class="text-sm font-medium text-amber-400">Install app</span>
              </div>
              <div class="h-px flex-1 bg-border-subtle" />
              <div class="flex items-center gap-2">
                <div class="flex size-8 items-center justify-center rounded-full border border-border-subtle bg-bg-surface">
                  <Icon
                    name="lucide:check"
                    class="size-4 text-text-muted"
                  />
                </div>
                <span class="text-sm text-text-muted">Complete</span>
              </div>
            </div>

            <div class="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p class="text-sm text-text-secondary">
                Complete the GitHub App installation to activate your connection. Select the repositories you want Sentinel to access.
              </p>
            </div>
          </div>

          <div
            v-if="canManage"
            class="flex items-center gap-3"
          >
            <button
              class="flex-1 rounded-xl border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover"
              @click="showDisconnectModal = true"
            >
              Cancel
            </button>
            <button
              class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isConnecting"
              @click="$emit('connect')"
            >
              <Icon
                v-if="isConnecting"
                name="lucide:loader-2"
                class="size-4 animate-spin"
              />
              <Icon
                v-else
                name="lucide:external-link"
                class="size-4"
              />
              Continue on GitHub
            </button>
          </div>
        </template>

        <!-- Connected State -->
        <template v-else-if="isConnected">
          <!-- Account Info -->
          <div class="mb-6 flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-surface/50 p-4">
            <div class="relative">
              <BaseAvatar
                :src="accountAvatar"
                :name="accountLogin"
                size="lg"
              />
              <div
                v-if="isOrganization"
                class="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-bg-elevated bg-blue-500"
              >
                <Icon
                  name="lucide:building-2"
                  class="size-2.5 text-white"
                />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="truncate font-semibold text-text-primary">
                  {{ accountLogin }}
                </p>
                <span
                  v-if="isOrganization"
                  class="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-400"
                >
                  Org
                </span>
              </div>
              <p class="mt-0.5 text-sm text-text-muted">
                Connected via GitHub App
              </p>
            </div>

            <!-- Stats -->
            <div class="flex items-center gap-6 border-l border-border-subtle pl-6">
              <div class="text-center">
                <p class="text-2xl font-bold text-text-primary">
                  {{ repositoriesCount }}
                </p>
                <p class="text-xs text-text-muted">
                  {{ repositoriesCount === 1 ? 'Repo' : 'Repos' }}
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
              class="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
              @click="showDisconnectModal = true"
            >
              <Icon
                name="lucide:unlink"
                class="size-4"
              />
              Disconnect
            </button>
            <div class="flex-1" />
            <button
              class="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover"
              @click="$emit('viewRepositories')"
            >
              <Icon
                name="lucide:folder-git-2"
                class="size-4"
              />
              View Repositories
            </button>
          </div>
          <div
            v-else
            class="flex justify-end"
          >
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-glow"
              @click="$emit('viewRepositories')"
            >
              <Icon
                name="lucide:folder-git-2"
                class="size-4"
              />
              View Repositories
            </button>
          </div>
        </template>

        <!-- Suspended State -->
        <template v-else-if="isSuspended">
          <div class="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div class="flex items-start gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
                <Icon
                  name="lucide:alert-triangle"
                  class="size-5 text-amber-400"
                />
              </div>
              <div>
                <p class="text-sm font-medium text-amber-400">
                  App Suspended
                </p>
                <p class="mt-1 text-sm text-text-secondary">
                  The GitHub App has been suspended. Reactivate it in your GitHub settings to continue using Sentinel.
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="canManage"
            class="flex items-center gap-3"
          >
            <button
              class="rounded-xl border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover"
              @click="showDisconnectModal = true"
            >
              Disconnect
            </button>
            <a
              :href="`https://github.com/settings/installations/${installation?.installation_id}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-glow"
            >
              <Icon
                name="lucide:external-link"
                class="size-4"
              />
              Manage on GitHub
            </a>
          </div>
        </template>

        <!-- Failed State -->
        <template v-else-if="isFailed">
          <div class="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <div class="flex items-start gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20">
                <Icon
                  name="lucide:x-circle"
                  class="size-5 text-red-400"
                />
              </div>
              <div>
                <p class="text-sm font-medium text-red-400">
                  Connection Failed
                </p>
                <p class="mt-1 text-sm text-text-secondary">
                  We couldn't complete the connection to GitHub. This might be due to network issues or permission problems.
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="canManage"
            class="flex items-center gap-3"
          >
            <button
              class="rounded-xl border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover"
              @click="showDisconnectModal = true"
            >
              Cancel
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isConnecting"
              @click="$emit('connect')"
            >
              <Icon
                v-if="isConnecting"
                name="lucide:loader-2"
                class="size-4 animate-spin"
              />
              <Icon
                v-else
                name="lucide:refresh-cw"
                class="size-4"
              />
              Try Again
            </button>
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
        <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-red-500/10">
          <Icon
            name="lucide:unlink"
            class="size-8 text-red-400"
          />
        </div>
        <h3 class="mb-2 text-lg font-semibold text-text-primary">
          Disconnect GitHub?
        </h3>
        <p class="text-sm text-text-secondary">
          This will disable automated code reviews for all repositories in this workspace. You can reconnect anytime.
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <button
            class="flex-1 rounded-xl border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover"
            @click="showDisconnectModal = false"
          >
            Cancel
          </button>
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isDisconnecting"
            @click="handleDisconnect"
          >
            <Icon
              v-if="isDisconnecting"
              name="lucide:loader-2"
              class="size-4 animate-spin"
            />
            <Icon
              v-else
              name="lucide:unlink"
              class="size-4"
            />
            Disconnect
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.hover\:shadow-glow:hover {
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.4);
}
</style>

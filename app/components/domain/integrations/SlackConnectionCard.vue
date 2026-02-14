<script setup lang="ts">
import type { SlackIntegration, SlackChannel } from '~/types'

/**
 * SlackConnectionCard - Slack OAuth integration card
 * Three states: not connected, connected (no channel), connected (with channel)
 */

interface Props {
  integration: SlackIntegration | null
  channels: readonly SlackChannel[]
  isLoading?: boolean
  isConnecting?: boolean
  isDisconnecting?: boolean
  isFetchingChannels?: boolean
  isUpdatingChannel?: boolean
  canManage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isConnecting: false,
  isDisconnecting: false,
  isFetchingChannels: false,
  isUpdatingChannel: false,
  canManage: false,
})

const emit = defineEmits<{
  connect: []
  disconnect: []
  'fetch-channels': []
  'update-channel': [channelId: string, channelName: string]
}>()

const isConnected = computed(() => props.integration?.is_connected ?? false)
const hasChannel = computed(() => props.integration?.has_channel ?? false)

// Channel selection
const selectedChannelId = ref('')
const showDisconnectConfirm = ref(false)

// When connected without channel, auto-fetch channels
watch(
  () => props.integration,
  (newVal) => {
    if (newVal?.is_connected && !newVal.has_channel) {
      emit('fetch-channels')
    }
  },
)

function handleSaveChannel() {
  const channel = props.channels.find((c) => c.id === selectedChannelId.value)
  if (!channel) return
  emit('update-channel', channel.id, `#${channel.name}`)
}

function handleDisconnect() {
  showDisconnectConfirm.value = false
  emit('disconnect')
}

// Reset disconnect confirm when card changes state
watch(
  () => props.isDisconnecting,
  (val) => {
    if (!val) {
      showDisconnectConfirm.value = false
    }
  },
)
</script>

<template>
  <div class="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated transition-all duration-300 hover:border-border-muted hover:shadow-lg hover:shadow-black/5">
    <!-- Top accent line -->
    <div
      class="absolute inset-x-0 top-0 h-[2px] transition-all duration-500"
      :class="isConnected
        ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 opacity-100'
        : 'bg-gradient-to-r from-slate-600 to-slate-500 opacity-40'"
    />

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-4"
      >
        <div class="flex items-center gap-4">
          <div class="size-12 animate-pulse rounded-xl bg-bg-hover" />
          <div class="flex-1 space-y-2">
            <div class="h-5 w-32 animate-pulse rounded-lg bg-bg-hover" />
            <div class="h-4 w-48 animate-pulse rounded-lg bg-bg-hover" />
          </div>
        </div>
      </div>

      <!-- Not Connected State -->
      <div
        v-else-if="!isConnected"
        class="space-y-5"
      >
        <div class="flex items-start gap-4">
          <div class="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 ring-1 ring-purple-500/20">
            <Icon
              name="lucide:message-square"
              class="size-6 text-purple-400"
            />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-semibold text-text-primary">
                Slack
              </h3>
              <span class="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-muted">
                Not Connected
              </span>
            </div>
            <p class="mt-1 text-sm text-text-muted">
              Send briefings and notifications to a Slack channel
            </p>
          </div>
        </div>

        <!-- Features -->
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div class="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-surface p-2.5 text-xs text-text-secondary">
            <Icon
              name="lucide:bell"
              class="size-3.5 text-purple-400"
            />
            Briefing delivery
          </div>
          <div class="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-surface p-2.5 text-xs text-text-secondary">
            <Icon
              name="lucide:zap"
              class="size-3.5 text-purple-400"
            />
            Real-time alerts
          </div>
          <div class="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-surface p-2.5 text-xs text-text-secondary">
            <Icon
              name="lucide:users"
              class="size-3.5 text-purple-400"
            />
            Team updates
          </div>
        </div>

        <!-- Add to Slack Button -->
        <BaseButton
          v-if="canManage"
          variant="primary"
          class="w-full"
          :loading="isConnecting"
          :disabled="isConnecting"
          @click="$emit('connect')"
        >
          <Icon
            v-if="!isConnecting"
            name="lucide:plug"
            class="mr-2 size-4"
          />
          Add to Slack
        </BaseButton>
        <p
          v-else
          class="text-center text-xs text-text-muted"
        >
          Ask a workspace admin to connect Slack.
        </p>
      </div>

      <!-- Connected State (no channel selected) -->
      <div
        v-else-if="isConnected && !hasChannel"
        class="space-y-4"
      >
        <div class="flex items-start gap-4">
          <div class="relative flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 ring-1 ring-purple-500/20">
            <Icon
              name="lucide:message-square"
              class="size-6 text-purple-400"
            />
            <span class="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full border-2 border-bg-elevated bg-amber-500">
              <Icon
                name="lucide:minus"
                class="size-2.5 text-white"
              />
            </span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-semibold text-text-primary">
                Slack
              </h3>
              <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                <span class="size-1.5 rounded-full bg-amber-400" />
                Select Channel
              </span>
            </div>
            <p class="mt-0.5 text-sm text-text-muted">
              {{ integration?.team_name ?? 'Connected' }} &middot; Choose a default channel
            </p>
          </div>
        </div>

        <!-- Channel Selector -->
        <div
          v-if="canManage"
          class="space-y-3"
        >
          <div class="rounded-xl border border-border-subtle bg-bg-surface p-4">
            <label class="mb-2 block text-xs font-medium text-text-secondary">
              Default Channel
            </label>
            <div class="flex items-center gap-2">
              <select
                v-model="selectedChannelId"
                class="flex-1 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                :disabled="isFetchingChannels"
              >
                <option
                  value=""
                  disabled
                >
                  {{ isFetchingChannels ? 'Loading channels...' : 'Select a channel' }}
                </option>
                <option
                  v-for="channel in channels"
                  :key="channel.id"
                  :value="channel.id"
                >
                  #{{ channel.name }} ({{ channel.num_members }} members)
                </option>
              </select>
              <BaseButton
                variant="primary"
                size="sm"
                :loading="isUpdatingChannel"
                :disabled="!selectedChannelId || isUpdatingChannel"
                @click="handleSaveChannel"
              >
                Save
              </BaseButton>
            </div>
            <p class="mt-2 text-[11px] text-text-muted">
              Briefings and notifications will be sent to this channel.
            </p>
          </div>

          <!-- Disconnect option -->
          <div class="flex justify-end">
            <button
              class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-error/10 hover:text-error"
              @click="showDisconnectConfirm = true"
            >
              <Icon
                name="lucide:unplug"
                class="size-3.5"
              />
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <!-- Connected State (with channel) -->
      <div
        v-else
        class="space-y-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="relative flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 ring-1 ring-purple-500/20">
              <Icon
                name="lucide:message-square"
                class="size-6 text-purple-400"
              />
              <!-- Connected indicator -->
              <span class="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full border-2 border-bg-elevated bg-emerald-500">
                <Icon
                  name="lucide:check"
                  class="size-2.5 text-white"
                />
              </span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-semibold text-text-primary">
                  Slack
                </h3>
                <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  <span class="size-1.5 rounded-full bg-emerald-400" />
                  Connected
                </span>
              </div>
              <p class="mt-0.5 text-sm text-text-muted">
                {{ integration?.channel_name }}
                <template v-if="integration?.team_name">
                  &middot; {{ integration.team_name }}
                </template>
              </p>
            </div>
          </div>
        </div>

        <!-- Connected info -->
        <div class="rounded-xl border border-border-subtle bg-bg-surface p-3">
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p class="text-text-muted">
                Channel
              </p>
              <p class="mt-0.5 font-medium text-text-primary">
                {{ integration?.channel_name || 'Not specified' }}
              </p>
            </div>
            <div>
              <p class="text-text-muted">
                Team
              </p>
              <p class="mt-0.5 font-medium text-text-primary">
                {{ integration?.team_name || 'Not specified' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Disconnect -->
        <div
          v-if="canManage"
          class="flex items-center justify-end"
        >
          <template v-if="!showDisconnectConfirm">
            <button
              class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-error/10 hover:text-error"
              @click="showDisconnectConfirm = true"
            >
              <Icon
                name="lucide:unplug"
                class="size-3.5"
              />
              Disconnect
            </button>
          </template>
          <template v-else>
            <div class="flex items-center gap-2">
              <span class="text-xs text-text-muted">Disconnect Slack?</span>
              <BaseButton
                variant="danger"
                size="sm"
                :loading="isDisconnecting"
                @click="handleDisconnect"
              >
                Confirm
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="sm"
                :disabled="isDisconnecting"
                @click="showDisconnectConfirm = false"
              >
                Cancel
              </BaseButton>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

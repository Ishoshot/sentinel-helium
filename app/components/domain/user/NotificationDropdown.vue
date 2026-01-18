<script setup lang="ts">
import type { Notification } from '~/types'

/**
 * NotificationDropdown - User notification center
 * Domain component for displaying and managing notifications
 */

interface Props {
  notifications: readonly Notification[]
  unreadCount: number
  isLoading?: boolean
  isMarkingRead?: boolean
}

interface Emits {
  (e: 'fetch'): void
  (e: 'markAllRead'): void
  (e: 'markRead', id: string): void
  (e: 'markUnread', id: string): void
}

const props = withDefaults(defineProps<Props>(), {
  unreadCount: 0,
  isLoading: false,
  isMarkingRead: false,
})

const emit = defineEmits<Emits>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Handle click outside to close dropdown
function handleDocumentClick(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

// Fetch notifications when dropdown opens
watch(isOpen, (open) => {
  if (open) {
    emit('fetch')
  }
})

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// Get icon for notification type
function getNotificationIcon(type: string): string {
  const iconMap: Record<string, string> = {
    workspace_invitation: 'lucide:mail',
    member_joined: 'lucide:user-plus',
    member_left: 'lucide:user-minus',
    run_completed: 'lucide:check-circle',
    run_failed: 'lucide:x-circle',
    repository_synced: 'lucide:refresh-cw',
    github_connected: 'lucide:github',
    github_disconnected: 'lucide:unlink',
  }
  return iconMap[type] ?? 'lucide:bell'
}

</script>

<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      class="relative p-2 text-text-muted hover:text-text-secondary transition-colors rounded-lg hover:bg-bg-surface"
      aria-label="Notifications"
      @click="isOpen = !isOpen"
    >
      <Icon
        name="lucide:bell"
        class="w-5 h-5"
      />
      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute top-1 right-1 w-2 h-2 bg-accent-primary rounded-full"
      />
    </button>

    <!-- Dropdown Panel -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-80 bg-bg-elevated border border-border-subtle rounded-xl shadow-lg z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <h3 class="text-sm font-medium text-text-primary">
            Notifications
          </h3>
          <button
            v-if="unreadCount > 0"
            type="button"
            class="text-xs text-accent-primary hover:text-accent-primary/80 transition-colors disabled:opacity-50"
            :disabled="isMarkingRead"
            @click="emit('markAllRead')"
          >
            Mark all read
          </button>
        </div>

        <!-- Content -->
        <div class="max-h-96 overflow-y-auto">
          <!-- Loading State -->
          <div
            v-if="isLoading"
            class="px-4 py-8"
          >
            <div class="flex flex-col items-center gap-3">
              <Icon
                name="lucide:loader-2"
                class="w-5 h-5 text-text-muted animate-spin"
              />
              <span class="text-sm text-text-muted">Loading...</span>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="notifications.length === 0"
            class="px-4 py-8"
          >
            <div class="flex flex-col items-center gap-2 text-center">
              <Icon
                name="lucide:bell-off"
                class="w-8 h-8 text-text-muted"
              />
              <p class="text-sm text-text-muted">
                No notifications yet
              </p>
            </div>
          </div>

          <!-- Notification List -->
          <div
            v-else
            class="divide-y divide-border-subtle"
          >
            <button
              v-for="notification in notifications"
              :key="notification.id"
              type="button"
              class="w-full text-left px-4 py-3 hover:bg-bg-surface transition-colors"
              :class="{ 'bg-accent-primary/5': !notification.read_at }"
              @click="notification.read_at ? emit('markUnread', notification.id) : emit('markRead', notification.id)"
            >
              <div class="flex gap-3">
                <!-- Icon -->
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  :class="notification.read_at ? 'bg-bg-surface' : 'bg-accent-primary/10'"
                >
                  <Icon
                    :name="getNotificationIcon(notification.type)"
                    class="w-4 h-4"
                    :class="notification.read_at ? 'text-text-muted' : 'text-accent-primary'"
                  />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm leading-snug"
                    :class="notification.read_at ? 'text-text-secondary' : 'text-text-primary font-medium'"
                  >
                    {{ notification.title }}
                  </p>
                  <p
                    v-if="notification.message"
                    class="text-xs text-text-muted mt-0.5 line-clamp-2"
                  >
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-text-muted mt-1">
                    {{ formatRelativeTime(notification.created_at) }}
                  </p>
                </div>

                <!-- Unread Indicator -->
                <div
                  v-if="!notification.read_at"
                  class="flex-shrink-0 w-2 h-2 mt-2 bg-accent-primary rounded-full"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types'
import { useAuth } from '~/composables/useAuth'

/**
 * UserMenu - User avatar with dropdown menu
 * Domain component for user actions
 */

interface Props {
  user: User
}

defineProps<Props>()

const { logout, isLoading } = useAuth()

// Menu items
const menuItems = computed(() => [
  {
    label: 'Sign out',
    icon: 'lucide:log-out',
    action: () => logout(),
  },
])
</script>

<template>
  <BaseDropdown
    :items="menuItems"
    align="left"
    direction="up"
    class="w-full"
  >
    <template #trigger>
      <button class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bg-surface transition-default group">
        <BaseAvatar
          :src="user.avatar_url"
          :name="user.name"
          size="sm"
        />
        <div class="flex-1 text-left hidden sm:block">
          <p class="text-sm font-medium text-text-primary truncate">{{ user.name }}</p>
          <p class="text-xs text-text-muted truncate">View Profile</p>
        </div>
        <Icon
          name="lucide:chevron-up"
          class="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
        />

        <!-- Loading indicator during logout -->
        <BaseSpinner
          v-if="isLoading"
          size="sm"
        />
      </button>
    </template>
  </BaseDropdown>
</template>

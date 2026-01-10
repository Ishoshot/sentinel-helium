<script setup lang="ts">
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useNotifications } from '~/composables/useNotifications'

/**
 * Default layout - full app shell with sidebar and header
 */

const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const route = useRoute()

// Notifications
const {
  notifications,
  unreadCount,
  isLoading: isLoadingNotifications,
  isMarkingRead,
  fetchNotifications,
  fetchUnreadCount,
  markAllAsRead,
  markAsRead,
  markAsUnread,
} = useNotifications()

// Fetch unread count on mount
onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchUnreadCount()
  }
})

// Main navigation items
const mainNavItems = computed(() => {
  const workspace = workspaceStore.currentWorkspaceSlug
  if (!workspace) return []

  return [
    {
      label: 'Overview',
      to: `/${workspace}`,
      icon: 'lucide:layout-dashboard',
    },
    {
      label: 'Repositories',
      to: `/${workspace}/repositories`,
      icon: 'lucide:folder-git-2',
    },
    {
      label: 'Code Reviews',
      to: `/${workspace}/reviews`,
      icon: 'lucide:git-pull-request',
    },
  ]
})

// Workspace management items
const workspaceNavItems = computed(() => {
  const workspace = workspaceStore.currentWorkspaceSlug
  if (!workspace) return []

  return [
    {
      label: 'Members',
      to: `/${workspace}/members`,
      icon: 'lucide:users',
    },
    {
      label: 'Integrations',
      to: `/${workspace}/settings/integrations`,
      icon: 'lucide:plug',
    },
    {
      label: 'Settings',
      to: `/${workspace}/settings`,
      icon: 'lucide:settings',
    },
  ]
})

// Check if nav item is active
function isActive(path: string): boolean {
  // Exact match for most routes
  if (route.path === path) return true
  // For settings, only highlight if on exact settings page (not sub-pages like integrations)
  if (path.endsWith('/settings') && route.path.includes('/settings/')) return false
  // For integrations, match the exact route
  return false
}

// Breadcrumb items
const breadcrumbs = computed(() => {
  const workspace = workspaceStore.currentWorkspace
  if (!workspace) return []

  const segments = route.path.split('/').filter(Boolean)
  const items = [{ label: workspace.name, to: `/${workspace.slug}` }]

  const pageMap: Record<string, string> = {
    members: 'Members',
    settings: 'Settings',
    repositories: 'Repositories',
    reviews: 'Code Reviews',
    integrations: 'Integrations',
  }

  // Build breadcrumbs for each segment after workspace
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i]
    if (!segment) continue
    const pageName = pageMap[segment] || segment
    const path = '/' + segments.slice(0, i + 1).join('/')
    items.push({ label: pageName, to: path })
  }

  return items
})
</script>

<template>
  <div class="min-h-screen bg-bg-app">
    <!-- Sidebar -->
    <aside class="fixed top-0 left-0 bottom-0 w-64 bg-bg-elevated border-r border-border-subtle z-40 flex flex-col">
      <!-- Workspace Switcher (Header) -->
      <div class="h-16 px-5 mt-1 flex items-center">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 bg-text-primary rounded-lg flex items-center justify-center">
            <Icon
              name="lucide:shield-check"
              class="w-4 h-4 text-white"
            />
          </div>
          <span class="text-lg font-semibold text-text-primary">Sentinel</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-4 py-5">
        <!-- Main Navigation -->
        <div class="space-y-3">
          <NuxtLink
            v-for="item in mainNavItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-default"
            :class="[
              isActive(item.to)
                ? 'bg-accent/10 text-accent font-medium'
                : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
            ]"
          >
            <Icon
              :name="item.icon"
              class="w-5 h-5"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>

        <!-- Workspace Section -->
        <div class="mt-20">
          <p class="px-3 mb-4 text-xs font-medium text-text-muted uppercase tracking-wider">
            Workspace
          </p>
          <div class="space-y-3">
            <NuxtLink
              v-for="item in workspaceNavItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-default"
              :class="[
                isActive(item.to)
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
              ]"
            >
              <Icon
                :name="item.icon"
                class="w-5 h-5"
              />
              <span>{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- User Section -->
      <div class="p-4 border-t border-border-subtle">
        <DomainUserMenu
          v-if="userStore.isAuthenticated"
          :user="userStore.user!"
        />
      </div>
    </aside>

    <!-- Main Area -->
    <div class="pl-64">
      <!-- Top Header -->
      <header class="sticky top-0 h-16 bg-bg-elevated border-b border-border-subtle z-30">
        <div class="h-full px-8 flex items-center justify-between">
          <!-- Left: Breadcrumbs -->
          <div class="flex items-center gap-10">
            <DomainWorkspaceSwitcher v-if="workspaceStore.hasCurrentWorkspace" />
            <nav class="flex items-center gap-2 text-sm">
              <template
                v-for="(crumb, index) in breadcrumbs"
                :key="crumb.to"
              >
                <Icon
                  v-if="index > 0"
                  name="lucide:chevron-right"
                  class="w-4 h-4 text-text-muted"
                />
                <NuxtLink
                  :to="crumb.to"
                  class="transition-default"
                  :class="[
                    index === breadcrumbs.length - 1
                      ? 'text-text-primary font-medium'
                      : 'text-text-muted hover:text-text-secondary'
                  ]"
                >
                  {{ crumb.label }}
                </NuxtLink>
              </template>
            </nav>
          </div>


          <!-- Right: Actions -->
          <div class="flex items-center gap-4">
            <DomainNotificationDropdown
              v-if="userStore.isAuthenticated"
              :notifications="notifications"
              :unread-count="unreadCount"
              :is-loading="isLoadingNotifications"
              :is-marking-read="isMarkingRead"
              @fetch="fetchNotifications"
              @mark-all-read="markAllAsRead"
              @mark-read="markAsRead"
              @mark-unread="markAsUnread"
            />
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

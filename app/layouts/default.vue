<script setup lang="ts">
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useNotifications } from '~/composables/user/useNotifications'
import DomainUserUserMenu from '~/components/domain/user/UserMenu.vue'
import DomainWorkspaceWorkspaceSwitcher from '~/components/domain/workspace/WorkspaceSwitcher.vue'

/**
 * Default layout - full app shell with sidebar and header
 */

const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const route = useRoute()
const isMobileNavOpen = ref(false)
const isSidebarCollapsed = ref(false)

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

// Fetch unread count on mount and load sidebar state
onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchUnreadCount()
  }

  // Load sidebar collapsed state from localStorage
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    isSidebarCollapsed.value = savedState === 'true'
  }
})

// Main navigation items
const mainNavItems = computed(() => {
  const workspace = workspaceStore.currentWorkspaceSlug || (route.params.workspace as string)
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

// Help/Learn navigation item
const helpNavItem = computed(() => {
  const workspace = workspaceStore.currentWorkspaceSlug || (route.params.workspace as string)
  if (!workspace) return null

  return {
    label: 'Learn',
    to: `/${workspace}/learn`,
    icon: 'lucide:book-open',
  }
})

// Workspace management items
const workspaceNavItems = computed(() => {
  const workspace = workspaceStore.currentWorkspaceSlug || (route.params.workspace as string)
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
      label: 'API Keys',
      to: `/${workspace}/settings/api-keys`,
      icon: 'lucide:key',
    },
    {
      label: 'Billing',
      to: `/${workspace}/settings/billing`,
      icon: 'lucide:credit-card',
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
  // Exact match
  if (route.path === path) return true

  // For workspace root (Overview), only match exactly, not nested routes
  if (path.split('/').length === 2) {
    // This is a workspace root path like /workspace-slug
    return false
  }

  // For nested routes, check if current path starts with the nav item path
  // But exclude settings page when on settings sub-pages
  if (path.endsWith('/settings') && !route.path.endsWith('/settings')) {
    // We're on a settings sub-page, don't highlight the main settings item
    return false
  }

  // For other routes, highlight if we're on a nested page
  // e.g., /workspace/repositories should be active when on /workspace/repositories/123
  if (route.path.startsWith(path + '/')) {
    return true
  }

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

watch(
  () => route.fullPath,
  () => {
    isMobileNavOpen.value = false
  }
)

function toggleMobileNav() {
  isMobileNavOpen.value = !isMobileNavOpen.value
}

function closeMobileNav() {
  isMobileNavOpen.value = false
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value.toString())
}
</script>

<template>
  <div class="min-h-screen bg-bg-app">
    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 bottom-0 bg-bg-elevated border-r border-border-subtle z-40 hidden lg:flex flex-col transition-all duration-300"
      :class="isSidebarCollapsed ? 'w-16' : 'w-56'"
    >
      <!-- Workspace Switcher (Header) -->
      <div class="h-16 mt-1 pt-3 flex items-center transition-all duration-300" :class="isSidebarCollapsed ? 'px-2 justify-center' : 'px-5'">
        <NuxtLink to="/" class="flex items-center">
          <SentinelLogo v-if="!isSidebarCollapsed" size="lg" />
          <div
            v-else
            class="w-8 h-8 bg-text-primary rounded-lg flex items-center justify-center shrink-0"
          >
            <Icon
              name="lucide:shield-check"
              class="w-4 h-4 text-white"
            />
          </div>
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-8 transition-all duration-300" :class="isSidebarCollapsed ? 'px-2' : 'px-4'">
        <!-- Main Navigation -->
        <div class="space-y-3" :class="isSidebarCollapsed ? 'flex flex-col items-center' : ''">
          <NuxtLink
            v-for="item in mainNavItems"
            :key="item.to"
            :to="item.to"
            :title="isSidebarCollapsed ? item.label : undefined"
            class="group flex items-center gap-3 rounded-xl text-sm transition-all duration-200 border-l-2"
            :class="[
              isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5',
              isActive(item.to)
                ? 'bg-accent/10 text-accent font-medium shadow-sm border-accent'
                : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary hover:translate-x-0.5 border-transparent'
            ]"
          >
            <Icon
              :name="item.icon"
              class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            <span
              class="whitespace-nowrap overflow-hidden transition-all duration-300"
              :class="isSidebarCollapsed ? 'opacity-0 max-w-0 w-0' : 'opacity-100 max-w-full'"
            >
              {{ item.label }}
            </span>
          </NuxtLink>
        </div>

        <!-- Divider -->
        <div v-if="!isSidebarCollapsed" class="h-px bg-border-subtle my-6 mx-4" />

        <!-- Workspace Section -->
        <div :class="isSidebarCollapsed ? 'mt-6' : 'mt-8'">
          <p
            class="px-3 mb-3 text-xs font-semibold text-text-muted uppercase tracking-wide overflow-hidden transition-all duration-300"
            :class="isSidebarCollapsed ? 'opacity-0 max-h-0 mb-0' : 'opacity-100 max-h-8'"
          >
            Workspace
          </p>
          <div class="space-y-3" :class="isSidebarCollapsed ? 'flex flex-col items-center' : ''">
            <NuxtLink
              v-for="item in workspaceNavItems"
              :key="item.to"
              :to="item.to"
              :title="isSidebarCollapsed ? item.label : undefined"
              class="group flex items-center gap-3 rounded-xl text-sm transition-all duration-200 border-l-2"
              :class="[
                isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5',
                isActive(item.to)
                  ? 'bg-accent/10 text-accent font-medium shadow-sm border-accent'
                  : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary hover:translate-x-0.5 border-transparent'
              ]"
            >
              <Icon
                :name="item.icon"
                class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              <span
                class="whitespace-nowrap overflow-hidden transition-all duration-300"
                :class="isSidebarCollapsed ? 'opacity-0 max-w-0 w-0' : 'opacity-100 max-w-full'"
              >
                {{ item.label }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Learn/Help Link -->
        <div :class="isSidebarCollapsed ? 'mt-6' : 'mt-8'">
          <NuxtLink
            v-if="helpNavItem"
            :to="helpNavItem.to"
            :title="isSidebarCollapsed ? helpNavItem.label : undefined"
            class="group flex items-center gap-3 rounded-xl text-sm transition-all duration-200 border-l-2"
            :class="[
              isSidebarCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5',
              isActive(helpNavItem.to)
                ? 'bg-accent/10 text-accent font-medium shadow-sm border-accent'
                : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary hover:translate-x-0.5 border-transparent'
            ]"
          >
            <Icon
              :name="helpNavItem.icon"
              class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            <span
              class="whitespace-nowrap overflow-hidden transition-all duration-300"
              :class="isSidebarCollapsed ? 'opacity-0 max-w-0 w-0' : 'opacity-100 max-w-full'"
            >
              {{ helpNavItem.label }}
            </span>
          </NuxtLink>
        </div>
      </nav>

      <!-- User Section -->
      <div class="border-t border-border-subtle">
        <div
          class="overflow-hidden border-b bg-bg-surface/50 transition-all duration-300"
          :class="isSidebarCollapsed ? 'opacity-0 max-h-0 p-0 border-transparent' : 'opacity-100 max-h-20 p-3 border-border-subtle'"
        >
          <DomainUserUserMenu
            v-if="userStore.isAuthenticated"
            :user="userStore.user!"
          />
        </div>
        <button
          class="w-full p-3 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated"
          :title="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="toggleSidebar"
        >
          <Icon
            :name="isSidebarCollapsed ? 'lucide:chevron-right' : 'lucide:chevron-left'"
            class="w-5 h-5 transition-transform duration-200"
          />
        </button>
      </div>
    </aside>

    <!-- Mobile Navigation Drawer -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileNavOpen"
        class="fixed inset-0 z-50 lg:hidden"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="closeMobileNav"
        />
        <div class="relative h-full w-[80vw] max-w-xs bg-bg-elevated border-r border-border-subtle flex flex-col">
          <div class="h-16 px-5 flex items-center justify-between border-b border-border-subtle">
            <NuxtLink to="/" class="flex items-center">
              <SentinelLogo size="xs" />
            </NuxtLink>
            <button
              class="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-surface transition-default"
              @click="closeMobileNav"
            >
              <Icon
                name="lucide:x"
                class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
            </button>
          </div>

          <nav class="flex-1 overflow-y-auto px-4 py-5">
            <div
              v-if="workspaceStore.hasCurrentWorkspace"
              class="mb-6"
            >
              <DomainWorkspaceWorkspaceSwitcher />
            </div>
            <div class="space-y-3">
              <NuxtLink
                v-for="item in mainNavItems"
                :key="item.to"
                :to="item.to"
                class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border-l-2"
                :class="[
                  isActive(item.to)
                    ? 'bg-accent/10 text-accent font-medium shadow-sm border-accent'
                    : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary border-transparent'
                ]"
              >
                <Icon
                  :name="item.icon"
                  class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <span>{{ item.label }}</span>
              </NuxtLink>
            </div>

            <!-- Divider -->
            <div class="h-px bg-border-subtle my-6 mx-4" />

            <div class="mt-6">
              <p class="px-3 mb-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                Workspace
              </p>
              <div class="space-y-3">
                <NuxtLink
                  v-for="item in workspaceNavItems"
                  :key="item.to"
                  :to="item.to"
                  class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border-l-2"
                  :class="[
                    isActive(item.to)
                      ? 'bg-accent/10 text-accent font-medium shadow-sm border-accent'
                      : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary border-transparent'
                  ]"
                >
                  <Icon
                    :name="item.icon"
                    class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                  />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Learn/Help Link (Mobile) -->
            <div class="mt-6">
              <NuxtLink
                v-if="helpNavItem"
                :to="helpNavItem.to"
                class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border-l-2"
                :class="[
                  isActive(helpNavItem.to)
                    ? 'bg-accent/10 text-accent font-medium shadow-sm border-accent'
                    : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary border-transparent'
                ]"
              >
                <Icon
                  :name="helpNavItem.icon"
                  class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <span>{{ helpNavItem.label }}</span>
              </NuxtLink>
            </div>
          </nav>

          <div class="p-4 border-t border-border-subtle">
            <DomainUserUserMenu
              v-if="userStore.isAuthenticated"
              :user="userStore.user!"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main Area -->
    <div
      class="transition-all duration-300"
      :class="isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56'"
    >
      <!-- Top Header -->
      <header class="sticky py-10 top-0 h-16 bg-bg-elevated border-b border-border-subtle z-30">
        <div class="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <!-- Left: Breadcrumbs -->
          <div class="flex items-center gap-4 min-w-0">
            <button
              class="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-surface transition-default lg:hidden"
              @click="toggleMobileNav"
            >
              <Icon
                name="lucide:menu"
                class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
            </button>
            <DomainWorkspaceWorkspaceSwitcher
              v-if="workspaceStore.hasCurrentWorkspace"
              class="hidden sm:flex"
            />
            <nav class="flex items-center gap-2 text-xs sm:text-sm min-w-0">
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
                  class="transition-default truncate max-w-[10rem] sm:max-w-[12rem]"
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
            <DomainUserNotificationDropdown
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
      <main class="min-h-screen">
        <slot />
      </main>
    </div>
  </div>
</template>

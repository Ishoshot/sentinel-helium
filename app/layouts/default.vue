<script setup lang="ts">
import { useUserStore } from '~/stores/useUserStore'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useNotifications } from '~/composables/user/useNotifications'
import { useGettingStarted } from '~/composables/useGettingStarted'
import DomainUserUserMenu from '~/components/domain/user/UserMenu.vue'
import DomainWorkspaceWorkspaceSwitcher from '~/components/domain/workspace/WorkspaceSwitcher.vue'
import GettingStartedPanel from '~/components/GettingStartedPanel.vue'

/**
 * Default layout - App shell with dark sidebar and refined navigation
 */

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const userStore = useUserStore()
const workspaceStore = useWorkspaceStore()
const route = useRoute()
const isMobileNavOpen = ref(false)
const isSidebarCollapsed = ref(false)

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

const {
  isGettingStartedOpen,
  toggleGettingStarted,
  closeGettingStarted,
  checkAndShowForFirstTime,
} = useGettingStarted()

onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchUnreadCount()
    checkAndShowForFirstTime()
  }

  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    isSidebarCollapsed.value = savedState === 'true'
  }
})

const mainNavItems = computed(() => {
  const workspace = workspaceStore.currentWorkspaceSlug || (route.params.workspace as string)
  if (!workspace) return []

  return [
    { label: 'Overview', to: `/${workspace}`, icon: 'lucide:layout-dashboard' },
    { label: 'Repositories', to: `/${workspace}/repositories`, icon: 'lucide:folder-git-2' },
    { label: 'Code Reviews', to: `/${workspace}/reviews`, icon: 'lucide:git-pull-request' },
    { label: 'Briefings', to: `/${workspace}/briefings`, icon: 'lucide:sparkles' },
  ]
})

const helpNavItem = computed(() => {
  const workspace = workspaceStore.currentWorkspaceSlug || (route.params.workspace as string)
  if (!workspace) return null
  return { label: 'Learn', to: `/${workspace}/learn`, icon: 'lucide:book-open' }
})

const workspaceNavItems = computed(() => {
  const workspace = workspaceStore.currentWorkspaceSlug || (route.params.workspace as string)
  if (!workspace) return []

  return [
    { label: 'Members', to: `/${workspace}/members`, icon: 'lucide:users' },
    { label: 'Settings', to: `/${workspace}/settings`, icon: 'lucide:settings' },
    { label: 'Integrations', to: `/${workspace}/settings/integrations`, icon: 'lucide:plug' },
    { label: 'API Keys', to: `/${workspace}/settings/api-keys`, icon: 'lucide:key' },
    { label: 'Billing', to: `/${workspace}/settings/billing`, icon: 'lucide:credit-card' },
  ]
})

function isActive(path: string): boolean {
  if (route.path === path) return true
  if (path.split('/').length === 2) return false
  if (path.endsWith('/settings') && !route.path.endsWith('/settings')) return false
  if (route.path.startsWith(path + '/')) return true
  return false
}

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
    briefings: 'Briefings',
    generations: 'Generations',
  }

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i]
    if (!segment) continue
    const pageName = pageMap[segment] || segment
    const path = '/' + segments.slice(0, i + 1).join('/')
    items.push({ label: pageName, to: path })
  }

  return items
})

watch(() => route.fullPath, () => {
  isMobileNavOpen.value = false
})

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
  <div class="min-h-screen bg-bg-app overscroll-none">
    <!-- Sidebar -->
    <aside
      class="sidebar fixed inset-y-0 left-0 z-40 hidden flex-col bg-bg-surface border-r border-border-subtle lg:flex"
      :class="isSidebarCollapsed ? 'w-[68px]' : 'w-56'"
    >
      <!-- Logo -->
      <div
        class="flex h-14 shrink-0 items-center border-b border-border-subtle"
        :class="isSidebarCollapsed ? 'justify-center px-2' : 'px-4'"
      >
        <NuxtLink
          to="/"
          class="flex items-center justify-center"
        >
          <SentinelLogo
            :size="isSidebarCollapsed ? 'sm' : 'md'"
            :show-text="!isSidebarCollapsed"
          />
        </NuxtLink>
      </div>

      <!-- Navigation -->
      <nav
        class="flex-1 overflow-y-auto py-6 scrollbar-dark"
        :class="isSidebarCollapsed ? 'px-2' : 'px-3'"
      >
        <!-- Main Navigation -->
        <div class="space-y-3">
          <NuxtLink
            v-for="item in mainNavItems"
            :key="item.to"
            :to="item.to"
            :title="isSidebarCollapsed ? item.label : undefined"
            class="nav-item group relative flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-150"
            :class="[
              isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
              isActive(item.to)
                ? 'nav-item-active text-white'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            ]"
          >
            <Icon
              :name="item.icon"
              class="size-[18px] shrink-0"
            />
            <span
              v-if="!isSidebarCollapsed"
              class="truncate"
            >
              {{ item.label }}
            </span>
            <!-- Active indicator dot for collapsed state -->
            <span
              v-if="isSidebarCollapsed && isActive(item.to)"
              class="absolute -right-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-accent-bright"
            />
          </NuxtLink>
        </div>

        <!-- Workspace Section -->
        <div class="mt-8">
          <p
            v-if="!isSidebarCollapsed"
            class="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-faint"
          >
            Workspace
          </p>
          <div
            v-else
            class="mx-auto mb-3 h-px w-5 bg-border-subtle"
          />
          <div class="space-y-3">
            <NuxtLink
              v-for="item in workspaceNavItems"
              :key="item.to"
              :to="item.to"
              :title="isSidebarCollapsed ? item.label : undefined"
              class="nav-item group relative flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-150"
              :class="[
                isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                isActive(item.to)
                  ? 'nav-item-active text-white'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              ]"
            >
              <Icon
                :name="item.icon"
                class="size-[18px] shrink-0"
              />
              <span
                v-if="!isSidebarCollapsed"
                class="truncate"
              >
                {{ item.label }}
              </span>
              <span
                v-if="isSidebarCollapsed && isActive(item.to)"
                class="absolute -right-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-accent-bright"
              />
            </NuxtLink>
          </div>
        </div>

        <!-- Learn/Help -->
        <div class="mt-8">
          <NuxtLink
            v-if="helpNavItem"
            :to="helpNavItem.to"
            :title="isSidebarCollapsed ? helpNavItem.label : undefined"
            class="nav-item group relative flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-150"
            :class="[
              isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
              isActive(helpNavItem.to)
                ? 'nav-item-active text-white'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            ]"
          >
            <Icon
              :name="helpNavItem.icon"
              class="size-[18px] shrink-0"
            />
            <span
              v-if="!isSidebarCollapsed"
              class="truncate"
            >
              {{ helpNavItem.label }}
            </span>
            <span
              v-if="isSidebarCollapsed && isActive(helpNavItem.to)"
              class="absolute -right-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-accent-bright"
            />
          </NuxtLink>
        </div>
      </nav>

      <!-- Bottom Section -->
      <div class="shrink-0 border-t border-border-subtle">
        <!-- User Menu -->
        <div
          v-if="!isSidebarCollapsed"
          class="p-3"
        >
          <DomainUserUserMenu
            v-if="userStore.isAuthenticated"
            :user="userStore.user!"
          />
        </div>

        <!-- Collapsed User Avatar -->
        <div
          v-else
          class="flex justify-center p-3"
        >
          <BaseAvatar
            v-if="userStore.isAuthenticated"
            :src="userStore.user?.avatar_url"
            :name="userStore.user?.name || ''"
            size="sm"
          />
        </div>

        <!-- Collapse Toggle -->
        <button
          class="flex w-full items-center justify-center border-t border-border-subtle py-2.5 text-text-muted transition-colors duration-150 hover:bg-bg-hover hover:text-text-primary"
          :title="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="toggleSidebar"
        >
          <Icon
            :name="isSidebarCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
            class="size-4"
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
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="closeMobileNav"
        />

        <!-- Drawer -->
        <Transition
          enter-active-class="transition-transform duration-300 ease-out"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-200 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full"
          appear
        >
          <div
            v-if="isMobileNavOpen"
            class="relative flex h-full w-72 max-w-[85vw] flex-col bg-bg-surface shadow-2xl"
          >
            <!-- Header -->
            <div class="flex h-14 items-center justify-between border-b border-border-subtle px-4">
              <NuxtLink
                to="/"
                class="flex items-center"
                @click="closeMobileNav"
              >
                <SentinelLogo size="md" />
              </NuxtLink>
              <button
                class="flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
                @click="closeMobileNav"
              >
                <Icon
                  name="lucide:x"
                  class="size-[18px]"
                />
              </button>
            </div>

            <!-- Workspace Switcher -->
            <div
              v-if="workspaceStore.hasCurrentWorkspace"
              class="border-b border-border-subtle p-3"
            >
              <DomainWorkspaceWorkspaceSwitcher />
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto p-4 scrollbar-dark">
              <div class="space-y-2">
                <NuxtLink
                  v-for="item in mainNavItems"
                  :key="item.to"
                  :to="item.to"
                  class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150"
                  :class="isActive(item.to)
                    ? 'nav-item-active text-white'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'"
                  @click="closeMobileNav"
                >
                  <Icon
                    :name="item.icon"
                    class="size-[18px]"
                  />
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </div>

              <!-- Workspace Section -->
              <div class="mt-8">
                <p class="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-faint">
                  Workspace
                </p>
                <div class="space-y-2">
                  <NuxtLink
                    v-for="item in workspaceNavItems"
                    :key="item.to"
                    :to="item.to"
                    class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150"
                    :class="isActive(item.to)
                      ? 'nav-item-active text-white'
                      : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'"
                    @click="closeMobileNav"
                  >
                    <Icon
                      :name="item.icon"
                      class="size-[18px]"
                    />
                    <span>{{ item.label }}</span>
                  </NuxtLink>
                </div>
              </div>

              <!-- Learn -->
              <div class="mt-8">
                <NuxtLink
                  v-if="helpNavItem"
                  :to="helpNavItem.to"
                  class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150"
                  :class="isActive(helpNavItem.to)
                    ? 'nav-item-active text-white'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'"
                  @click="closeMobileNav"
                >
                  <Icon
                    :name="helpNavItem.icon"
                    class="size-[18px]"
                  />
                  <span>{{ helpNavItem.label }}</span>
                </NuxtLink>
              </div>
            </nav>

            <!-- User Section -->
            <div class="border-t border-border-subtle p-4">
              <DomainUserUserMenu
                v-if="userStore.isAuthenticated"
                :user="userStore.user!"
              />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Main Area -->
    <div
      class="transition-all duration-300"
      :class="isSidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-56'"
    >
      <!-- Top Header - Fixed position to prevent bouncing on scroll -->
      <header class="sticky top-0 z-30 border-b border-border-subtle bg-bg-surface">
        <div class="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <!-- Left: Mobile menu + Breadcrumbs -->
          <div class="flex min-w-0 items-center gap-3">
            <button
              class="flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary lg:hidden"
              @click="toggleMobileNav"
            >
              <Icon
                name="lucide:menu"
                class="size-[18px]"
              />
            </button>

            <DomainWorkspaceWorkspaceSwitcher
              v-if="workspaceStore.hasCurrentWorkspace"
              class="hidden sm:flex"
            />

            <!-- Breadcrumbs -->
            <nav class="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
              <template
                v-for="(crumb, index) in breadcrumbs"
                :key="crumb.to"
              >
                <Icon
                  v-if="index > 0"
                  name="lucide:chevron-right"
                  class="size-3 shrink-0 text-text-faint"
                />
                <NuxtLink
                  :to="crumb.to"
                  class="truncate text-[13px] transition-colors"
                  :class="index === breadcrumbs.length - 1
                    ? 'font-medium text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'"
                >
                  {{ crumb.label }}
                </NuxtLink>
              </template>
            </nav>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-0.5">
            <button
              v-if="userStore.isAuthenticated"
              type="button"
              class="flex size-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
              title="Getting Started Guide"
              @click="toggleGettingStarted"
            >
              <Icon
                name="lucide:life-buoy"
                class="size-4"
              />
            </button>

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
      <main class="min-h-[calc(100vh-3.5rem)]">
        <slot />
      </main>
    </div>

    <!-- Getting Started Panel -->
    <GettingStartedPanel
      :is-open="isGettingStartedOpen"
      @close="closeGettingStarted"
    />
  </div>
</template>

<style scoped>
.sidebar {
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item {
  position: relative;
}

.nav-item-active {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  box-shadow: 0 0 16px -4px rgba(20, 184, 166, 0.5);
}

.nav-item-active:hover {
  box-shadow: 0 0 20px -4px rgba(20, 184, 166, 0.6);
}
</style>

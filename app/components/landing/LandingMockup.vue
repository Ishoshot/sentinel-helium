<script setup lang="ts">
/**
 * Landing page dashboard mockup - EXACT replica
 * Full dashboard UI matching the actual Sentinel app
 * Interactive hover states to feel real and alive
 */

import {
  runActivityData,
  runActivityOptions,
  findingsDistributionData,
  findingsDistributionOptions,
} from './mockupChartData'

defineProps<{
  visible: boolean
}>()

const activeNavItem = ref('Overview')
const isWorkspaceSwitcherOpen = ref(false)
const isSidebarCollapsed = ref(false)
const isUserMenuOpen = ref(false)
const workspaceSwitcherRef = ref<HTMLElement | null>(null)
const userMenuRef = ref<HTMLElement | null>(null)

const navItems = [
  { label: 'Overview', icon: 'ph:squares-four-fill', section: 'main' },
  { label: 'Repositories', icon: 'ph:git-branch', section: 'main' },
  { label: 'Code Reviews', icon: 'ph:git-pull-request', section: 'main' },
  { label: 'Briefings', icon: 'ph:sparkle', section: 'main' },
  { label: 'Members', icon: 'ph:users', section: 'workspace' },
  { label: 'Settings', icon: 'ph:gear', section: 'workspace' },
  { label: 'Integrations', icon: 'ph:plug', section: 'workspace' },
  { label: 'API Keys', icon: 'ph:key', section: 'workspace' },
  { label: 'Billing', icon: 'ph:credit-card', section: 'workspace' },
]

const mainNavItems = computed(() => navItems.filter(i => i.section === 'main'))
const workspaceNavItems = computed(() => navItems.filter(i => i.section === 'workspace'))

function handleClickOutside(event: MouseEvent) {
  if (workspaceSwitcherRef.value && !workspaceSwitcherRef.value.contains(event.target as Node)) {
    isWorkspaceSwitcherOpen.value = false
  }
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    class="relative transition-all duration-1000 ease-out delay-200"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
  >
    <!-- Dashboard Mockup -->
    <div class="max-w-[1400px] mx-auto px-4">
      <div class="relative">
        <!-- Glow effect -->
        <div
          class="absolute -inset-8 pointer-events-none"
          aria-hidden="true"
        >
          <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-[70%] h-40 bg-teal-500/15 rounded-full blur-[80px]" />
        </div>

        <!-- Browser container -->
        <div class="animate-fade-in [animation-delay:120ms] [animation-fill-mode:both] relative rounded-xl overflow-hidden border border-[#232328] shadow-2xl shadow-black/60 bg-[#1c1c1e]">
          <!-- Browser chrome bar -->
          <div class="h-11 bg-[#2a2a2c] border-b border-[#3a3a3c] flex items-center px-4 relative">
            <!-- macOS traffic light buttons -->
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] hover:brightness-110 transition-all cursor-pointer" />
              <div class="w-3 h-3 rounded-full bg-[#febc2e] border border-[#dea123] hover:brightness-110 transition-all cursor-pointer" />
              <div class="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] hover:brightness-110 transition-all cursor-pointer" />
            </div>

            <!-- URL bar - absolutely centered -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="flex items-center gap-2 px-8 py-1.5 bg-[#1c1c1e] rounded-md pointer-events-auto">
                <Icon
                  name="ph:lock-simple-fill"
                  class="w-3 h-3 text-zinc-500"
                />
                <span class="text-[12px] text-zinc-400">https://usesentinel.ai</span>
              </div>
            </div>
          </div>

          <!-- Dashboard frame -->
          <div class="relative bg-[#18181b]">
            <!-- Top header bar - full width -->
            <div class="h-[48px] sm:h-[56px] bg-[#18181b] border-b border-[#232328] flex items-center">
              <!-- Logo section (sidebar width) - hidden below lg to match sidebar -->
              <div
                class="mockup-header-logo h-full px-4 hidden lg:flex items-center gap-2 border-r border-[#232328]"
                :class="isSidebarCollapsed ? 'w-[68px] justify-center' : 'w-[200px]'"
              >
                <SentinelLogo
                  :size="isSidebarCollapsed ? 'xs' : 'sm'"
                  :show-text="!isSidebarCollapsed"
                />
              </div>
              <!-- Mobile logo - visible below lg -->
              <div class="h-full px-3 flex lg:hidden items-center border-r border-[#232328]">
                <SentinelLogo
                  size="xs"
                  :show-text="false"
                />
              </div>
              <!-- Workspace section -->
              <div class="flex-1 min-w-0 h-full px-2 sm:px-4 flex items-center justify-between">
                <!-- Workspace switcher - interactive -->
                <div
                  ref="workspaceSwitcherRef"
                  class="relative min-w-0"
                >
                  <button
                    class="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 -ml-2 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-all duration-150 group min-w-0"
                    @click="isWorkspaceSwitcherOpen = !isWorkspaceSwitcherOpen"
                  >
                    <div class="w-7 h-7 rounded-lg bg-[#134e4a] text-teal-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0 group-hover:bg-[#166b5c] transition-colors">
                      HW
                    </div>
                    <span class="text-[13px] sm:text-[14px] text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">Hydrogenn Work...</span>
                    <Icon
                      name="ph:caret-up-down"
                      class="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors flex-shrink-0"
                    />
                  </button>

                  <!-- Workspace switcher dropdown -->
                  <Transition
                    enter-active-class="transition duration-150 ease-out"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                  >
                    <div
                      v-if="isWorkspaceSwitcherOpen"
                      class="absolute left-0 z-50 mt-2 w-72 bg-[#1c1c1e]/95 backdrop-blur-xl border border-[#333338] rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
                    >
                      <!-- Header -->
                      <div class="px-4 pt-3 pb-2">
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Workspaces</span>
                      </div>

                      <!-- Workspace list -->
                      <div class="px-2 pb-2 space-y-0.5">
                        <!-- Current workspace -->
                        <button
                          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20 cursor-pointer transition-all duration-150"
                          @click="isWorkspaceSwitcherOpen = false"
                        >
                          <div class="w-8 h-8 rounded-lg bg-[#134e4a] text-teal-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                            HW
                          </div>
                          <span class="text-[13px] font-medium truncate flex-1 text-left">Hydrogenn Workspace</span>
                          <Icon
                            name="ph:check"
                            class="w-4 h-4 text-teal-400 flex-shrink-0"
                          />
                        </button>

                        <!-- Second workspace -->
                        <button
                          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200"
                          @click="isWorkspaceSwitcherOpen = false"
                        >
                          <div class="w-8 h-8 rounded-lg bg-[#3b2e1a] text-amber-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                            AC
                          </div>
                          <span class="text-[13px] font-medium truncate flex-1 text-left">Acme Corp</span>
                        </button>
                      </div>

                      <!-- Create workspace -->
                      <div class="border-t border-[#232328] px-2 py-2">
                        <button
                          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 cursor-pointer transition-all duration-150 hover:bg-zinc-800/50 hover:text-zinc-200"
                          @click="isWorkspaceSwitcherOpen = false"
                        >
                          <div class="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                            <Icon
                              name="ph:plus"
                              class="w-4 h-4 text-teal-400"
                            />
                          </div>
                          <span class="text-[13px] font-medium">Create Workspace</span>
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>
                <div class="flex items-center gap-1">
                  <button class="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-150 cursor-pointer">
                    <Icon
                      name="ph:gear"
                      class="w-[22px] h-[22px]"
                    />
                  </button>
                  <button class="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-150 cursor-pointer">
                    <Icon
                      name="ph:bell"
                      class="w-[22px] h-[22px]"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="flex">
              <!-- Sidebar -->
              <div
                class="mockup-sidebar hidden lg:flex flex-col bg-[#18181b] border-r border-[#232328]"
                :class="isSidebarCollapsed ? 'w-[68px]' : 'w-[200px]'"
              >
                <!-- Nav items -->
                <nav
                  class="flex-1 py-3 mt-3"
                  :class="isSidebarCollapsed ? 'px-2' : ''"
                >
                  <!-- Main nav items -->
                  <a
                    v-for="item in mainNavItems"
                    :key="item.label"
                    href="#"
                    class="relative mx-2 mb-3 flex items-center rounded-lg cursor-pointer transition-all duration-150"
                    :class="[
                      isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                      activeNavItem === item.label
                        ? 'mock-nav-active text-white'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    ]"
                    :title="isSidebarCollapsed ? item.label : undefined"
                    @click.prevent="activeNavItem = item.label"
                  >
                    <Icon
                      :name="item.icon"
                      class="w-[20px] h-[20px] shrink-0"
                    />
                    <span
                      v-if="!isSidebarCollapsed"
                      class="text-[14px]"
                      :class="activeNavItem === item.label ? 'font-medium' : ''"
                    >{{ item.label }}</span>
                    <!-- Active indicator dot for collapsed state -->
                    <span
                      v-if="isSidebarCollapsed && activeNavItem === item.label"
                      class="absolute -right-0.5 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-teal-400"
                    />
                  </a>

                  <!-- WORKSPACE label / divider -->
                  <div
                    v-if="!isSidebarCollapsed"
                    class="mt-8 mb-3 px-5"
                  >
                    <span class="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">Workspace</span>
                  </div>
                  <div
                    v-else
                    class="mx-auto my-4 h-px w-5 bg-[#232328]"
                  />

                  <!-- Workspace nav items -->
                  <a
                    v-for="item in workspaceNavItems"
                    :key="item.label"
                    href="#"
                    class="relative mx-2 mb-3 flex items-center rounded-lg cursor-pointer transition-all duration-150"
                    :class="[
                      isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                      activeNavItem === item.label
                        ? 'mock-nav-active text-white'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    ]"
                    :title="isSidebarCollapsed ? item.label : undefined"
                    @click.prevent="activeNavItem = item.label"
                  >
                    <Icon
                      :name="item.icon"
                      class="w-[20px] h-[20px] shrink-0"
                    />
                    <span
                      v-if="!isSidebarCollapsed"
                      class="text-[14px]"
                      :class="activeNavItem === item.label ? 'font-medium' : ''"
                    >{{ item.label }}</span>
                    <span
                      v-if="isSidebarCollapsed && activeNavItem === item.label"
                      class="absolute -right-0.5 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-teal-400"
                    />
                  </a>

                  <!-- Spacer -->
                  <div class="flex-1 min-h-[40px]" />

                  <!-- Learn -->
                  <a
                    href="#"
                    class="relative mx-2 mb-3 flex items-center rounded-lg cursor-pointer transition-all duration-150"
                    :class="[
                      isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                      activeNavItem === 'Learn'
                        ? 'mock-nav-active text-white'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    ]"
                    :title="isSidebarCollapsed ? 'Learn' : undefined"
                    @click.prevent="activeNavItem = 'Learn'"
                  >
                    <Icon
                      name="ph:book-open"
                      class="w-[20px] h-[20px] shrink-0"
                    />
                    <span
                      v-if="!isSidebarCollapsed"
                      class="text-[14px]"
                    >Learn</span>
                    <span
                      v-if="isSidebarCollapsed && activeNavItem === 'Learn'"
                      class="absolute -right-0.5 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-teal-400"
                    />
                  </a>
                </nav>

                <!-- User section - interactive -->
                <div
                  ref="userMenuRef"
                  class="relative border-t border-[#232328]"
                >
                  <!-- Expanded trigger -->
                  <button
                    v-if="!isSidebarCollapsed"
                    class="p-3 cursor-pointer hover:bg-zinc-800/30 transition-all duration-150 w-full text-left"
                    @click="isUserMenuOpen = !isUserMenuOpen"
                  >
                    <div class="flex items-center gap-2.5 px-1">
                      <div class="relative flex-shrink-0">
                        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
                        <div class="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#18181b]" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-[13px] font-medium text-zinc-200 truncate">
                          Oluwatobi Ishola
                        </div>
                        <div class="text-[11px] text-zinc-500 truncate">
                          ishoshot@gmail.c...
                        </div>
                      </div>
                      <Icon
                        name="ph:caret-up-down"
                        class="w-4 h-4 text-zinc-600 flex-shrink-0"
                      />
                    </div>
                  </button>

                  <!-- Collapsed trigger -->
                  <button
                    v-else
                    class="flex justify-center p-3 w-full cursor-pointer hover:bg-zinc-800/30 transition-all duration-150"
                    @click="isUserMenuOpen = !isUserMenuOpen"
                  >
                    <div class="relative">
                      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
                      <div class="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#18181b]" />
                    </div>
                  </button>

                  <!-- User menu dropdown -->
                  <Transition
                    enter-active-class="transition duration-150 ease-out"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                  >
                    <div
                      v-if="isUserMenuOpen"
                      class="absolute z-50 w-56 bg-[#1c1c1e]/95 backdrop-blur-xl border border-[#333338] rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
                      :class="isSidebarCollapsed ? 'left-full bottom-0 ml-2' : 'bottom-full left-0 mb-2'"
                    >
                      <!-- User info header -->
                      <div class="p-4 border-b border-[#232328]">
                        <div class="flex items-center gap-3">
                          <div class="relative flex-shrink-0">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
                            <div class="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#1c1c1e]" />
                          </div>
                          <div class="min-w-0">
                            <div class="text-[13px] font-medium text-zinc-200 truncate">
                              Oluwatobi Ishola
                            </div>
                            <div class="text-[11px] text-zinc-500 truncate">
                              ishoshot@gmail.com
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Menu items -->
                      <div class="p-2">
                        <button
                          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 cursor-pointer transition-all duration-150 hover:bg-rose-500/10"
                          @click="isUserMenuOpen = false"
                        >
                          <Icon
                            name="lucide:log-out"
                            class="w-4 h-4"
                          />
                          <span class="text-[13px] font-medium">Sign out</span>
                        </button>
                      </div>

                      <!-- Footer -->
                      <div class="px-4 py-2.5 border-t border-[#232328]">
                        <span class="text-[11px] text-zinc-600">Sentinel v1.0</span>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- Bottom toggle - interactive -->
                <button
                  class="px-4 py-3 border-t border-[#232328] flex justify-center cursor-pointer hover:bg-zinc-800/30 transition-all duration-150"
                  :title="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                  @click="isSidebarCollapsed = !isSidebarCollapsed"
                >
                  <Icon
                    :name="isSidebarCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
                    class="w-5 h-5 text-zinc-600 hover:text-zinc-400 transition-colors"
                  />
                </button>
              </div>

              <!-- Main content -->
              <div class="flex-1 min-w-0 bg-[#0e0e10]">
                <div class="p-4 sm:p-6 lg:p-8">
                  <!-- Page title -->
                  <h2 class="animate-fade-in-up [animation-delay:220ms] [animation-fill-mode:both] text-xl sm:text-[28px] font-semibold text-white mb-4 sm:mb-6">
                    {{ activeNavItem }}
                  </h2>

                  <!-- Stats row - interactive cards -->
                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <!-- Total Runs -->
                    <div class="p-3 sm:p-5 rounded-xl bg-[#18181b] border border-[#232328] cursor-pointer transition-all duration-200 hover:border-[#333338] hover:bg-[#1a1a1e] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                      <div class="flex items-start justify-between mb-3">
                        <span class="text-[13px] text-zinc-500">Total Runs</span>
                        <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-teal-500/10 flex items-center justify-center">
                          <Icon
                            name="ph:play-fill"
                            class="w-5 h-5 text-teal-400"
                          />
                        </div>
                      </div>
                      <div class="text-2xl sm:text-[40px] font-bold text-white leading-none tracking-tight">
                        13
                      </div>
                      <div class="text-[11px] sm:text-[12px] text-zinc-600 mt-1 sm:mt-2 hidden sm:block">
                        Code reviews executed
                      </div>
                    </div>

                    <!-- Total Findings -->
                    <div class="p-3 sm:p-5 rounded-xl bg-[#18181b] border border-[#232328] cursor-pointer transition-all duration-200 hover:border-[#333338] hover:bg-[#1a1a1e] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                      <div class="flex items-start justify-between mb-3">
                        <span class="text-[13px] text-zinc-500">Total Findings</span>
                        <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-cyan-500/10 flex items-center justify-center">
                          <Icon
                            name="ph:info"
                            class="w-5 h-5 text-cyan-400"
                          />
                        </div>
                      </div>
                      <div class="text-2xl sm:text-[40px] font-bold text-white leading-none tracking-tight">
                        25
                      </div>
                      <div class="text-[11px] sm:text-[12px] text-zinc-600 mt-1 sm:mt-2 hidden sm:block">
                        Issues discovered
                      </div>
                    </div>

                    <!-- Avg Duration -->
                    <div class="p-3 sm:p-5 rounded-xl bg-[#18181b] border border-[#232328] cursor-pointer transition-all duration-200 hover:border-[#333338] hover:bg-[#1a1a1e] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                      <div class="flex items-start justify-between mb-3">
                        <span class="text-[13px] text-zinc-500">Avg Duration</span>
                        <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-teal-500/10 flex items-center justify-center">
                          <Icon
                            name="ph:clock"
                            class="w-5 h-5 text-teal-400"
                          />
                        </div>
                      </div>
                      <div class="text-2xl sm:text-[40px] font-bold text-white leading-none tracking-tight">
                        1m
                      </div>
                      <div class="text-[11px] sm:text-[12px] text-zinc-600 mt-1 sm:mt-2 hidden sm:block">
                        Average review time
                      </div>
                    </div>

                    <!-- Active Repositories -->
                    <div class="p-3 sm:p-5 rounded-xl bg-[#18181b] border border-[#232328] cursor-pointer transition-all duration-200 hover:border-[#333338] hover:bg-[#1a1a1e] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
                      <div class="flex items-start justify-between mb-3">
                        <span class="text-[13px] text-zinc-500">Active Repositories</span>
                        <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-teal-500/10 flex items-center justify-center">
                          <Icon
                            name="ph:git-branch"
                            class="w-5 h-5 text-teal-400"
                          />
                        </div>
                      </div>
                      <div class="text-2xl sm:text-[40px] font-bold text-white leading-none tracking-tight">
                        3
                      </div>
                      <div class="text-[11px] sm:text-[12px] text-zinc-600 mt-1 sm:mt-2 hidden sm:block">
                        Repositories with recent activity
                      </div>
                    </div>
                  </div>

                  <!-- Get started - interactive -->
                  <button class="w-full p-3 sm:p-5 rounded-xl bg-[#18181b] border border-[#232328] flex items-center justify-between mb-4 sm:mb-8 cursor-pointer transition-all duration-200 hover:border-[#333338] hover:bg-[#1a1a1e] text-left">
                    <div class="flex items-center gap-4">
                      <div class="relative w-12 h-12">
                        <svg
                          class="w-12 h-12 -rotate-90"
                          viewBox="0 0 48 48"
                        >
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke="#232328"
                            stroke-width="3"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke="#14b8a6"
                            stroke-width="3"
                            stroke-dasharray="83.8 125.6"
                            stroke-linecap="round"
                          />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="text-[13px] font-bold text-teal-400">2/3</span>
                        </div>
                      </div>
                      <div>
                        <div class="text-[15px] font-semibold text-white">
                          Get started
                        </div>
                        <div class="text-[13px] text-zinc-500">
                          1 step remaining
                        </div>
                      </div>
                    </div>
                    <Icon
                      name="ph:caret-down"
                      class="w-5 h-5 text-zinc-500"
                    />
                  </button>

                  <!-- ANALYTICS -->
                  <div class="mb-5">
                    <span class="text-[12px] font-semibold text-zinc-600 uppercase tracking-wider">Analytics</span>
                  </div>

                  <!-- Charts - interactive -->
                  <div class="grid lg:grid-cols-2 gap-2 sm:gap-4">
                    <!-- Run Activity -->
                    <div class="p-3 sm:p-5 rounded-xl bg-[#18181b] border border-[#232328] transition-all duration-200 hover:border-[#2a2a30]">
                      <div class="mb-4">
                        <h4 class="text-[16px] font-semibold text-white">
                          Run Activity
                        </h4>
                        <p class="text-[13px] text-zinc-500">
                          Successful and failed runs over time
                        </p>
                      </div>
                      <div class="relative h-[160px] sm:h-[240px]">
                        <Chart
                          type="line"
                          :data="runActivityData"
                          :options="runActivityOptions"
                          class="!absolute inset-0 !h-full !w-full"
                        />
                      </div>
                    </div>

                    <!-- Findings by Severity -->
                    <div class="p-3 sm:p-5 rounded-xl bg-[#18181b] border border-[#232328] transition-all duration-200 hover:border-[#2a2a30]">
                      <div class="mb-4">
                        <h4 class="text-[16px] font-semibold text-white">
                          Findings by Severity
                        </h4>
                        <p class="text-[13px] text-zinc-500">
                          Distribution of findings across severity levels
                        </p>
                      </div>
                      <div class="relative h-[160px] sm:h-[240px]">
                        <Chart
                          type="doughnut"
                          :data="findingsDistributionData"
                          :options="findingsDistributionOptions"
                          class="!absolute inset-0 !h-full !w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mockup-sidebar,
.mockup-header-logo {
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mock-nav-active {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  box-shadow: 0 0 16px -4px rgba(20, 184, 166, 0.5);
}

.mock-nav-active:hover {
  box-shadow: 0 0 20px -4px rgba(20, 184, 166, 0.6);
}
</style>

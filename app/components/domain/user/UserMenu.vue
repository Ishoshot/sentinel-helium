<script setup lang="ts">
import type { User } from '~/types'
import { useAuth } from '~/composables/auth/useAuth'

/**
 * UserMenu - Premium user avatar with dropdown menu
 * Uses Teleport to escape sidebar stacking context
 */

interface Props {
  user: User
}

defineProps<Props>()

const { logout, isLoading } = useAuth()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuPosition = ref({ top: 0, left: 0, width: 0 })

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updatePosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updatePosition)
})

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (
    triggerRef.value && !triggerRef.value.contains(target) &&
    menuRef.value && !menuRef.value.contains(target)
  ) {
    isOpen.value = false
  }
}

function updatePosition() {
  if (triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect()
    menuPosition.value = {
      top: rect.top - 8, // 8px gap above trigger
      left: rect.left,
      width: Math.max(rect.width, 220), // min width 220px
    }
  }
}

function toggle() {
  updatePosition()
  isOpen.value = !isOpen.value
}

function handleLogout() {
  logout()
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Trigger button -->
    <button
      ref="triggerRef"
      class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200 group"
      @click="toggle"
    >
      <div class="relative">
        <BaseAvatar
          :src="user.avatar_url"
          :name="user.name"
          size="sm"
          class="ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all duration-200"
        />
        <!-- Online indicator -->
        <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
      </div>
      <div class="flex-1 text-left hidden sm:block min-w-0">
        <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
          {{ user.name }}
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
          {{ user.email }}
        </p>
      </div>
      <Icon
        name="lucide:chevrons-up-down"
        class="w-4 h-4 text-slate-400 dark:text-slate-500 hidden sm:block transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />

      <!-- Loading indicator during logout -->
      <BaseSpinner
        v-if="isLoading"
        size="sm"
      />
    </button>

    <!-- Teleport dropdown to body to escape stacking context -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div
          v-if="isOpen"
          ref="menuRef"
          class="fixed z-[9999] rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-[#1a1a24] ring-1 ring-black/5 dark:ring-white/10"
          :style="{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`,
            transform: 'translateY(-100%)',
          }"
        >
          <!-- User info header -->
          <div class="px-4 py-3 border-b border-slate-100 dark:border-white/10">
            <div class="flex items-center gap-3">
              <BaseAvatar
                :src="user.avatar_url"
                :name="user.name"
                size="md"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {{ user.name }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {{ user.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- Menu items -->
          <div class="py-2">
            <!-- Sign out -->
            <button
              class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              :disabled="isLoading"
              @click="handleLogout"
            >
              <Icon
                name="lucide:log-out"
                class="w-4 h-4"
              />
              <span>Sign out</span>
              <BaseSpinner
                v-if="isLoading"
                size="sm"
                class="ml-auto"
              />
            </button>
          </div>

          <!-- Footer -->
          <div class="px-4 py-2.5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <p class="text-xs text-slate-500 dark:text-slate-500">
              Sentinel v1.0
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

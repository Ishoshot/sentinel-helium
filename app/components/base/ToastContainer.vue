<script setup lang="ts">
import { ToastType } from '~/types'
import { useAppToast } from '~/composables/shared/useAppToast'

/**
 * ToastContainer - Renders toast notifications
 * Displays in a fixed position with animations
 */

const { toasts, dismiss } = useAppToast()

// Toast styling configuration
const toastStyles: Record<ToastType, {
  bg: string
  border: string
  icon: string
  iconColor: string
}> = {
  [ToastType.Success]: {
    bg: 'bg-bg-elevated',
    border: 'border-success/20',
    icon: 'lucide:check-circle',
    iconColor: 'text-success',
  },
  [ToastType.Error]: {
    bg: 'bg-bg-elevated',
    border: 'border-error/20',
    icon: 'lucide:x-circle',
    iconColor: 'text-error',
  },
  [ToastType.Warning]: {
    bg: 'bg-bg-elevated',
    border: 'border-warning/20',
    icon: 'lucide:alert-triangle',
    iconColor: 'text-warning',
  },
  [ToastType.Info]: {
    bg: 'bg-bg-elevated',
    border: 'border-accent/20',
    icon: 'lucide:info',
    iconColor: 'text-accent',
  },
}

function getStyle(type: ToastType) {
  return toastStyles[type]
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-3 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-2 opacity-0"
        move-class="transition-all duration-300"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-full border shadow-lg backdrop-blur-sm max-w-xl"
          :class="[getStyle(toast.type).bg, getStyle(toast.type).border]"
          role="alert"
        >
          <!-- Icon -->
          <Icon
            :name="getStyle(toast.type).icon"
            class="w-4 h-4 shrink-0"
            :class="getStyle(toast.type).iconColor"
          />

          <!-- Content -->
          <span class="text-sm font-medium text-text-primary truncate">
            {{ toast.title }}
          </span>

          <!-- Action button -->
          <button
            v-if="toast.action"
            class="shrink-0 text-sm font-semibold text-accent hover:text-accent/80 underline underline-offset-2 transition-default"
            @click="toast.action.onClick"
          >
            {{ toast.action.label }}
          </button>

          <!-- Dismiss button -->
          <button
            v-if="toast.dismissible"
            class="shrink-0 p-0.5 -mr-1 text-text-muted hover:text-text-primary rounded-full hover:bg-bg-surface/50 transition-default"
            aria-label="Dismiss"
            @click="dismiss(toast.id)"
          >
            <Icon
              name="lucide:x"
              class="w-3.5 h-3.5"
            />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>

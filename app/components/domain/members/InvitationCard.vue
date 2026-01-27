<script setup lang="ts">
import type { Invitation } from '~/types'
import { MemberRole } from '~/types'

/**
 * InvitationCard - Premium pending invitation card
 * Shows invitation details with rich visual feedback
 */

interface Props {
  invitation: Invitation
  canManage: boolean
  isResending?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isResending: false,
})

const emit = defineEmits<{
  cancel: [invitationId: number]
  resend: [invitationId: number]
}>()

// State
const isHovered = ref(false)

// Role configuration
const roleConfig = computed(() => {
  const configs: Record<Exclude<MemberRole, MemberRole.Owner>, {
    label: string
    icon: string
    color: string
    bg: string
  }> = {
    [MemberRole.Admin]: {
      label: 'Admin',
      icon: 'lucide:shield',
      color: 'text-accent',
      bg: 'bg-accent-light',
    },
    [MemberRole.Member]: {
      label: 'Member',
      icon: 'lucide:user',
      color: 'text-text-secondary',
      bg: 'bg-bg-surface',
    },
  }
  return configs[props.invitation.role as Exclude<MemberRole, MemberRole.Owner>]
})

// Format expiry
const expiryText = computed(() => {
  if (props.invitation.is_expired) return 'Expired'

  const expires = new Date(props.invitation.expires_at)
  const now = new Date()
  const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Expires today'
  if (diffDays === 1) return 'Expires tomorrow'
  return `Expires in ${diffDays} days`
})

// Format sent date
const sentDate = computed(() => {
  const date = new Date(props.invitation.created_at)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
})

function handleResend() {
  emit('resend', props.invitation.id)
}

function handleCancel() {
  emit('cancel', props.invitation.id)
}
</script>

<template>
  <div
    class="group relative"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div
      class="relative p-4 rounded-xl border transition-all duration-200"
      :class="[
        invitation.is_expired
          ? 'bg-warning-light/30 border-warning/20'
          : isHovered && canManage
            ? 'bg-bg-elevated border-border-muted shadow-elevated'
            : 'bg-bg-elevated border-border-subtle',
      ]"
    >
      <!-- Resending spinner -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
      >
        <div
          v-if="isResending"
          class="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-accent text-white text-[10px] font-medium rounded-full shadow-sm"
        >
          <Icon
            name="lucide:loader-2"
            class="w-3 h-3 animate-spin"
          />
          <span>Resending</span>
        </div>
      </Transition>

      <!-- Pending badge -->
      <div class="absolute -top-2 left-4">
        <div
          class="px-2 py-0.5 rounded-full border"
          :class="invitation.is_expired
            ? 'bg-warning-light border-warning/30'
            : 'bg-accent-light border-accent/20'"
        >
          <div class="flex items-center gap-1">
            <Icon
              :name="invitation.is_expired ? 'lucide:clock' : 'lucide:mail'"
              class="w-3 h-3"
              :class="invitation.is_expired ? 'text-warning' : 'text-accent'"
            />
            <span
              class="text-[10px] font-semibold uppercase tracking-wide"
              :class="invitation.is_expired ? 'text-warning' : 'text-accent'"
            >
              {{ invitation.is_expired ? 'Expired' : 'Pending' }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-start gap-4 mt-2">
        <!-- Avatar placeholder -->
        <div class="relative flex-shrink-0">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center"
            :class="invitation.is_expired ? 'bg-warning-light' : 'bg-bg-surface'"
          >
            <Icon
              name="lucide:user"
              class="w-6 h-6"
              :class="invitation.is_expired ? 'text-warning' : 'text-text-muted'"
            />
          </div>
          <!-- Envelope indicator -->
          <div
            class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            :class="invitation.is_expired ? 'bg-warning' : 'bg-accent'"
          >
            <Icon
              name="lucide:mail"
              class="w-2.5 h-2.5 text-white"
            />
          </div>
        </div>

        <!-- Invitation info -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-text-primary truncate">
            {{ invitation.email }}
          </h3>

          <div class="flex items-center gap-2 mt-1 text-xs text-text-muted">
            <span>Invited by {{ invitation.invited_by.name }}</span>
            <span class="text-border-muted">•</span>
            <span>{{ sentDate }}</span>
          </div>

          <!-- Meta info -->
          <div class="flex items-center gap-3 mt-2">
            <!-- Role badge -->
            <div
              class="flex items-center gap-1.5 px-2 py-1 rounded-md"
              :class="roleConfig.bg"
            >
              <Icon
                :name="roleConfig.icon"
                class="w-3 h-3"
                :class="roleConfig.color"
              />
              <span
                class="text-xs font-medium"
                :class="roleConfig.color"
              >
                {{ roleConfig.label }}
              </span>
            </div>

            <!-- Expiry -->
            <div
              class="flex items-center gap-1 text-xs"
              :class="invitation.is_expired ? 'text-warning' : 'text-text-muted'"
            >
              <Icon
                name="lucide:clock"
                class="w-3 h-3"
              />
              <span>{{ expiryText }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          v-if="canManage"
          class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <!-- Resend button -->
          <button
            class="p-2 text-text-muted hover:text-accent hover:bg-accent-light rounded-lg transition-default disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isResending"
            :title="invitation.is_expired ? 'Resend invitation' : 'Resend'"
            @click="handleResend"
          >
            <Icon
              name="lucide:send"
              class="w-4 h-4"
            />
          </button>

          <!-- Cancel button -->
          <button
            class="p-2 text-text-muted hover:text-error hover:bg-error-light rounded-lg transition-default"
            title="Cancel invitation"
            @click="handleCancel"
          >
            <Icon
              name="lucide:x"
              class="w-4 h-4"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

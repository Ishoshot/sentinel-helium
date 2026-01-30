<script setup lang="ts">
import type { Invitation } from '~/types'
import { MemberRole } from '~/types'

/**
 * InvitationCard - Editorial roster invitation card
 * Clean, warm design with refined interactions
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
      color: 'text-blue-700',
      bg: 'bg-blue-100',
    },
    [MemberRole.Member]: {
      label: 'Member',
      icon: 'lucide:user',
      color: 'text-stone-600',
      bg: 'bg-stone-100',
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
      class="relative overflow-hidden rounded-2xl border bg-white transition-all duration-300"
      :class="[
        invitation.is_expired
          ? 'border-amber-200 bg-amber-50/30'
          : isHovered
            ? 'border-stone-200 shadow-md'
            : 'border-stone-100 shadow-sm',
      ]"
    >
      <!-- Status badge -->
      <div class="absolute right-3 top-3 z-10">
        <div
          class="flex items-center gap-1 rounded-full px-2 py-1"
          :class="invitation.is_expired ? 'bg-amber-100' : 'bg-violet-100'"
        >
          <Icon
            :name="invitation.is_expired ? 'lucide:clock' : 'lucide:mail'"
            class="size-3"
            :class="invitation.is_expired ? 'text-amber-600' : 'text-violet-600'"
          />
          <span
            class="text-[10px] font-semibold uppercase tracking-wide"
            :class="invitation.is_expired ? 'text-amber-700' : 'text-violet-700'"
          >
            {{ invitation.is_expired ? 'Expired' : 'Pending' }}
          </span>
        </div>
      </div>

      <!-- Resending indicator -->
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isResending"
          class="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        >
          <div class="flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2">
            <Icon
              name="lucide:loader-2"
              class="size-4 animate-spin text-violet-600"
            />
            <span class="text-sm font-medium text-violet-700">Resending...</span>
          </div>
        </div>
      </Transition>

      <div class="p-5">
        <div class="flex items-start gap-4">
          <!-- Avatar placeholder -->
          <div class="relative shrink-0">
            <div
              class="flex size-12 items-center justify-center rounded-full"
              :class="invitation.is_expired ? 'bg-amber-100' : 'bg-violet-100'"
            >
              <Icon
                name="lucide:user"
                class="size-6"
                :class="invitation.is_expired ? 'text-amber-500' : 'text-violet-500'"
              />
            </div>
            <!-- Envelope indicator -->
            <div
              class="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full ring-2 ring-white"
              :class="invitation.is_expired ? 'bg-amber-400' : 'bg-violet-500'"
            >
              <Icon
                name="lucide:mail"
                class="size-2.5 text-white"
              />
            </div>
          </div>

          <!-- Invitation info -->
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-stone-900">
              {{ invitation.email }}
            </h3>

            <div class="mt-1 flex items-center gap-2 text-xs text-stone-400">
              <span>Invited by {{ invitation.invited_by.name }}</span>
              <span class="text-stone-300">•</span>
              <span>{{ sentDate }}</span>
            </div>

            <!-- Meta info -->
            <div class="mt-3 flex items-center gap-3">
              <!-- Role badge -->
              <div
                class="flex items-center gap-1.5 rounded-lg px-2 py-1"
                :class="roleConfig.bg"
              >
                <Icon
                  :name="roleConfig.icon"
                  class="size-3"
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
                class="flex items-center gap-1.5 text-xs"
                :class="invitation.is_expired ? 'text-amber-600' : 'text-stone-400'"
              >
                <Icon
                  name="lucide:clock"
                  class="size-3"
                />
                <span>{{ expiryText }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions - slide up on hover -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div
            v-if="canManage && isHovered"
            class="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4"
          >
            <!-- Resend button -->
            <button
              class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isResending"
              @click="handleResend"
            >
              <Icon
                name="lucide:send"
                class="size-3.5"
              />
              {{ invitation.is_expired ? 'Resend' : 'Resend' }}
            </button>

            <!-- Cancel button -->
            <button
              class="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600"
              @click="handleCancel"
            >
              <Icon
                name="lucide:x"
                class="size-3.5"
              />
              Cancel
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

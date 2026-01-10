<script setup lang="ts">
import type { Invitation } from '~/types'

/**
 * InvitationRow - Pending invitation display row
 * Domain component for showing invitation details
 */

interface Props {
  invitation: Invitation
  canManage: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  cancel: [invitationId: number]
  resend: [invitationId: number]
}>()

function handleCancel(invitationId: number) {
  emit('cancel', invitationId)
}

function handleResend(invitationId: number) {
  emit('resend', invitationId)
}
</script>

<template>
  <div class="flex items-center justify-between py-3 px-4 hover:bg-bg-surface/50 rounded-lg transition-default">
    <!-- Invitation info -->
    <div class="flex items-center gap-3">
      <!-- Placeholder avatar for pending invitation -->
      <div class="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center">
        <Icon
          name="lucide:mail"
          class="w-5 h-5 text-text-muted"
        />
      </div>
      <div>
        <span class="text-sm font-medium text-text-primary">
          {{ invitation.email }}
        </span>
        <div class="flex items-center gap-2 text-xs text-text-muted">
          <span>Invited by {{ invitation.invited_by.name }}</span>
          <span v-if="invitation.is_expired" class="text-warning">Expired</span>
        </div>
      </div>
    </div>

    <!-- Role and actions -->
    <div class="flex items-center gap-3">
      <DomainMemberRoleBadge
        :role="invitation.role"
        :label="invitation.role_label"
      />

      <!-- Resend button -->
      <button
        v-if="canManage"
        class="p-1.5 text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 rounded transition-default"
        title="Resend invitation"
        @click="handleResend(invitation.id)"
      >
        <Icon
          name="lucide:send"
          class="w-4 h-4"
        />
      </button>

      <!-- Cancel button -->
      <button
        v-if="canManage"
        class="p-1.5 text-text-muted hover:text-error hover:bg-error-light rounded transition-default"
        title="Cancel invitation"
        @click="handleCancel(invitation.id)"
      >
        <Icon
          name="lucide:x"
          class="w-4 h-4"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * MemberPreview - Compact member display for lists
 * Domain component for showing team member summary
 */

interface Props {
  avatarUrl?: string | null
  name: string
  role: string
  status?: 'online' | 'away' | 'offline'
  meta?: string
  isMe?: boolean
}

defineProps<Props>()

const statusColors = {
  online: 'bg-success',
  away: 'bg-warning',
  offline: 'bg-text-muted',
}
</script>

<template>
  <div class="flex items-center justify-between py-3">
    <div class="flex items-center gap-3">
      <BaseAvatar
        :src="avatarUrl"
        :name="name"
        size="sm"
      />
      <div>
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium text-text-primary">
            {{ name }}
          </p>
          <span
            v-if="isMe"
            class="px-1.5 py-0.5 text-[10px] font-medium bg-bg-surface text-text-secondary rounded border border-border-muted"
          >
            You
          </span>
        </div>
        <p class="text-xs text-text-muted">
          {{ role }}
        </p>
      </div>
    </div>
    <div
      v-if="status || meta"
      class="text-right"
    >
      <p
        v-if="meta"
        class="text-xs text-text-muted"
      >
        {{ meta }}
      </p>
      <div
        v-if="status"
        class="flex items-center gap-1.5 mt-0.5 justify-end"
      >
        <span
          class="w-1.5 h-1.5 rounded-full"
          :class="statusColors[status]"
        />
        <span class="text-xs text-text-muted capitalize">{{ status }}</span>
      </div>
    </div>
  </div>
</template>

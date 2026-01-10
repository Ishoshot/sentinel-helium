<script setup lang="ts">
import type { TeamMember, MemberRole } from '~/types'

/**
 * MemberRow - Single member display row
 * Domain component for displaying team member information
 */

interface Props {
  member: TeamMember
  canManage: boolean
  currentUserId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  changeRole: [memberId: number, role: Exclude<MemberRole, 'owner'>]
  remove: [memberId: number]
}>()

// Check if this is the owner (cannot be changed/removed)
const isOwner = computed(() => props.member.role === 'owner')

// Check if this is the current user
const isCurrentUser = computed(() => props.member.user_id === props.currentUserId)

// Available roles for changing
const availableRoles: { value: Exclude<MemberRole, 'owner'>; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
]

// Dropdown state
const showRoleDropdown = ref(false)

function handleRoleChange(role: Exclude<MemberRole, 'owner'>) {
  showRoleDropdown.value = false
  emit('changeRole', props.member.id, role)
}

function handleRemove() {
  emit('remove', props.member.id)
}
</script>

<template>
  <div class="flex items-center justify-between py-3 px-4 hover:bg-bg-surface/50 rounded-lg transition-default">
    <!-- Member info -->
    <div class="flex items-center gap-3">
      <BaseAvatar
        :src="member.user.avatar_url"
        :name="member.user.name"
        size="md"
      />
      <div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-text-primary">
            {{ member.user.name }}
          </span>
          <span
            v-if="isCurrentUser"
            class="text-xs text-text-muted"
          >(you)</span>
        </div>
        <span class="text-sm text-text-muted">
          {{ member.user.email }}
        </span>
      </div>
    </div>

    <!-- Role and actions -->
    <div class="flex items-center gap-3">
      <!-- Role badge / dropdown -->
      <div class="relative">
        <button
          v-if="canManage && !isOwner && !isCurrentUser"
          class="flex items-center gap-1 group"
          @click="showRoleDropdown = !showRoleDropdown"
        >
          <DomainMemberRoleBadge
            :role="member.role"
            :label="member.role_label"
          />
          <Icon
            name="lucide:chevron-down"
            class="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-default"
          />
        </button>
        <DomainMemberRoleBadge
          v-else
          :role="member.role"
          :label="member.role_label"
        />

        <!-- Role dropdown -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="showRoleDropdown"
            class="absolute right-0 z-10 mt-1 w-32 bg-bg-elevated border border-border-subtle rounded-lg shadow-elevated overflow-hidden"
          >
            <button
              v-for="role in availableRoles"
              :key="role.value"
              class="w-full px-3 py-2 text-sm text-left transition-default"
              :class="[
                member.role === role.value
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
              ]"
              @click="handleRoleChange(role.value)"
            >
              {{ role.label }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- Remove button -->
      <button
        v-if="canManage && !isOwner && !isCurrentUser"
        class="p-1.5 text-text-muted hover:text-error hover:bg-error-light rounded transition-default"
        title="Remove member"
        @click="handleRemove"
      >
        <Icon
          name="lucide:x"
          class="w-4 h-4"
        />
      </button>
    </div>
  </div>
</template>

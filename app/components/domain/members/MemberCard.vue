<script setup lang="ts">
import type { TeamMember } from '~/types'
import { MemberRole } from '~/types'

/**
 * MemberCard - Premium member display card
 * Elevated design with rich interactions and visual hierarchy
 */

interface Props {
  member: TeamMember
  canManage: boolean
  currentUserId: number
  isCompact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCompact: false,
})

const emit = defineEmits<{
  changeRole: [memberId: number, role: Exclude<MemberRole, MemberRole.Owner>]
  remove: [memberId: number]
}>()

// State
const showRoleDropdown = ref(false)
const isHovered = ref(false)

// Computed
const isOwner = computed(() => props.member.role === MemberRole.Owner)
const isAdmin = computed(() => props.member.role === MemberRole.Admin)
const isCurrentUser = computed(() => props.member.user_id === props.currentUserId)
const canModify = computed(() => props.canManage && !isOwner.value && !isCurrentUser.value)

// Role configuration
const roleConfig = computed(() => {
  const configs: Record<MemberRole, {
    label: string
    color: string
    bg: string
    icon: string
    description: string
  }> = {
    [MemberRole.Owner]: {
      label: 'Owner',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      icon: 'lucide:crown',
      description: 'Full control over workspace',
    },
    [MemberRole.Admin]: {
      label: 'Admin',
      color: 'text-accent',
      bg: 'bg-accent-light',
      icon: 'lucide:shield',
      description: 'Can manage members and settings',
    },
    [MemberRole.Member]: {
      label: 'Member',
      color: 'text-text-secondary',
      bg: 'bg-bg-surface',
      icon: 'lucide:user',
      description: 'Can view and contribute',
    },
  }
  return configs[props.member.role]
})

// Available roles for changing
const availableRoles = computed(() => [
  {
    value: MemberRole.Admin,
    label: 'Admin',
    description: 'Can manage members and settings',
    icon: 'lucide:shield',
  },
  {
    value: MemberRole.Member,
    label: 'Member',
    description: 'Can view and contribute',
    icon: 'lucide:user',
  },
])

// Format joined date
const joinedDate = computed(() => {
  const date = new Date(props.member.joined_at || props.member.created_at)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
})

// Close dropdown when clicking outside
function handleClickOutside() {
  showRoleDropdown.value = false
}

function handleRoleChange(role: MemberRole) {
  if (role === MemberRole.Owner) return
  showRoleDropdown.value = false
  emit('changeRole', props.member.id, role as Exclude<MemberRole, MemberRole.Owner>)
}

function handleRemove() {
  emit('remove', props.member.id)
}

// Close dropdown on escape
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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
        isHovered && canModify
          ? 'bg-bg-elevated border-border-muted shadow-elevated'
          : 'bg-bg-elevated border-border-subtle',
        isOwner ? 'ring-1 ring-amber-200/50' : '',
      ]"
    >
      <!-- Owner crown indicator -->
      <div
        v-if="isOwner"
        class="absolute -top-2 left-4"
      >
        <div class="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full">
          <div class="flex items-center gap-1">
            <Icon
              name="lucide:crown"
              class="w-3 h-3 text-amber-500"
            />
            <span class="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Owner</span>
          </div>
        </div>
      </div>

      <div class="flex items-start gap-4">
        <!-- Avatar with status -->
        <div class="relative flex-shrink-0">
          <BaseAvatar
            :src="member.user.avatar_url"
            :name="member.user.name"
            :size="isCompact ? 'md' : 'lg'"
          />
          <!-- Online indicator (future feature) -->
          <div
            v-if="false"
            class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-bg-elevated"
          />
        </div>

        <!-- Member info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-0.5">
            <h3 class="text-sm font-semibold text-text-primary truncate">
              {{ member.user.name }}
            </h3>
            <span
              v-if="isCurrentUser"
              class="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium text-accent bg-accent/10 rounded"
            >
              You
            </span>
          </div>

          <p class="text-sm text-text-muted truncate mb-2">
            {{ member.user.email }}
          </p>

          <!-- Meta info -->
          <div class="flex items-center gap-3 text-xs text-text-muted">
            <!-- Role badge (non-owner) -->
            <div
              v-if="!isOwner"
              class="flex items-center gap-1.5 px-2 py-1 rounded-md"
              :class="roleConfig.bg"
            >
              <Icon
                :name="roleConfig.icon"
                class="w-3 h-3"
                :class="roleConfig.color"
              />
              <span
                class="font-medium"
                :class="roleConfig.color"
              >
                {{ roleConfig.label }}
              </span>
            </div>

            <!-- Joined date -->
            <div class="flex items-center gap-1">
              <Icon
                name="lucide:calendar"
                class="w-3 h-3"
              />
              <span>Joined {{ joinedDate }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div
          v-if="canModify"
          class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <!-- Role change dropdown -->
          <div
            class="relative"
            @click.stop
          >
            <button
              class="p-2 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-default"
              title="Change role"
              @click="showRoleDropdown = !showRoleDropdown"
            >
              <Icon
                name="lucide:user-cog"
                class="w-4 h-4"
              />
            </button>

            <!-- Dropdown -->
            <Transition
              enter-active-class="transition ease-out duration-150"
              enter-from-class="opacity-0 scale-95 -translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition ease-in duration-100"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-1"
            >
              <div
                v-if="showRoleDropdown"
                class="absolute right-0 z-20 mt-2 w-56 bg-bg-elevated border border-border-subtle rounded-xl shadow-modal overflow-hidden"
              >
                <div class="px-3 py-2 border-b border-border-subtle">
                  <p class="text-xs font-medium text-text-muted uppercase tracking-wide">
                    Change role
                  </p>
                </div>
                <div class="p-1">
                  <button
                    v-for="role in availableRoles"
                    :key="role.value"
                    class="w-full flex items-start gap-3 p-2.5 rounded-lg transition-default"
                    :class="[
                      member.role === role.value
                        ? 'bg-accent/10'
                        : 'hover:bg-bg-surface'
                    ]"
                    @click="handleRoleChange(role.value)"
                  >
                    <div
                      class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      :class="member.role === role.value ? 'bg-accent/20' : 'bg-bg-surface'"
                    >
                      <Icon
                        :name="role.icon"
                        class="w-4 h-4"
                        :class="member.role === role.value ? 'text-accent' : 'text-text-muted'"
                      />
                    </div>
                    <div class="flex-1 text-left">
                      <div class="flex items-center gap-2">
                        <span
                          class="text-sm font-medium"
                          :class="member.role === role.value ? 'text-accent' : 'text-text-primary'"
                        >
                          {{ role.label }}
                        </span>
                        <Icon
                          v-if="member.role === role.value"
                          name="lucide:check"
                          class="w-3.5 h-3.5 text-accent"
                        />
                      </div>
                      <p class="text-xs text-text-muted mt-0.5">
                        {{ role.description }}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Remove button -->
          <button
            class="p-2 text-text-muted hover:text-error hover:bg-error-light rounded-lg transition-default"
            title="Remove member"
            @click="handleRemove"
          >
            <Icon
              name="lucide:user-minus"
              class="w-4 h-4"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

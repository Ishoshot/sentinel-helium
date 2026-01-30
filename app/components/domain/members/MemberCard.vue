<script setup lang="ts">
import type { TeamMember } from '~/types'
import { MemberRole } from '~/types'

/**
 * MemberCard - Editorial roster member card
 * Clean, warm design with refined interactions
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
      color: 'text-amber-700',
      bg: 'bg-amber-100',
      icon: 'lucide:crown',
      description: 'Full control over workspace',
    },
    [MemberRole.Admin]: {
      label: 'Admin',
      color: 'text-blue-700',
      bg: 'bg-blue-100',
      icon: 'lucide:shield',
      description: 'Can manage members and settings',
    },
    [MemberRole.Member]: {
      label: 'Member',
      color: 'text-stone-600',
      bg: 'bg-stone-100',
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
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    value: MemberRole.Member,
    label: 'Member',
    description: 'Can view and contribute',
    icon: 'lucide:user',
    color: 'text-stone-600',
    bg: 'bg-stone-50',
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
      class="relative overflow-hidden rounded-2xl border bg-white transition-all duration-300"
      :class="[
        isHovered
          ? 'border-stone-200 shadow-md'
          : 'border-stone-100 shadow-sm',
        isOwner ? 'ring-2 ring-amber-200/50' : '',
      ]"
    >
      <!-- Owner badge -->
      <div
        v-if="isOwner"
        class="absolute right-3 top-3 z-10"
      >
        <div class="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1">
          <Icon
            name="lucide:crown"
            class="size-3 text-amber-600"
          />
          <span class="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Owner</span>
        </div>
      </div>

      <div class="p-5">
        <div class="flex items-start gap-4">
          <!-- Avatar -->
          <div class="relative shrink-0">
            <BaseAvatar
              :src="member.user.avatar_url"
              :name="member.user.name"
              :size="isCompact ? 'md' : 'lg'"
              class="ring-2 ring-stone-100"
            />
            <!-- Admin shield -->
            <div
              v-if="isAdmin"
              class="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white"
            >
              <Icon
                name="lucide:shield"
                class="size-2.5 text-white"
              />
            </div>
          </div>

          <!-- Member info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="truncate text-sm font-semibold text-stone-900">
                {{ member.user.name }}
              </h3>
              <span
                v-if="isCurrentUser"
                class="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700"
              >
                You
              </span>
            </div>

            <p class="mt-0.5 truncate text-sm text-stone-500">
              {{ member.user.email }}
            </p>

            <!-- Meta info -->
            <div class="mt-3 flex items-center gap-3">
              <!-- Role badge (non-owner) -->
              <div
                v-if="!isOwner"
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

              <!-- Joined date -->
              <div class="flex items-center gap-1.5 text-xs text-stone-400">
                <Icon
                  name="lucide:calendar"
                  class="size-3"
                />
                <span>{{ joinedDate }}</span>
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
            v-if="canModify && isHovered"
            class="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4"
          >
            <!-- Role change dropdown -->
            <div
              class="relative flex-1"
              @click.stop
            >
              <button
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-50 px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
                @click="showRoleDropdown = !showRoleDropdown"
              >
                <Icon
                  name="lucide:user-cog"
                  class="size-3.5"
                />
                Change role
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
                  class="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl"
                >
                  <div class="border-b border-stone-100 px-3 py-2">
                    <p class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      Select role
                    </p>
                  </div>
                  <div class="p-1.5">
                    <button
                      v-for="role in availableRoles"
                      :key="role.value"
                      class="flex w-full items-center gap-3 rounded-lg p-2.5 transition-colors"
                      :class="[
                        member.role === role.value
                          ? role.bg
                          : 'hover:bg-stone-50'
                      ]"
                      @click="handleRoleChange(role.value)"
                    >
                      <div
                        class="flex size-8 items-center justify-center rounded-lg"
                        :class="member.role === role.value ? 'bg-white shadow-sm' : 'bg-stone-100'"
                      >
                        <Icon
                          :name="role.icon"
                          class="size-4"
                          :class="role.color"
                        />
                      </div>
                      <div class="flex-1 text-left">
                        <div class="flex items-center gap-2">
                          <span
                            class="text-sm font-medium"
                            :class="member.role === role.value ? role.color : 'text-stone-700'"
                          >
                            {{ role.label }}
                          </span>
                          <Icon
                            v-if="member.role === role.value"
                            name="lucide:check"
                            class="size-3.5"
                            :class="role.color"
                          />
                        </div>
                        <p class="text-[11px] text-stone-500">
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
              class="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600"
              @click="handleRemove"
            >
              <Icon
                name="lucide:user-minus"
                class="size-3.5"
              />
              Remove
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

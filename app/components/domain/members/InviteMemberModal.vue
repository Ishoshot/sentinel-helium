<script setup lang="ts">
import { MemberRole } from '~/types'

/**
 * InviteMemberModal - Refined invitation modal
 * Clean, professional design following Sentinel UX principles
 */

interface Props {
  modelValue: boolean
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [email: string, role: Exclude<MemberRole, MemberRole.Owner>]
}>()

// Animation state
const isReady = ref(false)

// Form state
const email = ref('')
const selectedRole = ref<Exclude<MemberRole, MemberRole.Owner>>(MemberRole.Member)
const emailTouched = ref(false)

// Role options with refined descriptions
const roleOptions: {
  value: Exclude<MemberRole, MemberRole.Owner>
  label: string
  description: string
  icon: string
  permissions: string[]
}[] = [
  {
    value: MemberRole.Member,
    label: 'Member',
    description: 'Standard access for developers',
    icon: 'lucide:user',
    permissions: ['View repositories', 'View reviews', 'View findings'],
  },
  {
    value: MemberRole.Admin,
    label: 'Admin',
    description: 'Extended access for team leads',
    icon: 'lucide:shield',
    permissions: ['Manage members', 'Configure settings', 'Manage integrations'],
  },
]

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = computed(() => emailRegex.test(email.value))
const showEmailError = computed(() => emailTouched.value && email.value && !isValidEmail.value)
const canSubmit = computed(() => isValidEmail.value && !props.loading)

// Modal visibility
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Reset form when modal opens
watch(isOpen, (open) => {
  if (open) {
    email.value = ''
    selectedRole.value = MemberRole.Member
    emailTouched.value = false
    isReady.value = false
    setTimeout(() => {
      isReady.value = true
    }, 50)
  }
})

function handleSubmit() {
  if (!canSubmit.value) return
  emit('submit', email.value.trim(), selectedRole.value)
}

function handleClose() {
  isOpen.value = false
}

function handleEmailBlur() {
  emailTouched.value = true
}
</script>

<template>
  <BaseModal
    v-model="isOpen"
    size="md"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-gray-100">
          <Icon
            name="lucide:user-plus"
            class="size-5 text-gray-600"
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Invite team member
          </h2>
          <p class="text-sm text-gray-500">
            Send an invitation to join your workspace
          </p>
        </div>
      </div>
    </template>

    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- Email input -->
      <div
        class="transition-all duration-500 ease-out"
        :class="isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
      >
        <label
          for="invite-email"
          class="mb-2 block text-sm font-medium text-gray-900"
        >
          Email address
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon
              name="lucide:mail"
              class="size-4 text-gray-400"
            />
          </div>
          <input
            id="invite-email"
            v-model="email"
            type="email"
            placeholder="colleague@company.com"
            autocomplete="email"
            class="w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            :class="[
              showEmailError
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:border-gray-300',
            ]"
            @blur="handleEmailBlur"
          >
          <!-- Valid indicator -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-75"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-75"
          >
            <div
              v-if="isValidEmail && email"
              class="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <div class="flex size-5 items-center justify-center rounded-full bg-emerald-100">
                <Icon
                  name="lucide:check"
                  class="size-3 text-emerald-600"
                />
              </div>
            </div>
          </Transition>
        </div>
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <p
            v-if="showEmailError"
            class="mt-1.5 flex items-center gap-1 text-xs text-red-600"
          >
            <Icon
              name="lucide:alert-circle"
              class="size-3"
            />
            Please enter a valid email address
          </p>
        </Transition>
      </div>

      <!-- Role selection -->
      <div
        class="transition-all duration-500 ease-out delay-75"
        :class="isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
      >
        <label class="mb-3 block text-sm font-medium text-gray-900">
          Select role
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="role in roleOptions"
            :key="role.value"
            type="button"
            class="group relative rounded-xl border-2 p-4 text-left transition-all duration-200"
            :class="[
              selectedRole === role.value
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
            ]"
            @click="selectedRole = role.value"
          >
            <!-- Selected indicator -->
            <div
              class="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full transition-all duration-200"
              :class="selectedRole === role.value ? 'bg-gray-900' : 'border-2 border-gray-200 bg-white'"
            >
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-0"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-0"
              >
                <Icon
                  v-if="selectedRole === role.value"
                  name="lucide:check"
                  class="size-3 text-white"
                />
              </Transition>
            </div>

            <!-- Icon -->
            <div
              class="mb-3 flex size-10 items-center justify-center rounded-lg transition-colors duration-200"
              :class="selectedRole === role.value ? 'bg-gray-900' : 'bg-gray-100 group-hover:bg-gray-200'"
            >
              <Icon
                :name="role.icon"
                class="size-5 transition-colors duration-200"
                :class="selectedRole === role.value ? 'text-white' : 'text-gray-500'"
              />
            </div>

            <!-- Content -->
            <h3
              class="text-sm font-semibold transition-colors duration-200"
              :class="selectedRole === role.value ? 'text-gray-900' : 'text-gray-700'"
            >
              {{ role.label }}
            </h3>
            <p class="mt-0.5 text-xs text-gray-500">
              {{ role.description }}
            </p>

            <!-- Permissions -->
            <ul class="mt-3 space-y-1">
              <li
                v-for="permission in role.permissions"
                :key="permission"
                class="flex items-center gap-1.5 text-[11px] text-gray-400"
              >
                <Icon
                  name="lucide:check"
                  class="size-3 text-gray-300"
                />
                {{ permission }}
              </li>
            </ul>
          </button>
        </div>
      </div>

      <!-- Error message -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div
          v-if="error"
          class="rounded-lg border border-red-200 bg-red-50 p-3"
        >
          <div class="flex items-center gap-2">
            <Icon
              name="lucide:alert-circle"
              class="size-4 shrink-0 text-red-600"
            />
            <p class="text-sm text-red-700">
              {{ error }}
            </p>
          </div>
        </div>
      </Transition>
    </form>

    <template #footer>
      <div class="flex items-center justify-between">
        <p class="text-xs text-gray-400">
          They'll receive an email with an invitation link
        </p>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            <Icon
              v-if="loading"
              name="lucide:loader-2"
              class="size-4 animate-spin"
            />
            <Icon
              v-else
              name="lucide:send"
              class="size-4"
            />
            Invite
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

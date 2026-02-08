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
        <div class="flex size-10 items-center justify-center rounded-xl bg-accent/10">
          <Icon
            name="lucide:user-plus"
            class="size-5 text-accent"
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-text-primary">
            Invite team member
          </h2>
          <p class="text-sm text-text-muted">
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
          class="mb-2 block text-sm font-medium text-text-primary"
        >
          Email address
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon
              name="lucide:mail"
              class="size-4 text-text-muted"
            />
          </div>
          <input
            id="invite-email"
            v-model="email"
            type="email"
            placeholder="colleague@company.com"
            autocomplete="email"
            class="w-full rounded-lg border bg-bg-surface py-2.5 pl-10 pr-10 text-sm text-text-primary transition-all duration-200 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/10"
            :class="[
              showEmailError
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                : 'border-border-subtle focus:border-border-muted',
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
        <label class="mb-3 block text-sm font-medium text-text-primary">
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
                ? 'border-accent bg-accent/5'
                : 'border-border-subtle hover:border-border-muted hover:bg-bg-hover'
            ]"
            @click="selectedRole = role.value"
          >
            <!-- Selected indicator -->
            <div
              class="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full transition-all duration-200"
              :class="selectedRole === role.value ? 'bg-accent' : 'border-2 border-border-subtle bg-bg-surface'"
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
              :class="selectedRole === role.value ? 'bg-accent' : 'bg-bg-surface group-hover:bg-bg-hover'"
            >
              <Icon
                :name="role.icon"
                class="size-5 transition-colors duration-200"
                :class="selectedRole === role.value ? 'text-white' : 'text-text-muted'"
              />
            </div>

            <!-- Content -->
            <h3
              class="text-sm font-semibold transition-colors duration-200"
              :class="selectedRole === role.value ? 'text-text-primary' : 'text-text-secondary'"
            >
              {{ role.label }}
            </h3>
            <p class="mt-0.5 text-xs text-text-muted">
              {{ role.description }}
            </p>

            <!-- Permissions -->
            <ul class="mt-3 space-y-1">
              <li
                v-for="permission in role.permissions"
                :key="permission"
                class="flex items-center gap-1.5 text-[11px] text-text-muted"
              >
                <Icon
                  name="lucide:check"
                  class="size-3 text-text-muted"
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
          class="rounded-lg border border-red-500/20 bg-red-500/10 p-3"
        >
          <div class="flex items-center gap-2">
            <Icon
              name="lucide:alert-circle"
              class="size-4 shrink-0 text-red-400"
            />
            <p class="text-sm text-red-400">
              {{ error }}
            </p>
          </div>
        </div>
      </Transition>
    </form>

    <template #footer>
      <div class="flex items-center justify-between">
        <p class="text-xs text-text-muted">
          They'll receive an email with an invitation link
        </p>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-teal-600 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
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

<style scoped>
.hover\:shadow-glow:hover {
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.4);
}
</style>

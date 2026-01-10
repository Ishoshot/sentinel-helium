<script setup lang="ts">
import { MemberRole } from '~/types'

/**
 * InviteMemberModal - Premium invitation modal
 * Rich role selection with descriptions and visual feedback
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

// Form state
const email = ref('')
const selectedRole = ref<Exclude<MemberRole, MemberRole.Owner>>(MemberRole.Member)
const emailTouched = ref(false)

// Role options with rich descriptions
const roleOptions = [
  {
    value: MemberRole.Member,
    label: 'Member',
    description: 'Can view repositories, reviews, and findings. Perfect for developers.',
    icon: 'lucide:user',
    color: 'text-text-secondary',
    bg: 'bg-bg-surface',
    selectedBg: 'bg-accent/10',
    selectedBorder: 'border-accent/30',
  },
  {
    value: MemberRole.Admin,
    label: 'Admin',
    description: 'Can manage members, settings, and integrations. For team leads.',
    icon: 'lucide:shield',
    color: 'text-accent',
    bg: 'bg-accent-light',
    selectedBg: 'bg-accent/10',
    selectedBorder: 'border-accent/30',
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
    title="Invite team member"
    size="md"
  >
    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- Header illustration -->
      <div class="flex justify-center">
        <div class="relative">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
            <Icon
              name="lucide:user-plus"
              class="w-8 h-8 text-accent"
            />
          </div>
          <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center">
            <Icon
              name="lucide:mail"
              class="w-3.5 h-3.5 text-white"
            />
          </div>
        </div>
      </div>

      <!-- Description -->
      <p class="text-center text-sm text-text-secondary">
        Send an invitation to join your workspace. They'll receive an email with a link to accept.
      </p>

      <!-- Email input -->
      <div>
        <label
          for="invite-email"
          class="block text-sm font-medium text-text-primary mb-2"
        >
          Email address
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              name="lucide:mail"
              class="w-4 h-4 text-text-muted"
            />
          </div>
          <input
            id="invite-email"
            v-model="email"
            type="email"
            placeholder="colleague@company.com"
            class="w-full pl-10 pr-4 py-2.5 text-sm text-text-primary bg-bg-elevated border rounded-lg transition-all duration-200 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            :class="[
              showEmailError
                ? 'border-error focus:ring-error/50 focus:border-error'
                : 'border-border-muted',
              isValidEmail && email ? 'pr-10' : ''
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
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <div class="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                <Icon
                  name="lucide:check"
                  class="w-3 h-3 text-success"
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
            class="mt-1.5 text-xs text-error flex items-center gap-1"
          >
            <Icon
              name="lucide:alert-circle"
              class="w-3 h-3"
            />
            Please enter a valid email address
          </p>
        </Transition>
      </div>

      <!-- Role selection -->
      <div>
        <label class="block text-sm font-medium text-text-primary mb-3">
          Select role
        </label>
        <div class="space-y-2">
          <button
            v-for="role in roleOptions"
            :key="role.value"
            type="button"
            class="w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left"
            :class="[
              selectedRole === role.value
                ? `${role.selectedBg} ${role.selectedBorder}`
                : 'border-border-subtle hover:border-border-muted hover:bg-bg-surface/50'
            ]"
            @click="selectedRole = role.value"
          >
            <div
              class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200"
              :class="selectedRole === role.value ? 'bg-accent/20' : role.bg"
            >
              <Icon
                :name="role.icon"
                class="w-5 h-5 transition-colors duration-200"
                :class="selectedRole === role.value ? 'text-accent' : role.color"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span
                  class="text-sm font-semibold transition-colors duration-200"
                  :class="selectedRole === role.value ? 'text-accent' : 'text-text-primary'"
                >
                  {{ role.label }}
                </span>
                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 scale-75"
                  enter-to-class="opacity-100 scale-100"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100 scale-100"
                  leave-to-class="opacity-0 scale-75"
                >
                  <div
                    v-if="selectedRole === role.value"
                    class="w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                  >
                    <Icon
                      name="lucide:check"
                      class="w-3 h-3 text-white"
                    />
                  </div>
                </Transition>
              </div>
              <p class="text-xs text-text-muted mt-1">
                {{ role.description }}
              </p>
            </div>
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
          class="p-3 rounded-lg bg-error-light border border-error/20"
        >
          <div class="flex items-center gap-2">
            <Icon
              name="lucide:alert-circle"
              class="w-4 h-4 text-error flex-shrink-0"
            />
            <p class="text-sm text-error">
              {{ error }}
            </p>
          </div>
        </div>
      </Transition>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <BaseButton
          variant="secondary"
          @click="handleClose"
        >
          Cancel
        </BaseButton>
        <BaseButton
          :loading="loading"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          <Icon
            name="lucide:send"
            class="w-4 h-4 mr-1.5"
          />
          Send invitation
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { MemberRole } from '~/types'

/**
 * InviteForm - Form for inviting new members
 * Domain component with email and role selection
 */

interface Props {
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
})

const emit = defineEmits<{
  submit: [email: string, role: Exclude<MemberRole, MemberRole.Owner>]
}>()

const email = ref('')
const role = ref<Exclude<MemberRole, MemberRole.Owner>>(MemberRole.Member)

// Available roles
const roles: { value: Exclude<MemberRole, MemberRole.Owner>; label: string }[] = [
  { value: MemberRole.Member, label: 'Member' },
  { value: MemberRole.Admin, label: 'Admin' },
]

function handleSubmit() {
  if (!email.value.trim()) return
  emit('submit', email.value.trim(), role.value)
}

// Reset form
function reset() {
  email.value = ''
  role.value = MemberRole.Member
}

// Expose reset method
defineExpose({ reset })
</script>

<template>
  <form
    class="flex flex-col sm:flex-row gap-3"
    @submit.prevent="handleSubmit"
  >
    <!-- Email input -->
    <div class="flex-1">
      <input
        v-model="email"
        type="email"
        placeholder="Email address"
        class="w-full px-3 py-2 text-sm text-text-primary bg-bg-elevated border border-border-muted rounded-lg transition-default placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        :class="{ 'border-error': error }"
      >
    </div>

    <!-- Role select -->
    <div class="relative">
      <select
        v-model="role"
        class="appearance-none px-3 py-2 pr-8 text-sm text-text-primary bg-bg-elevated border border-border-muted rounded-lg transition-default focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      >
        <option
          v-for="r in roles"
          :key="r.value"
          :value="r.value"
        >
          {{ r.label }}
        </option>
      </select>
      <Icon
        name="lucide:chevron-down"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
      />
    </div>

    <!-- Submit button -->
    <BaseButton
      type="submit"
      :loading="loading"
      :disabled="!email.trim()"
    >
      <Icon
        name="lucide:send"
        class="w-4 h-4 mr-1.5"
      />
      Invite
    </BaseButton>
  </form>

  <!-- Error message -->
  <p
    v-if="error"
    class="mt-2 text-sm text-error"
  >
    {{ error }}
  </p>
</template>

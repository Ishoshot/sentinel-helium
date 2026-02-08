<script setup lang="ts">
/**
 * BaseInput - V2 Text input field component
 * Dark theme with teal accent focus ring and glow
 */

interface Props {
  modelValue: string
  type?: 'text' | 'email' | 'password' | 'search' | 'url' | 'number'
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: '',
  label: '',
  id: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

const inputClasses = computed(() => {
  const base = 'w-full px-4 py-2.5 text-sm text-text-primary bg-bg-elevated border rounded-xl transition-all duration-200 placeholder:text-text-faint focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

  const stateClasses = props.error
    ? 'border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(244,63,94,0.15)]'
    : 'border-border-muted hover:border-text-muted focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,184,166,0.15)]'

  return [base, stateClasses]
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="space-y-1.5">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-text-primary"
    >
      {{ label }}
    </label>

    <!-- Input -->
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClasses"
      @input="handleInput"
    >

    <!-- Error message -->
    <p
      v-if="error"
      class="text-sm text-error"
    >
      {{ error }}
    </p>
  </div>
</template>

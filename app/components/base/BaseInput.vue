<script setup lang="ts">
/**
 * BaseInput - Text input field component
 * Follows Sentinel design system
 */

interface Props {
  modelValue: string
  type?: 'text' | 'email' | 'password' | 'search'
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

// Generate unique ID if not provided
const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

// Input classes - modern subtle focus style
const inputClasses = computed(() => {
  const base = 'w-full px-4 py-2.5 text-sm text-text-primary bg-bg-elevated border rounded-xl transition-all duration-200 placeholder:text-text-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

  const stateClasses = props.error
    ? 'border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)]'
    : 'border-border-subtle hover:border-border-muted focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]'

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

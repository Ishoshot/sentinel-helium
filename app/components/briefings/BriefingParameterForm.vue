<script setup lang="ts">
/**
 * BriefingParameterForm - Dynamic form based on parameter schema
 * Renders appropriate inputs for each property type
 */

import type { ParameterSchema, SchemaProperty } from '~/types/schema'
import { hasEnumValues, getPropertyDefault } from '~/types/schema'

interface Props {
  schema: ParameterSchema
  modelValue: Record<string, unknown>
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

// Get property entries sorted by whether they're required first
const propertyEntries = computed(() => {
  const entries = Object.entries(props.schema.properties)
  const required = props.schema.required || []

  return entries.sort((a, b) => {
    const aRequired = required.includes(a[0])
    const bRequired = required.includes(b[0])
    if (aRequired && !bRequired) return -1
    if (!aRequired && bRequired) return 1
    return 0
  })
})

// Check if a property is required
function isRequired(name: string): boolean {
  return props.schema.required?.includes(name) || false
}

// Get input type based on property
function getInputType(property: SchemaProperty): string {
  if (hasEnumValues(property)) return 'select'

  switch (property.type) {
    case 'string':
      if (property.format === 'date') return 'date'
      if (property.format === 'date-time') return 'datetime-local'
      if (property.format === 'email') return 'email'
      if (property.format === 'uri' || property.format === 'url') return 'url'
      return 'text'
    case 'integer':
    case 'number':
      return 'number'
    case 'boolean':
      return 'checkbox'
    case 'array':
      return 'multiselect'
    default:
      return 'text'
  }
}

// Get current value for a property
function getValue(name: string): unknown {
  const property = props.schema.properties[name]
  if (!property) return null
  return props.modelValue[name] ?? getPropertyDefault(property)
}

// Update a property value
function updateValue(name: string, value: unknown) {
  emit('update:modelValue', {
    ...props.modelValue,
    [name]: value,
  })
}

// Handle input changes
function handleInput(name: string, event: Event) {
  const target = event.target as HTMLInputElement
  const property = props.schema.properties[name]
  if (!property) return

  let value: unknown = target.value

  if (property.type === 'integer') {
    value = target.value ? parseInt(target.value, 10) : null
  }
  else if (property.type === 'number') {
    value = target.value ? parseFloat(target.value) : null
  }
  else if (property.type === 'boolean') {
    value = target.checked
  }

  updateValue(name, value)
}

// Format property name for display
function formatLabel(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
</script>

<template>
  <div class="space-y-5">
    <div
      v-for="[name, property] in propertyEntries"
      :key="name"
      class="space-y-1.5"
    >
      <!-- Boolean/Checkbox -->
      <template v-if="property.type === 'boolean'">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            :checked="getValue(name) as boolean"
            :disabled="disabled"
            class="w-4 h-4 rounded border-border-muted text-accent focus:ring-accent focus:ring-offset-0 transition-colors"
            @change="handleInput(name, $event)"
          >
          <span class="text-sm text-text-primary group-hover:text-text-primary/80">
            {{ formatLabel(name) }}
            <span
              v-if="isRequired(name)"
              class="text-error"
            >*</span>
          </span>
        </label>
        <p
          v-if="property.description"
          class="text-xs text-text-muted ml-7"
        >
          {{ property.description }}
        </p>
      </template>

      <!-- Select (enum) -->
      <template v-else-if="hasEnumValues(property)">
        <label class="block text-sm font-medium text-text-primary">
          {{ formatLabel(name) }}
          <span
            v-if="isRequired(name)"
            class="text-error"
          >*</span>
        </label>
        <p
          v-if="property.description"
          class="text-xs text-text-muted mb-1.5"
        >
          {{ property.description }}
        </p>
        <select
          :value="getValue(name)"
          :disabled="disabled"
          class="w-full px-3 py-2 text-sm text-text-primary bg-bg-elevated border border-border-muted rounded-lg transition-default focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          @change="updateValue(name, ($event.target as HTMLSelectElement).value)"
        >
          <option
            value=""
            disabled
          >
            Select...
          </option>
          <option
            v-for="option in property.enum"
            :key="String(option)"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </template>

      <!-- Date input -->
      <template v-else-if="getInputType(property) === 'date'">
        <label class="block text-sm font-medium text-text-primary">
          {{ formatLabel(name) }}
          <span
            v-if="isRequired(name)"
            class="text-error"
          >*</span>
        </label>
        <p
          v-if="property.description"
          class="text-xs text-text-muted mb-1.5"
        >
          {{ property.description }}
        </p>
        <input
          type="date"
          :value="getValue(name)"
          :disabled="disabled"
          class="w-full px-3 py-2 text-sm text-text-primary bg-bg-elevated border border-border-muted rounded-lg transition-default focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          @input="handleInput(name, $event)"
        >
      </template>

      <!-- Number input -->
      <template v-else-if="property.type === 'integer' || property.type === 'number'">
        <label class="block text-sm font-medium text-text-primary">
          {{ formatLabel(name) }}
          <span
            v-if="isRequired(name)"
            class="text-error"
          >*</span>
        </label>
        <p
          v-if="property.description"
          class="text-xs text-text-muted mb-1.5"
        >
          {{ property.description }}
        </p>
        <input
          type="number"
          :value="getValue(name)"
          :min="property.minimum"
          :max="property.maximum"
          :step="property.type === 'integer' ? 1 : 'any'"
          :disabled="disabled"
          class="w-full px-3 py-2 text-sm text-text-primary bg-bg-elevated border border-border-muted rounded-lg transition-default focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          @input="handleInput(name, $event)"
        >
      </template>

      <!-- Text input (default) -->
      <template v-else>
        <label class="block text-sm font-medium text-text-primary">
          {{ formatLabel(name) }}
          <span
            v-if="isRequired(name)"
            class="text-error"
          >*</span>
        </label>
        <p
          v-if="property.description"
          class="text-xs text-text-muted mb-1.5"
        >
          {{ property.description }}
        </p>
        <input
          :type="getInputType(property)"
          :value="getValue(name)"
          :minlength="property.minLength"
          :maxlength="property.maxLength"
          :disabled="disabled"
          :placeholder="property.description || `Enter ${formatLabel(name).toLowerCase()}`"
          class="w-full px-3 py-2 text-sm text-text-primary bg-bg-elevated border border-border-muted rounded-lg transition-default placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          @input="handleInput(name, $event)"
        >
      </template>
    </div>

    <!-- Empty state -->
    <div
      v-if="propertyEntries.length === 0"
      class="text-sm text-text-muted text-center py-4"
    >
      No configuration options available.
    </div>
  </div>
</template>

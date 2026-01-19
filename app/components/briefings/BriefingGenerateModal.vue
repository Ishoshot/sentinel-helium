<script setup lang="ts">
/**
 * BriefingGenerateModal - Modal for configuring briefing parameters before generation
 * Collects user input based on the briefing's parameter schema
 */

import type { Briefing } from '~/types/briefings'
import { buildInitialValues } from '~/types/schema'

interface Props {
  briefing: Briefing
  modelValue: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'generate': [parameters: Record<string, unknown>]
}>()

// Form state
const parameters = ref<Record<string, unknown>>({})

// Initialize parameters when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.briefing.parameter_schema) {
    parameters.value = buildInitialValues(props.briefing.parameter_schema)
  }
})

// Check if briefing has parameters to configure
const hasParameters = computed(() => {
  const schema = props.briefing.parameter_schema
  return schema && Object.keys(schema.properties || {}).length > 0
})

// Close modal
function close() {
  emit('update:modelValue', false)
}

// Handle generation
function handleGenerate() {
  emit('generate', parameters.value)
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    size="lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-bg-surface">
          <Icon
            :name="briefing.icon || 'lucide:file-text'"
            class="w-5 h-5 text-text-secondary"
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-text-primary">
            {{ briefing.title }}
          </h2>
          <p class="text-sm text-text-muted">
            Configure and generate
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Description -->
      <p class="text-sm text-text-secondary leading-relaxed">
        {{ briefing.description }}
      </p>

      <!-- Parameter form -->
      <div v-if="hasParameters">
        <h3 class="text-sm font-medium text-text-primary mb-4">
          Configuration
        </h3>
        <BriefingParameterForm
          v-model="parameters"
          :schema="briefing.parameter_schema"
          :disabled="loading"
        />
      </div>

      <!-- No parameters message -->
      <div
        v-else
        class="text-center py-6"
      >
        <div class="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-bg-surface">
          <Icon
            name="lucide:check-circle"
            class="w-6 h-6 text-success"
          />
        </div>
        <p class="text-sm text-text-secondary">
          This briefing is ready to generate with default settings.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <BaseButton
          variant="ghost"
          :disabled="loading"
          @click="close"
        >
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          :loading="loading"
          @click="handleGenerate"
        >
          <Icon
            name="lucide:sparkles"
            class="w-4 h-4 mr-2"
          />
          Generate Briefing
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

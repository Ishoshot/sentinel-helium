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

const outputFormats = computed(() => props.briefing.output_formats || [])

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
      <div class="flex items-start gap-4">
        <div class="flex size-12 items-center justify-center rounded-2xl bg-bg-surface ring-1 ring-border-muted">
          <Icon
            :name="briefing.icon || 'lucide:file-text'"
            class="size-5 text-text-secondary"
          />
        </div>
        <div class="min-w-0">
          <h2 class="truncate text-lg font-semibold text-text-primary">
            {{ briefing.title }}
          </h2>
          <p class="text-sm text-text-muted">Configure and generate</p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span
              v-if="briefing.requires_ai"
              class="inline-flex items-center gap-1 rounded-md bg-bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary ring-1 ring-border-muted"
            >
              <Icon name="lucide:sparkles" class="size-3" />
              AI
            </span>
            <span
              v-if="briefing.is_schedulable"
              class="inline-flex items-center gap-1 rounded-md bg-bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary ring-1 ring-border-muted"
            >
              <Icon name="lucide:calendar" class="size-3" />
              Schedulable
            </span>
            <span
              v-for="format in outputFormats"
              :key="format"
              class="inline-flex items-center rounded-md bg-bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary ring-1 ring-border-muted"
            >
              {{ format.toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Description -->
      <div class="rounded-xl border border-border-muted bg-bg-surface px-4 py-3">
        <p class="text-sm leading-relaxed text-text-secondary">
          {{ briefing.description }}
        </p>
      </div>

      <!-- Parameter form -->
      <div v-if="hasParameters">
        <h3 class="mb-3 text-sm font-medium text-text-primary">
          Configuration
        </h3>
        <div class="rounded-xl border border-border-muted bg-bg-elevated p-4">
          <BriefingParameterForm
            v-model="parameters"
            :schema="briefing.parameter_schema"
            :disabled="loading"
          />
        </div>
      </div>

      <!-- No parameters message -->
      <div
        v-else
        class="flex items-start gap-3 rounded-xl border border-border-muted bg-bg-surface px-4 py-3"
      >
        <div class="flex size-10 items-center justify-center rounded-lg bg-bg-elevated">
          <Icon
            name="lucide:check-circle"
            class="size-5 text-success"
          />
        </div>
        <div class="space-y-0.5">
          <p class="text-sm font-medium text-text-primary">
            No configuration needed
          </p>
          <p class="text-sm text-text-secondary">
            This briefing generates with default settings.
          </p>
        </div>
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

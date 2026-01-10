<script setup lang="ts">
import type { Repository, UpdateRepositoryData } from '~/types'

/**
 * RepositorySettingsModal - Configure repository settings
 */

interface Props {
  modelValue: boolean
  repository: Repository | null
  isUpdating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isUpdating: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: UpdateRepositoryData]
}>()

// Form state
const autoReviewEnabled = ref(false)
const focusAreas = ref('')
const ignorePaths = ref('')

// Initialize form when repository changes
watch(
  () => props.repository,
  (repo) => {
    if (repo) {
      autoReviewEnabled.value = repo.auto_review_enabled
      const rules = repo.settings?.review_rules as Record<string, unknown> | null
      focusAreas.value = (rules?.focus_areas as string[] | undefined)?.join(', ') ?? ''
      ignorePaths.value = (rules?.ignore_paths as string[] | undefined)?.join(', ') ?? ''
    }
  },
  { immediate: true }
)

// Reset form when modal closes
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      // Reset on close
      autoReviewEnabled.value = props.repository?.auto_review_enabled ?? false
    }
  }
)

// Check if form has changes
const hasChanges = computed(() => {
  if (!props.repository) return false

  const currentRules = props.repository.settings?.review_rules as Record<string, unknown> | null
  const currentFocusAreas = (currentRules?.focus_areas as string[] | undefined)?.join(', ') ?? ''
  const currentIgnorePaths = (currentRules?.ignore_paths as string[] | undefined)?.join(', ') ?? ''

  return (
    autoReviewEnabled.value !== props.repository.auto_review_enabled ||
    focusAreas.value !== currentFocusAreas ||
    ignorePaths.value !== currentIgnorePaths
  )
})

// Build review rules from form
function buildReviewRules(): Record<string, unknown> | null {
  const rules: Record<string, unknown> = {}

  if (focusAreas.value.trim()) {
    rules.focus_areas = focusAreas.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  if (ignorePaths.value.trim()) {
    rules.ignore_paths = ignorePaths.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  return Object.keys(rules).length > 0 ? rules : null
}

// Handle save
function handleSave() {
  const data: UpdateRepositoryData = {
    auto_review_enabled: autoReviewEnabled.value,
    review_rules: buildReviewRules(),
  }
  emit('save', data)
}

// Close modal
function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Repository Settings"
    size="md"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div>
        <h2 class="text-lg font-semibold text-text-primary">
          Repository Settings
        </h2>
        <p
          v-if="repository"
          class="text-sm text-text-muted"
        >
          {{ repository.full_name }}
        </p>
      </div>
    </template>

    <div
      v-if="repository"
      class="space-y-6"
    >
      <!-- Auto-review toggle -->
      <div>
        <label class="flex items-center justify-between cursor-pointer">
          <div>
            <p class="font-medium text-text-primary">
              Automatic Code Reviews
            </p>
            <p class="text-sm text-text-muted">
              Sentinel will automatically review pull requests when they are opened
            </p>
          </div>
          <button
            type="button"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            :class="autoReviewEnabled ? 'bg-accent' : 'bg-bg-surface'"
            role="switch"
            :aria-checked="autoReviewEnabled"
            @click="autoReviewEnabled = !autoReviewEnabled"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="autoReviewEnabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </label>
      </div>

      <!-- Advanced settings (only shown when auto-review is enabled) -->
      <div
        v-if="autoReviewEnabled"
        class="space-y-4 pt-4 border-t border-border-subtle"
      >
        <h4 class="text-sm font-medium text-text-primary">
          Review Rules (Advanced)
        </h4>

        <!-- Focus areas -->
        <div>
          <label
            for="focus-areas"
            class="block text-sm font-medium text-text-secondary mb-1"
          >
            Focus Areas
          </label>
          <input
            id="focus-areas"
            v-model="focusAreas"
            type="text"
            class="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="security, performance, accessibility"
          >
          <p class="mt-1 text-xs text-text-muted">
            Comma-separated areas Sentinel should focus on during reviews
          </p>
        </div>

        <!-- Ignore paths -->
        <div>
          <label
            for="ignore-paths"
            class="block text-sm font-medium text-text-secondary mb-1"
          >
            Ignore Paths
          </label>
          <input
            id="ignore-paths"
            v-model="ignorePaths"
            type="text"
            class="w-full px-3 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="tests/**, docs/**, *.md"
          >
          <p class="mt-1 text-xs text-text-muted">
            Comma-separated glob patterns for files to skip during reviews
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton
          variant="secondary"
          @click="close"
        >
          Cancel
        </BaseButton>
        <BaseButton
          :loading="isUpdating"
          :disabled="!hasChanges"
          @click="handleSave"
        >
          Save Changes
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

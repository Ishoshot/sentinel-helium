<script setup lang="ts">
import type { Repository, UpdateRepositoryData } from '~/types'
import { useSentinelConfig } from '~/composables/useSentinelConfig'

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
const showConfigViewer = ref(false)

const { hasConfig, error: configError, hasError, syncedAtLabel, configJson, config } =
  useSentinelConfig(computed(() => props.repository?.settings))

// Initialize form when repository changes
watch(
  () => props.repository,
  (repo) => {
    if (repo) {
      autoReviewEnabled.value = repo.auto_review_enabled
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
      showConfigViewer.value = false
    }
  }
)

// Check if form has changes
const hasChanges = computed(() => {
  if (!props.repository) return false

  return autoReviewEnabled.value !== props.repository.auto_review_enabled
})

// Handle save
function handleSave() {
  const data: UpdateRepositoryData = {
    auto_review_enabled: autoReviewEnabled.value,
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
        class="space-y-4 pt-4 border-t border-border-subtle"
      >
        <h4 class="text-sm font-medium text-text-primary">
          Sentinel Configuration
        </h4>

        <div
          v-if="hasError"
          class="rounded-lg border border-warning/20 bg-warning/5 p-3"
        >
          <div class="flex items-start gap-2">
            <Icon
              name="lucide:alert-triangle"
              class="w-4 h-4 text-warning mt-0.5"
            />
            <div class="min-w-0">
              <div class="text-sm font-medium text-text-primary">
                Config Error
              </div>
              <div class="mt-1 text-sm text-text-secondary whitespace-pre-line">
                {{ configError }}
              </div>
              <div class="mt-2 text-xs text-text-muted">
                Reviews are skipped until this is fixed.
              </div>
              <div class="mt-1 text-xs text-text-muted">
                Last sync attempt: {{ syncedAtLabel }}
              </div>

              <div class="mt-3">
                <BaseButton
                  variant="secondary"
                  size="sm"
                  disabled
                >
                  <Icon
                    name="lucide:book-open"
                    class="w-4 h-4 mr-1.5"
                  />
                  View Documentation
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="hasConfig"
          class="rounded-lg border border-border-subtle bg-bg-surface p-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <Icon
                  name="lucide:file-code"
                  class="w-4 h-4 text-accent"
                />
                <div class="text-sm font-medium text-text-primary">
                  Config Active
                </div>
              </div>
              <div class="mt-1 text-xs text-text-muted">
                Last synced: {{ syncedAtLabel }}
              </div>

              <!-- AI Provider Info -->
              <div
                v-if="config?.provider"
                class="mt-3 pt-3 border-t border-border-subtle"
              >
                <div class="text-xs font-medium text-text-secondary mb-2">
                  AI Provider Settings
                </div>
                <div class="space-y-1.5">
                  <div
                    v-if="config.provider.preferred"
                    class="flex items-center gap-2 text-xs text-text-muted"
                  >
                    <Icon
                      name="lucide:bot"
                      class="w-3.5 h-3.5"
                    />
                    <span>Provider: <span class="font-medium text-text-primary">{{ config.provider.preferred }}</span></span>
                  </div>
                  <div
                    v-if="config.provider.model"
                    class="flex items-center gap-2 text-xs text-text-muted"
                  >
                    <Icon
                      name="lucide:cpu"
                      class="w-3.5 h-3.5"
                    />
                    <span>Model: <span class="font-medium text-text-primary">{{ config.provider.model }}</span></span>
                  </div>
                  <div
                    v-if="config.provider.fallback !== undefined"
                    class="flex items-center gap-2 text-xs text-text-muted"
                  >
                    <Icon
                      name="lucide:shield-check"
                      class="w-3.5 h-3.5"
                    />
                    <span>Fallback: <span class="font-medium text-text-primary">{{ config.provider.fallback ? 'Enabled' : 'Disabled' }}</span></span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <BaseButton
                variant="secondary"
                size="sm"
                @click="showConfigViewer = true"
              >
                View Full Config
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="sm"
                disabled
              >
                <Icon
                  name="lucide:book-open"
                  class="w-4 h-4 mr-1.5"
                />
                View Documentation
              </BaseButton>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-lg border border-border-subtle bg-bg-surface p-3"
        >
          <div class="text-sm text-text-secondary">
            This repository is using Sentinel's default settings.
          </div>
          <div class="mt-1 text-xs text-text-muted">
            To customize behavior, create <span class="font-mono">.sentinel/config.yaml</span> in your repository.
          </div>
          <div class="mt-2 text-xs text-text-muted">
            Last checked: {{ syncedAtLabel }}
          </div>

          <div class="mt-3">
            <BaseButton
              variant="secondary"
              size="sm"
              disabled
            >
              <Icon
                name="lucide:book-open"
                class="w-4 h-4 mr-1.5"
              />
              View Documentation
            </BaseButton>
          </div>
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

  <BaseModal
    :model-value="showConfigViewer"
    title=".sentinel/config.yaml"
    size="lg"
    @update:model-value="showConfigViewer = $event"
  >
    <div
      v-if="configJson"
      class="space-y-2"
    >
      <div class="text-xs text-text-muted">
        Last synced: {{ syncedAtLabel }}
      </div>
      <div class="max-h-[60vh] overflow-auto">
        <BaseCodeBlock
          :code="configJson"
          language="json"
          :max-preview-lines="9999"
        />
      </div>
    </div>

    <div
      v-else
      class="text-sm text-text-muted"
    >
      No configuration found.
    </div>

    <template #footer>
      <div class="flex justify-end">
        <BaseButton
          variant="secondary"
          @click="showConfigViewer = false"
        >
          Close
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

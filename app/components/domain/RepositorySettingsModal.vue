<script setup lang="ts">
import type { Repository, UpdateRepositoryData, AiProvider } from '~/types'
import { AI_PROVIDERS } from '~/types'
import { useSentinelConfig } from '~/composables/useSentinelConfig'
import { useProviderKeys } from '~/composables/useProviderKeys'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'

/**
 * RepositorySettingsModal - Configure repository settings
 */

interface Props {
  modelValue: boolean
  repository: Repository | null
  isUpdating?: boolean
  canManage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isUpdating: false,
  canManage: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: UpdateRepositoryData]
}>()

const toast = useAppToast()
const workspaceStore = useWorkspaceStore()
const workspaceId = computed(() => workspaceStore.currentWorkspaceId)
const repositoryId = computed(() => props.repository?.id ?? null)

// Form state
const autoReviewEnabled = ref(false)
const showConfigViewer = ref(false)

// API Keys state
const showAddKeyForm = ref(false)
const newKeyProvider = ref<AiProvider | ''>('')
const newKeyValue = ref('')
const isSubmittingKey = ref(false)
const showKeyInput = ref(false)
const keyToDelete = ref<number | null>(null)

const { hasConfig, error: configError, hasError, syncedAtLabel, configJson, config } =
  useSentinelConfig(computed(() => props.repository?.settings))

const {
  providerKeys,
  isLoading: isLoadingKeys,
  error: keysError,
  fetchProviderKeys,
  storeProviderKey,
  deleteProviderKey,
  availableProviders,
} = useProviderKeys(workspaceId, repositoryId)

// Initialize form when repository changes
watch(
  () => props.repository,
  (repo) => {
    if (repo) {
      autoReviewEnabled.value = repo.auto_review_enabled
      // Reset API keys form
      showAddKeyForm.value = false
      newKeyProvider.value = ''
      newKeyValue.value = ''
      // Fetch keys
      fetchProviderKeys()
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
      showAddKeyForm.value = false
      keyToDelete.value = null
    } else {
      // Ensure keys are fresh when opening
      if (props.repository) {
        fetchProviderKeys()
      }
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

// Handle Add Key
async function handleAddKey() {
  if (!newKeyProvider.value || !newKeyValue.value) return

  isSubmittingKey.value = true
  try {
    await storeProviderKey(newKeyProvider.value as AiProvider, newKeyValue.value)
    toast.success('Provider key configured successfully')
    showAddKeyForm.value = false
    newKeyProvider.value = ''
    newKeyValue.value = ''
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to save provider key')
  } finally {
    isSubmittingKey.value = false
  }
}

// Handle Delete Key
async function handleDeleteKey() {
  if (!keyToDelete.value) return

  isSubmittingKey.value = true // Reuse submitting state for delete loading
  try {
    await deleteProviderKey(keyToDelete.value)
    toast.success('Provider key deleted successfully')
    keyToDelete.value = null
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete provider key')
  } finally {
    isSubmittingKey.value = false
  }
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
    size="xl"
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

      <!-- API Keys Section -->
      <div class="pt-4 border-t border-border-subtle">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="text-sm font-medium text-text-primary">
              API Keys
            </h4>
            <p class="text-xs text-text-muted mt-0.5">
              Configure AI provider keys for this repository.
            </p>
          </div>
          <BaseButton
            v-if="canManage && !showAddKeyForm"
            variant="secondary"
            size="sm"
            @click="showAddKeyForm = true"
          >
            <Icon
              name="lucide:plus"
              class="w-4 h-4 mr-1.5"
            />
            Add Key
          </BaseButton>
        </div>

        <!-- Add Key Form -->
        <div
          v-if="showAddKeyForm"
          class="mb-4 p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-4"
        >
          <div class="flex items-center justify-between">
            <h5 class="text-sm font-medium text-text-primary">
              Add API Key
            </h5>
            <button
              class="text-text-muted hover:text-text-primary transition-colors"
              @click="showAddKeyForm = false"
            >
              <Icon
                name="lucide:x"
                class="w-4 h-4"
              />
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-text-secondary mb-1.5">Provider</label>
              <div class="relative">
                <select
                  v-model="newKeyProvider"
                  class="w-full h-10 px-3 pr-8 rounded-lg border border-border-input bg-bg-elevated text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select a provider...
                  </option>
                  <option
                    v-for="provider in AI_PROVIDERS"
                    :key="provider.value"
                    :value="provider.value"
                  >
                    {{ provider.label }}
                  </option>
                </select>
                <Icon
                  name="lucide:chevron-down"
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-text-secondary mb-1.5">API Key</label>
              <div class="relative">
                <input
                  v-model="newKeyValue"
                  :type="showKeyInput ? 'text' : 'password'"
                  class="w-full h-10 px-3 pr-10 rounded-lg border border-border-input bg-bg-elevated text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  placeholder="sk-..."
                >
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  @click="showKeyInput = !showKeyInput"
                >
                  <Icon
                    :name="showKeyInput ? 'lucide:eye-off' : 'lucide:eye'"
                    class="w-4 h-4"
                  />
                </button>
              </div>
              <p class="mt-1.5 text-xs text-text-muted">
                Your key is encrypted and will never be displayed again.
              </p>
            </div>

            <div
              v-if="newKeyProvider && providerKeys.some(k => k.provider === newKeyProvider)"
              class="flex gap-2 p-2 rounded bg-warning/10 text-xs text-warning"
            >
              <Icon
                name="lucide:alert-triangle"
                class="w-4 h-4 shrink-0"
              />
              <span>A key for this provider already exists. Saving will replace it.</span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <BaseButton
              variant="secondary"
              size="sm"
              @click="showAddKeyForm = false"
            >
              Cancel
            </BaseButton>
            <BaseButton
              size="sm"
              :loading="isSubmittingKey"
              :disabled="!newKeyProvider || !newKeyValue"
              @click="handleAddKey"
            >
              Save API Key
            </BaseButton>
          </div>
        </div>

        <!-- Keys List -->
        <div
          v-if="isLoadingKeys"
          class="py-4 flex justify-center"
        >
          <Icon
            name="lucide:loader-2"
            class="w-5 h-5 animate-spin text-text-muted"
          />
        </div>

        <div
          v-else-if="providerKeys.length > 0"
          class="space-y-3"
        >
          <div
            v-for="key in providerKeys"
            :key="key.id"
            class="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-bg-surface"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-bg-elevated flex items-center justify-center border border-border-muted">
                <Icon
                  :name="key.provider === 'anthropic' ? 'lucide:brain' : key.provider === 'openai' ? 'lucide:zap' : 'lucide:key'"
                  class="w-4 h-4 text-text-secondary"
                />
              </div>
              <div>
                <div class="text-sm font-medium text-text-primary">
                  {{ key.provider_label }}
                </div>
                <div class="text-xs text-text-muted flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-success" />
                  Configured
                </div>
              </div>
            </div>
            <BaseButton
              v-if="canManage"
              variant="ghost"
              size="sm"
              class="text-text-muted hover:text-error hover:bg-error/5"
              @click="keyToDelete = key.id"
            >
              Delete
            </BaseButton>
          </div>
        </div>

        <div
          v-else-if="!showAddKeyForm"
          class="rounded-lg border border-border-subtle border-dashed p-6 text-center"
        >
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-bg-surface flex items-center justify-center">
            <Icon
              name="lucide:key"
              class="w-5 h-5 text-text-muted"
            />
          </div>
          <p class="text-sm font-medium text-text-primary">
            No API keys configured
          </p>
          <p class="text-xs text-text-muted mt-1">
            Add an API key to enable reviews for this repository.
          </p>
        </div>
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
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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

  <!-- Delete Key Confirmation -->
  <BaseConfirmModal
    :model-value="!!keyToDelete"
    title="Delete API Key?"
    message="Are you sure you want to delete this API key? This will disable automated reviews until a new key is configured."
    variant="danger"
    confirm-label="Delete Key"
    :loading="isSubmittingKey"
    @update:model-value="!$event && (keyToDelete = null)"
    @confirm="handleDeleteKey"
    @cancel="keyToDelete = null"
  />
</template>

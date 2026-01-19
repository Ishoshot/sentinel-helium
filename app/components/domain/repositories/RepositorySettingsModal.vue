<script setup lang="ts">
import type { Repository, UpdateRepositoryData, AiProvider, ProviderKey, AiOption } from '~/types'
import { AI_PROVIDERS } from '~/types'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useAppToast } from '~/composables/shared/useAppToast'
import { useProviderKeys } from '~/composables/integrations/useProviderKeys'
import { useSentinelConfig } from '~/composables/repositories/useSentinelConfig'

/**
 * RepositorySettingsModal - Configure repository settings
 * Premium design with organized sections
 */

interface Props {
  modelValue?: boolean
  repository?: Repository | null
  isUpdating?: boolean
  canManage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  repository: null,
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
const newKeyModelId = ref<number | null>(null)
const isSubmittingKey = ref(false)
const showKeyInput = ref(false)
const keyToDelete = ref<number | null>(null)
const keyToEdit = ref<ProviderKey | null>(null)
const editModelId = ref<number | null>(null)

const hasSelectedProviderKey = computed((): boolean => {
  if (!newKeyProvider.value) return false
  return providerKeys.value.some((key: ProviderKey) => key.provider === newKeyProvider.value)
})

const { hasConfig, error: configError, hasError, syncedAtLabel, configJson, config } =
  useSentinelConfig(computed(() => props.repository?.settings))

const {
  providerKeys,
  aiOptions,
  isLoading: isLoadingKeys,
  isLoadingOptions,
  error: keysError,
  fetchProviderKeys,
  fetchAiOptions,
  storeProviderKey,
  updateProviderKeyModel,
  deleteProviderKey,
  availableProviders,
} = useProviderKeys(workspaceId, repositoryId)

// Provider icons mapping
const providerIcons: Record<string, string> = {
  anthropic: 'lucide:brain',
  openai: 'lucide:zap',
  google: 'lucide:sparkles',
  mistral: 'lucide:wind',
}

// Watch provider selection to fetch AI options
watch(
  () => newKeyProvider.value,
  async (provider) => {
    newKeyModelId.value = null
    if (provider) {
      await fetchAiOptions(provider as AiProvider)
      // Auto-select the default model
      const defaultOption = aiOptions.value.find((opt: AiOption) => opt.is_default)
      if (defaultOption) {
        newKeyModelId.value = defaultOption.id
      }
    }
  }
)

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
      newKeyModelId.value = null
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
    await storeProviderKey(
      newKeyProvider.value as AiProvider,
      newKeyValue.value,
      newKeyModelId.value ?? undefined
    )
    toast.success('Provider key configured successfully')
    showAddKeyForm.value = false
    newKeyProvider.value = ''
    newKeyValue.value = ''
    newKeyModelId.value = null
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

// Handle Edit Key - Start editing
async function handleStartEdit(key: ProviderKey) {
  keyToEdit.value = key
  editModelId.value = key.ai_model?.id ?? null
  // Fetch options for this provider
  await fetchAiOptions(key.provider)
  // If no model was selected, auto-select default
  if (editModelId.value === null) {
    const defaultOption = aiOptions.value.find((opt: AiOption) => opt.is_default)
    if (defaultOption) {
      editModelId.value = defaultOption.id
    }
  }
}

// Handle Save Edit
async function handleSaveEdit() {
  if (!keyToEdit.value) return

  isSubmittingKey.value = true
  try {
    await updateProviderKeyModel(keyToEdit.value.id, editModelId.value)
    toast.success('AI model updated successfully')
    keyToEdit.value = null
    editModelId.value = null
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to update AI model')
  } finally {
    isSubmittingKey.value = false
  }
}

// Handle Cancel Edit
function handleCancelEdit() {
  keyToEdit.value = null
  editModelId.value = null
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
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-accent/10">
          <Icon
            name="lucide:settings-2"
            class="size-5 text-accent"
          />
        </div>
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
      </div>
    </template>

    <div
      v-if="repository"
      class="max-h-[60vh] space-y-6 overflow-y-auto pr-2"
    >
      <!-- Auto-review Section -->
      <div class="rounded-xl border border-border-subtle bg-bg-surface/50 px-6 py-5">
        <div class="flex items-start justify-between gap-6">
          <div class="flex items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
              <Icon
                name="lucide:bot"
                class="size-5 text-accent"
              />
            </div>
            <div>
              <p class="font-medium text-text-primary">
                Automatic Code Reviews
              </p>
              <p class="mt-0.5 text-sm text-text-muted">
                Sentinel will automatically review pull requests when opened
              </p>
            </div>
          </div>
          <button
            type="button"
            class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            :class="autoReviewEnabled ? 'bg-accent' : 'bg-border-muted'"
            role="switch"
            :aria-checked="autoReviewEnabled"
            @click="autoReviewEnabled = !autoReviewEnabled"
          >
            <span
              class="pointer-events-none inline-block size-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="autoReviewEnabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <!-- API Keys Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Icon
                name="lucide:key"
                class="size-5 text-amber-500"
              />
            </div>
            <div>
              <h4 class="font-medium text-text-primary">
                API Keys
              </h4>
              <p class="text-xs text-text-muted">
                Configure AI provider keys for this repository
              </p>
            </div>
          </div>
          <button
            v-if="canManage && !showAddKeyForm"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-text-primary px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-text-secondary"
            @click="showAddKeyForm = true"
          >
            <Icon
              name="lucide:plus"
              class="size-3.5"
            />
            Add Key
          </button>
        </div>

        <!-- Add Key Form -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="showAddKeyForm"
            class="overflow-hidden rounded-xl border border-accent/20 bg-accent/5"
          >
            <div class="border-b border-accent/10 bg-accent/5 px-4 py-3">
              <div class="flex items-center justify-between">
                <h5 class="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <Icon
                    name="lucide:plus-circle"
                    class="size-4 text-accent"
                  />
                  Add New API Key
                </h5>
                <button
                  type="button"
                  class="rounded-lg p-1 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
                  @click="showAddKeyForm = false"
                >
                  <Icon
                    name="lucide:x"
                    class="size-4"
                  />
                </button>
              </div>
            </div>

            <div class="space-y-4 p-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-text-secondary">Provider</label>
                  <div class="relative">
                    <select
                      v-model="newKeyProvider"
                      class="h-10 w-full appearance-none rounded-lg border border-border-subtle bg-bg-elevated px-3 pr-8 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    >
                      <option
                        value=""
                        disabled
                      >
                        Select provider...
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
                      class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                    />
                  </div>
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-text-secondary">API Key</label>
                  <div class="relative">
                    <input
                      v-model="newKeyValue"
                      :type="showKeyInput ? 'text' : 'password'"
                      class="h-10 w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="sk-..."
                    >
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
                      @click="showKeyInput = !showKeyInput"
                    >
                      <Icon
                        :name="showKeyInput ? 'lucide:eye-off' : 'lucide:eye'"
                        class="size-4"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <!-- AI Model Selection -->
              <div v-if="newKeyProvider && aiOptions.length > 0">
                <label class="mb-1.5 block text-xs font-medium text-text-secondary">AI Model</label>
                <div class="relative">
                  <select
                    v-model="newKeyModelId"
                    class="h-10 w-full appearance-none rounded-lg border border-border-subtle bg-bg-elevated px-3 pr-8 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    :disabled="isLoadingOptions"
                  >
                    <option
                      v-for="option in aiOptions"
                      :key="option.id"
                      :value="option.id"
                    >
                      {{ option.name }}{{ option.is_default ? ' (Default)' : '' }}
                    </option>
                  </select>
                  <Icon
                    v-if="isLoadingOptions"
                    name="lucide:loader-2"
                    class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-text-muted"
                  />
                  <Icon
                    v-else
                    name="lucide:chevron-down"
                    class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                  />
                </div>
                <p
                  v-if="aiOptions.find(o => o.id === newKeyModelId)?.description"
                  class="mt-1.5 text-xs text-text-muted"
                >
                  {{ aiOptions.find(o => o.id === newKeyModelId)?.description }}
                </p>
              </div>

              <p class="flex items-start gap-2 text-xs text-text-muted">
                <Icon
                  name="lucide:lock"
                  class="mt-0.5 size-3 shrink-0"
                />
                Your key is encrypted and will never be displayed again.
              </p>

              <div
                v-if="hasSelectedProviderKey"
                class="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning"
              >
                <Icon
                  name="lucide:alert-triangle"
                  class="mt-0.5 size-4 shrink-0"
                />
                <span>A key for this provider already exists. Saving will replace it.</span>
              </div>

              <div class="flex justify-end gap-2 border-t border-border-subtle pt-4">
                <button
                  type="button"
                  class="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface"
                  @click="showAddKeyForm = false"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!newKeyProvider || !newKeyValue || isSubmittingKey"
                  @click="handleAddKey"
                >
                  <Icon
                    v-if="isSubmittingKey"
                    name="lucide:loader-2"
                    class="size-4 animate-spin"
                  />
                  <Icon
                    v-else
                    name="lucide:check"
                    class="size-4"
                  />
                  {{ isSubmittingKey ? 'Saving...' : 'Save Key' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Keys List -->
        <div
          v-if="isLoadingKeys"
          class="flex justify-center py-8"
        >
          <Icon
            name="lucide:loader-2"
            class="size-6 animate-spin text-text-muted"
          />
        </div>

        <div
          v-else-if="providerKeys.length > 0"
          class="space-y-2"
        >
          <div
            v-for="key in providerKeys"
            :key="key.id"
            class="group rounded-xl border border-border-subtle bg-bg-elevated px-5 py-4 transition-colors hover:border-border-muted"
          >
            <!-- Edit Mode -->
            <div
              v-if="keyToEdit?.id === key.id"
              class="space-y-4"
            >
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-lg bg-bg-surface">
                  <Icon
                    :name="providerIcons[key.provider] ?? 'lucide:key'"
                    class="size-5 text-text-secondary"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-text-primary">
                    {{ key.provider_label }}
                  </p>
                  <p class="text-xs text-text-muted">
                    Change AI model
                  </p>
                </div>
              </div>

              <div>
                <label class="mb-1.5 block text-xs font-medium text-text-secondary">AI Model</label>
                <div class="relative">
                  <select
                    v-model="editModelId"
                    class="h-10 w-full appearance-none rounded-lg border border-border-subtle bg-bg-surface px-3 pr-8 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    :disabled="isLoadingOptions"
                  >
                    <option
                      v-for="option in aiOptions"
                      :key="option.id"
                      :value="option.id"
                    >
                      {{ option.name }}{{ option.is_default ? ' (Default)' : '' }}
                    </option>
                  </select>
                  <Icon
                    v-if="isLoadingOptions"
                    name="lucide:loader-2"
                    class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-text-muted"
                  />
                  <Icon
                    v-else
                    name="lucide:chevron-down"
                    class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                  />
                </div>
                <p
                  v-if="aiOptions.find(o => o.id === editModelId)?.description"
                  class="mt-1.5 text-xs text-text-muted"
                >
                  {{ aiOptions.find(o => o.id === editModelId)?.description }}
                </p>
              </div>

              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-surface"
                  @click="handleCancelEdit"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="isSubmittingKey"
                  @click="handleSaveEdit"
                >
                  <Icon
                    v-if="isSubmittingKey"
                    name="lucide:loader-2"
                    class="size-3.5 animate-spin"
                  />
                  <Icon
                    v-else
                    name="lucide:check"
                    class="size-3.5"
                  />
                  Save
                </button>
              </div>
            </div>

            <!-- View Mode -->
            <div
              v-else
              class="flex items-center justify-between gap-6"
            >
              <div class="flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-lg bg-bg-surface">
                  <Icon
                    :name="providerIcons[key.provider] ?? 'lucide:key'"
                    class="size-5 text-text-secondary"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-text-primary">
                    {{ key.provider_label }}
                  </p>
                  <div class="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                    <span class="flex size-1.5 rounded-full bg-success" />
                    <span v-if="key.ai_model">{{ key.ai_model.name }}</span>
                    <span v-else>Default model</span>
                  </div>
                </div>
              </div>
              <div
                v-if="canManage"
                class="flex items-center gap-2"
              >
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
                  @click="handleStartEdit(key)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                  @click="keyToDelete = key.id"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="!showAddKeyForm"
          class="flex flex-col items-center rounded-xl border border-dashed border-border-subtle p-8 text-center"
        >
          <div class="mb-3 flex size-12 items-center justify-center rounded-full bg-bg-surface">
            <Icon
              name="lucide:key"
              class="size-6 text-text-muted"
            />
          </div>
          <p class="text-sm font-medium text-text-primary">
            No API keys configured
          </p>
          <p class="mt-1 text-xs text-text-muted">
            Add an API key to enable reviews for this repository
          </p>
        </div>
      </div>

      <!-- Sentinel Configuration Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <div class="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
            <Icon
              name="lucide:file-code"
              class="size-5 text-violet-500"
            />
          </div>
          <div>
            <h4 class="font-medium text-text-primary">
              Sentinel Configuration
            </h4>
            <p class="text-xs text-text-muted">
              Repository-specific review settings
            </p>
          </div>
        </div>

        <!-- Config Error -->
        <div
          v-if="hasError"
          class="rounded-xl border border-warning/20 bg-warning/5 px-5 py-4"
        >
          <div class="flex items-start gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning/10">
              <Icon
                name="lucide:alert-triangle"
                class="size-4 text-warning"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-text-primary">
                Configuration Error
              </p>
              <p class="mt-1 whitespace-pre-line text-sm text-text-secondary">
                {{ configError }}
              </p>
              <p class="mt-2 text-xs text-text-muted">
                Reviews are skipped until this is fixed.
              </p>
              <p class="text-xs text-text-muted">
                Last sync: {{ syncedAtLabel }}
              </p>
            </div>
          </div>
        </div>

        <!-- Config Active -->
        <div
          v-else-if="hasConfig"
          class="rounded-xl border border-border-subtle bg-bg-surface/50 px-5 py-4"
        >
          <div class="flex items-start justify-between gap-6">
            <div class="flex items-start gap-4">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                <Icon
                  name="lucide:check-circle"
                  class="size-4 text-success"
                />
              </div>
              <div>
                <p class="text-sm font-medium text-text-primary">
                  Configuration Active
                </p>
                <p class="text-xs text-text-muted">
                  Last synced: {{ syncedAtLabel }}
                </p>

                <!-- AI Provider Info -->
                <div
                  v-if="config?.provider"
                  class="mt-3 space-y-1.5 border-t border-border-subtle pt-3"
                >
                  <p class="text-xs font-medium text-text-secondary">
                    AI Provider Settings
                  </p>
                  <div
                    v-if="config.provider.preferred"
                    class="flex items-center gap-2 text-xs text-text-muted"
                  >
                    <Icon
                      name="lucide:bot"
                      class="size-3.5"
                    />
                    Provider: <span class="font-medium text-text-primary">{{ config.provider.preferred }}</span>
                  </div>
                  <div
                    v-if="config.provider.model"
                    class="flex items-center gap-2 text-xs text-text-muted"
                  >
                    <Icon
                      name="lucide:cpu"
                      class="size-3.5"
                    />
                    Model: <span class="font-medium text-text-primary">{{ config.provider.model }}</span>
                  </div>
                  <div
                    v-if="config.provider.fallback !== undefined"
                    class="flex items-center gap-2 text-xs text-text-muted"
                  >
                    <Icon
                      name="lucide:shield-check"
                      class="size-3.5"
                    />
                    Fallback: <span class="font-medium text-text-primary">{{ config.provider.fallback ? 'Enabled' : 'Disabled' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-bg-surface"
              @click="showConfigViewer = true"
            >
              View Config
            </button>
          </div>
        </div>

        <!-- No Config -->
        <div
          v-else
          class="rounded-xl border border-border-subtle bg-bg-surface/50 px-5 py-4"
        >
          <div class="flex items-start gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-surface">
              <Icon
                name="lucide:file-question"
                class="size-4 text-text-muted"
              />
            </div>
            <div>
              <p class="text-sm text-text-secondary">
                Using Sentinel's default settings
              </p>
              <p class="mt-1 text-xs text-text-muted">
                Create <code class="rounded bg-bg-surface px-1.5 py-0.5 font-mono text-[10px]">.sentinel/config.yaml</code> to customize.
              </p>
              <p class="mt-1 text-xs text-text-muted">
                Last checked: {{ syncedAtLabel }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <p
          v-if="!canManage"
          class="text-xs text-text-muted"
        >
          You need admin permissions to modify settings.
        </p>
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton
            variant="secondary"
            @click="close"
          >
            Cancel
          </BaseButton>
          <BaseButton
            :loading="isUpdating"
            :disabled="!hasChanges || !canManage"
            @click="handleSave"
          >
            <Icon
              name="lucide:check"
              class="size-4"
            />
            Save Changes
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>

  <!-- Config Viewer Modal -->
  <BaseModal
    :model-value="showConfigViewer"
    title=".sentinel/config.yaml"
    size="lg"
    @update:model-value="showConfigViewer = $event"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-violet-500/10">
          <Icon
            name="lucide:file-code"
            class="size-5 text-violet-500"
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-text-primary">
            .sentinel/config.yaml
          </h2>
          <p class="text-xs text-text-muted">
            Last synced: {{ syncedAtLabel }}
          </p>
        </div>
      </div>
    </template>

    <div
      v-if="configJson"
      class="max-h-[60vh] overflow-auto rounded-xl border border-border-subtle"
    >
      <BaseCodeBlock
        :code="configJson"
        language="json"
        :max-preview-lines="9999"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center py-12 text-center"
    >
      <Icon
        name="lucide:file-x"
        class="mb-3 size-8 text-text-muted"
      />
      <p class="text-sm text-text-muted">
        No configuration found.
      </p>
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

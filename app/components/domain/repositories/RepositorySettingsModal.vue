<script setup lang="ts">
import type { Repository, UpdateRepositoryData, AiProvider, ProviderKey, AiOption } from '~/types'
import { AI_PROVIDERS } from '~/types'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useAppToast } from '~/composables/shared/useAppToast'
import { useProviderKeys } from '~/composables/integrations/useProviderKeys'
import { useSentinelConfig } from '~/composables/repositories/useSentinelConfig'
import { useGitHub } from '~/composables/integrations/useGitHub'

/**
 * RepositorySettingsModal - Premium repository configuration
 * Sleek, modern design with organized sections and smooth interactions
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

const { createConfigPr, isCreatingConfigPr } = useGitHub(workspaceId)

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

const providerIcons: Record<string, string> = {
  anthropic: 'lucide:brain',
  openai: 'lucide:zap',
  google: 'lucide:sparkles',
  mistral: 'lucide:wind',
}

const providerColors: Record<string, { bg: string; text: string; border: string }> = {
  anthropic: { bg: 'bg-bg-surface', text: 'text-text-secondary', border: 'border-border-subtle' },
  openai: { bg: 'bg-bg-surface', text: 'text-text-secondary', border: 'border-border-subtle' },
  google: { bg: 'bg-bg-surface', text: 'text-text-secondary', border: 'border-border-subtle' },
  mistral: { bg: 'bg-bg-surface', text: 'text-text-secondary', border: 'border-border-subtle' },
}

watch(
  () => newKeyProvider.value,
  async (provider) => {
    newKeyModelId.value = null
    if (provider) {
      await fetchAiOptions(provider as AiProvider)
      const defaultOption = aiOptions.value.find((opt: AiOption) => opt.is_default)
      if (defaultOption) {
        newKeyModelId.value = defaultOption.id
      }
    }
  }
)

watch(
  () => props.repository,
  (repo) => {
    if (repo) {
      autoReviewEnabled.value = repo.auto_review_enabled
      showAddKeyForm.value = false
      newKeyProvider.value = ''
      newKeyValue.value = ''
      newKeyModelId.value = null
      fetchProviderKeys()
    }
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      autoReviewEnabled.value = props.repository?.auto_review_enabled ?? false
      showConfigViewer.value = false
      showAddKeyForm.value = false
      keyToDelete.value = null
    } else {
      if (props.repository) {
        fetchProviderKeys()
      }
    }
  }
)

const hasChanges = computed(() => {
  if (!props.repository) return false
  return autoReviewEnabled.value !== props.repository.auto_review_enabled
})

function handleSave() {
  const data: UpdateRepositoryData = {
    auto_review_enabled: autoReviewEnabled.value,
  }
  emit('save', data)
}

async function handleAddKey() {
  if (!newKeyProvider.value || !newKeyValue.value) return

  isSubmittingKey.value = true
  try {
    await storeProviderKey(
      newKeyProvider.value as AiProvider,
      newKeyValue.value,
      newKeyModelId.value ?? undefined
    )
    toast.success('API key configured')
    showAddKeyForm.value = false
    newKeyProvider.value = ''
    newKeyValue.value = ''
    newKeyModelId.value = null
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to save')
  } finally {
    isSubmittingKey.value = false
  }
}

async function handleDeleteKey() {
  if (!keyToDelete.value) return

  isSubmittingKey.value = true
  try {
    await deleteProviderKey(keyToDelete.value)
    toast.success('API key deleted')
    keyToDelete.value = null
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete')
  } finally {
    isSubmittingKey.value = false
  }
}

async function handleStartEdit(key: ProviderKey) {
  keyToEdit.value = key
  editModelId.value = key.ai_model?.id ?? null
  await fetchAiOptions(key.provider)
  if (editModelId.value === null) {
    const defaultOption = aiOptions.value.find((opt: AiOption) => opt.is_default)
    if (defaultOption) {
      editModelId.value = defaultOption.id
    }
  }
}

async function handleSaveEdit() {
  if (!keyToEdit.value) return

  isSubmittingKey.value = true
  try {
    await updateProviderKeyModel(keyToEdit.value.id, editModelId.value)
    toast.success('Model updated')
    keyToEdit.value = null
    editModelId.value = null
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to update')
  } finally {
    isSubmittingKey.value = false
  }
}

function handleCancelEdit() {
  keyToEdit.value = null
  editModelId.value = null
}

function close() {
  emit('update:modelValue', false)
}

function getProviderColor(provider: string) {
  return providerColors[provider] || { bg: 'bg-bg-surface', text: 'text-text-secondary', border: 'border-border-subtle' }
}

async function handleCreateConfigPr() {
  if (!props.repository) return

  try {
    const response = await createConfigPr(props.repository.id)
    if (response?.status === 'ready' && response.compare_url) {
      window.open(response.compare_url, '_blank', 'noopener,noreferrer')
      toast.success('Config branch ready - create your PR on GitHub')
    } else if (response?.status === 'skipped') {
      toast.info(response.message ?? 'Skipped')
    } else if (response?.status === 'error') {
      toast.error(response.message ?? 'An error occurred')
    }
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to prepare config branch')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="close"
        />

        <!-- Modal -->
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-4 scale-95"
        >
          <div
            v-if="modelValue"
            class="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-bg-elevated shadow-2xl"
          >
            <!-- Header -->
            <div class="relative border-b border-border-subtle px-6 py-5">
              <div class="flex items-center gap-4">
                <div class="flex size-12 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface">
                  <Icon
                    name="lucide:folder-git-2"
                    class="size-6 text-text-secondary"
                  />
                </div>
                <div class="flex-1">
                  <h2 class="text-lg font-semibold text-text-primary">
                    Repository Settings
                  </h2>
                  <p
                    v-if="repository"
                    class="mt-0.5 text-sm text-text-muted"
                  >
                    {{ repository.full_name }}
                  </p>
                </div>
                <button
                  class="flex size-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
                  @click="close"
                >
                  <Icon
                    name="lucide:x"
                    class="size-5"
                  />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div
              v-if="repository"
              class="max-h-[65vh] space-y-6 overflow-y-auto p-6"
            >
              <!-- Auto-review Section -->
              <div class="rounded-xl border border-border-subtle bg-bg-elevated p-5">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div class="flex size-11 items-center justify-center rounded-xl bg-bg-surface">
                      <Icon
                        :name="autoReviewEnabled ? 'lucide:zap' : 'lucide:zap-off'"
                        class="size-5"
                        :class="autoReviewEnabled ? 'text-text-secondary' : 'text-text-muted'"
                      />
                    </div>
                    <div>
                      <p class="font-semibold text-text-primary">
                        Automatic Reviews
                      </p>
                      <p class="mt-0.5 text-sm text-text-muted">
                        Review PRs automatically when opened
                      </p>
                    </div>
                  </div>

                  <!-- Toggle Switch -->
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="autoReviewEnabled"
                    class="relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated"
                    :class="autoReviewEnabled ? 'bg-accent' : 'bg-bg-surface'"
                    @click="autoReviewEnabled = !autoReviewEnabled"
                  >
                    <span
                      class="absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow-md transition-transform duration-200"
                      :class="autoReviewEnabled ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>

              <!-- API Keys Section -->
              <div class="space-y-4 py-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="flex size-9 items-center justify-center rounded-lg bg-bg-surface">
                      <Icon
                        name="lucide:key"
                        class="size-4 text-text-muted"
                      />
                    </div>
                    <div>
                      <p class="font-semibold text-text-primary">
                        API Keys
                      </p>
                      <p class="text-xs text-text-muted">
                        Bring your own provider keys
                      </p>
                    </div>
                  </div>
                  <BaseButton
                    v-if="canManage && !showAddKeyForm"
                    variant="secondary"
                    size="sm"
                    class="whitespace-nowrap"
                    @click="showAddKeyForm = true"
                  >
                    <Icon
                      name="lucide:plus"
                      class="size-3.5"
                    />
                    Add Key
                  </BaseButton>
                </div>

                <!-- Add Key Form -->
                <Transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-2"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0 -translate-y-2"
                >
                  <div
                    v-if="showAddKeyForm"
                    class="overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated"
                  >
                    <div class="border-b border-border-subtle px-4 py-3">
                      <div class="flex items-center justify-between">
                        <h5 class="flex items-center gap-2 text-sm font-medium text-text-primary">
                          <Icon
                            name="lucide:plus-circle"
                            class="size-4 text-text-muted"
                          />
                          New API Key
                        </h5>
                        <button
                          type="button"
                          class="rounded-md p-1 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
                          @click="showAddKeyForm = false"
                        >
                          <Icon
                            name="lucide:x"
                            class="size-4"
                          />
                        </button>
                      </div>
                    </div>

                    <div class="space-y-4 bg-bg-surface p-4">
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-text-secondary">Provider</label>
                          <div class="relative">
                            <select
                              v-model="newKeyProvider"
                              class="h-11 w-full appearance-none rounded-lg border border-border-subtle bg-bg-elevated px-3 pr-10 text-sm text-text-primary transition-all duration-200 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(20,184,166,0.15)]"
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
                              class="h-11 w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 pr-10 font-mono text-sm text-text-primary transition-all duration-200 placeholder:text-text-muted focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(20,184,166,0.15)]"
                              placeholder="sk-..."
                            >
                            <button
                              type="button"
                              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-secondary"
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

                      <!-- Model Selection -->
                      <div v-if="newKeyProvider && aiOptions.length > 0">
                        <label class="mb-1.5 block text-xs font-medium text-text-secondary">AI Model</label>
                        <div class="relative">
                          <select
                            v-model="newKeyModelId"
                            class="h-11 w-full appearance-none rounded-lg border border-border-subtle bg-bg-elevated px-3 pr-10 text-sm text-text-primary transition-all duration-200 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(20,184,166,0.15)]"
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
                      </div>

                      <div class="flex items-center gap-2 text-xs text-text-muted">
                        <Icon
                          name="lucide:shield-check"
                          class="size-3.5 text-text-muted"
                        />
                        <span>Encrypted at rest. Never displayed again.</span>
                      </div>

                      <div
                        v-if="hasSelectedProviderKey"
                        class="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-400"
                      >
                        <Icon
                          name="lucide:alert-triangle"
                          class="mt-0.5 size-4 shrink-0"
                        />
                        <span>This will replace your existing {{ AI_PROVIDERS.find(p => p.value === newKeyProvider)?.label }} key.</span>
                      </div>

                      <div class="flex justify-end gap-2 border-t border-border-subtle pt-4">
                        <BaseButton
                          variant="secondary"
                          @click="showAddKeyForm = false"
                        >
                          Cancel
                        </BaseButton>
                        <BaseButton
                          variant="primary"
                          :loading="isSubmittingKey"
                          :disabled="!newKeyProvider || !newKeyValue || isSubmittingKey"
                          @click="handleAddKey"
                        >
                          Save Key
                        </BaseButton>
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
                    class="group overflow-hidden rounded-xl border transition-all duration-200"
                    :class="keyToEdit?.id === key.id ? 'border-border-muted bg-bg-surface' : 'border-border-subtle bg-bg-elevated hover:border-border-muted'"
                  >
                    <!-- Edit Mode -->
                    <div
                      v-if="keyToEdit?.id === key.id"
                      class="p-4"
                    >
                      <div class="mb-4 flex items-center gap-3">
                        <div
                          class="flex size-10 items-center justify-center rounded-lg border"
                          :class="[getProviderColor(key.provider).bg, getProviderColor(key.provider).border]"
                        >
                          <Icon
                            :name="providerIcons[key.provider] ?? 'lucide:key'"
                            class="size-5"
                            :class="getProviderColor(key.provider).text"
                          />
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-text-primary">
                            {{ key.provider_label }}
                          </p>
                          <p class="text-xs text-text-muted">
                            Select AI model
                          </p>
                        </div>
                      </div>

                      <div class="relative mb-4">
                        <select
                          v-model="editModelId"
                          class="h-11 w-full appearance-none rounded-lg border border-border-subtle bg-bg-elevated px-3 pr-10 text-sm text-text-primary transition-all duration-200 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(20,184,166,0.15)]"
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

                      <div class="flex justify-end gap-2">
                        <BaseButton
                          variant="secondary"
                          size="sm"
                          @click="handleCancelEdit"
                        >
                          Cancel
                        </BaseButton>
                        <BaseButton
                          variant="primary"
                          size="sm"
                          :loading="isSubmittingKey"
                          :disabled="isSubmittingKey"
                          @click="handleSaveEdit"
                        >
                          Save
                        </BaseButton>
                      </div>
                    </div>

                    <!-- View Mode -->
                    <div
                      v-else
                      class="flex items-center justify-between p-4"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="flex size-10 items-center justify-center rounded-lg border"
                          :class="[getProviderColor(key.provider).bg, getProviderColor(key.provider).border]"
                        >
                          <Icon
                            :name="providerIcons[key.provider] ?? 'lucide:key'"
                            class="size-5"
                            :class="getProviderColor(key.provider).text"
                          />
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-text-primary">
                            {{ key.provider_label }}
                          </p>
                          <div class="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                            <span class="flex size-1.5 rounded-full bg-emerald-500" />
                            <span class="font-mono">{{ key.ai_model?.name || 'Default model' }}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="canManage"
                        class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <button
                          type="button"
                          class="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
                          title="Edit"
                          @click="handleStartEdit(key)"
                        >
                          <Icon
                            name="lucide:pencil"
                            class="size-4"
                          />
                        </button>
                        <button
                          type="button"
                          class="rounded-lg p-2 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Delete"
                          @click="keyToDelete = key.id"
                        >
                          <Icon
                            name="lucide:trash-2"
                            class="size-4"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div
                  v-else-if="!showAddKeyForm"
                  class="rounded-xl border-2 border-dashed border-border-subtle p-8 text-center"
                >
                  <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-bg-surface">
                    <Icon
                      name="lucide:key"
                      class="size-5 text-text-muted"
                    />
                  </div>
                  <p class="text-sm font-medium text-text-primary">
                    No API keys configured
                  </p>
                  <p class="mt-1 text-xs text-text-muted">
                    Add your own key to enable reviews
                  </p>
                </div>
              </div>

              <!-- Configuration Section -->
              <div class="space-y-4 py-2">
                <div class="flex items-center gap-3">
                  <div class="flex size-9 items-center justify-center rounded-lg bg-bg-surface">
                    <Icon
                      name="lucide:file-code"
                      class="size-4 text-text-muted"
                    />
                  </div>
                  <div>
                    <p class="font-semibold text-text-primary">
                      Configuration
                    </p>
                    <p class="text-xs text-text-muted">
                      .sentinel/config.yaml
                    </p>
                  </div>
                </div>

                <!-- Config Error -->
                <div
                  v-if="hasError"
                  class="rounded-xl border border-red-500/20 bg-red-500/10 p-4"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                      <Icon
                        name="lucide:alert-circle"
                        class="size-4 text-red-400"
                      />
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-red-400">
                        Configuration Error
                      </p>
                      <p class="mt-1 whitespace-pre-line text-xs text-red-400/80">
                        {{ configError }}
                      </p>
                      <p class="mt-2 text-xs text-red-400/60">
                        Last sync: {{ syncedAtLabel }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Config Active -->
                <div
                  v-else-if="hasConfig"
                  class="rounded-xl border border-border-subtle bg-bg-elevated p-4"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-3">
                      <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-surface">
                        <Icon
                          name="lucide:check"
                          class="size-4 text-text-secondary"
                        />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-text-primary">
                          Configuration Active
                        </p>
                        <p class="text-xs text-text-muted">
                          Synced {{ syncedAtLabel }}
                        </p>

                        <div
                          v-if="config?.provider"
                          class="mt-3 flex flex-wrap gap-2"
                        >
                          <span
                            v-if="config.provider.preferred"
                            class="inline-flex items-center gap-1 rounded-md bg-bg-surface px-2 py-1 text-xs text-text-secondary"
                          >
                            <Icon
                              name="lucide:bot"
                              class="size-3"
                            />
                            {{ config.provider.preferred }}
                          </span>
                          <span
                            v-if="config.provider.model"
                            class="inline-flex items-center gap-1 rounded-md bg-bg-surface px-2 py-1 font-mono text-xs text-text-secondary"
                          >
                            {{ config.provider.model }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <BaseButton
                      variant="secondary"
                      size="sm"
                      class="shrink-0 whitespace-nowrap"
                      @click="showConfigViewer = true"
                    >
                      View
                    </BaseButton>
                  </div>
                </div>

                <!-- No Config -->
                <div
                  v-else
                  class="rounded-xl border border-border-subtle bg-bg-surface p-4"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-start gap-3">
                      <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-hover">
                        <Icon
                          name="lucide:file-question"
                          class="size-4 text-text-muted"
                        />
                      </div>
                      <div>
                        <p class="text-sm text-text-secondary">
                          Using default settings
                        </p>
                        <p class="mt-1 text-xs text-text-muted">
                          Create <code class="rounded bg-bg-hover px-1.5 py-0.5 font-mono text-[10px]">.sentinel/config.yaml</code> to customize
                        </p>
                      </div>
                    </div>
                    <BaseButton
                      v-if="canManage"
                      variant="primary"
                      size="sm"
                      class="shrink-0 whitespace-nowrap"
                      :loading="isCreatingConfigPr"
                      :disabled="isCreatingConfigPr"
                      @click="handleCreateConfigPr"
                    >
                      <Icon
                        v-if="!isCreatingConfigPr"
                        name="lucide:git-pull-request"
                        class="size-3.5"
                      />
                      Create Config PR
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-4 border-t border-border-subtle bg-bg-surface px-6 py-4">
              <p
                v-if="!canManage"
                class="text-xs text-text-muted"
              >
                Admin permissions required
              </p>
              <div
                v-else
                class="flex-1"
              />
              <div class="flex items-center gap-3">
                <BaseButton
                  variant="secondary"
                  class="whitespace-nowrap"
                  @click="close"
                >
                  Cancel
                </BaseButton>
                <BaseButton
                  variant="primary"
                  class="whitespace-nowrap"
                  :loading="isUpdating"
                  :disabled="!hasChanges || !canManage || isUpdating"
                  @click="handleSave"
                >
                  <Icon
                    v-if="!isUpdating"
                    name="lucide:check"
                    class="size-4"
                  />
                  Save Changes
                </BaseButton>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- Config Viewer Modal -->
  <BaseModal
    :model-value="showConfigViewer"
    title="Configuration"
    size="lg"
    @update:model-value="showConfigViewer = $event"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface">
          <Icon
            name="lucide:file-code"
            class="size-5 text-text-secondary"
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
        No configuration found
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

  <!-- Delete Confirmation -->
  <BaseConfirmModal
    :model-value="!!keyToDelete"
    title="Delete API Key?"
    message="This will disable automated reviews until a new key is configured."
    variant="danger"
    confirm-label="Delete"
    :loading="isSubmittingKey"
    @update:model-value="!$event && (keyToDelete = null)"
    @confirm="handleDeleteKey"
    @cancel="keyToDelete = null"
  />
</template>

<script setup lang="ts">
import type { AiProvider, ProviderKey } from '~/types'
import { AI_PROVIDERS } from '~/types'
import { useWorkspaceProviderKeys } from '~/composables/integrations/useWorkspaceProviderKeys'
import { useAppToast } from '~/composables/shared/useAppToast'

/**
 * WorkspaceApiKeys - Workspace-level BYOK key management
 * Allows users to add API keys that unlock unlimited briefing generations
 */

interface Props {
  workspaceId: number | null
  canManage: boolean
}

const props = defineProps<Props>()

const toast = useAppToast()
const wId = computed(() => props.workspaceId)

const {
  providerKeys,
  isLoading,
  error,
  fetchProviderKeys,
  storeProviderKey,
  deleteProviderKey,
  hasAnyKey,
  availableProviders,
} = useWorkspaceProviderKeys(wId)

const showAddForm = ref(false)
const newProvider = ref<AiProvider | ''>('')
const newKeyValue = ref('')
const showKeyInput = ref(false)
const isSubmitting = ref(false)
const keyToDelete = ref<number | null>(null)

const hasSelectedProviderKey = computed((): boolean => {
  if (!newProvider.value) return false
  return providerKeys.value.some((key: ProviderKey) => key.provider === newProvider.value)
})

const providerIcons: Record<string, string> = {
  anthropic: 'lucide:brain',
  openai: 'lucide:zap',
}

onMounted(() => {
  if (props.workspaceId) {
    fetchProviderKeys()
  }
})

watch(() => props.workspaceId, (id) => {
  if (id) {
    fetchProviderKeys()
  }
})

async function handleAddKey() {
  if (!newProvider.value || !newKeyValue.value) return

  isSubmitting.value = true
  try {
    await storeProviderKey(newProvider.value as AiProvider, newKeyValue.value)
    toast.success('Workspace API key configured')
    showAddForm.value = false
    newProvider.value = ''
    newKeyValue.value = ''
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to save')
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeleteKey() {
  if (!keyToDelete.value) return

  isSubmitting.value = true
  try {
    await deleteProviderKey(keyToDelete.value)
    toast.success('Workspace API key deleted')
    keyToDelete.value = null
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Failed to delete')
  } finally {
    isSubmitting.value = false
  }
}

function handleCancelAdd() {
  showAddForm.value = false
  newProvider.value = ''
  newKeyValue.value = ''
  showKeyInput.value = false
}
</script>

<template>
  <section class="rounded-2xl border border-border-subtle bg-bg-elevated">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border-subtle px-6 py-5">
      <div class="flex items-center gap-4">
        <div class="flex size-11 items-center justify-center rounded-xl bg-bg-surface">
          <Icon
            name="lucide:building-2"
            class="size-5 text-text-muted"
          />
        </div>
        <div>
          <h2 class="text-base font-semibold text-text-primary">
            Workspace API Keys
          </h2>
          <p class="mt-0.5 text-xs text-text-muted">
            Keys used for briefings and workspace-level AI features
          </p>
        </div>
      </div>
      <BaseButton
        v-if="canManage && !showAddForm"
        variant="secondary"
        size="sm"
        @click="showAddForm = true"
      >
        <Icon
          name="lucide:plus"
          class="size-3.5"
        />
        Add Key
      </BaseButton>
    </div>

    <div class="p-6">
      <!-- Benefit banner (only when no keys) -->
      <div
        v-if="!hasAnyKey && !isLoading"
        class="mb-5 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4"
      >
        <Icon
          name="lucide:sparkles"
          class="mt-0.5 size-5 shrink-0 text-accent"
        />
        <div>
          <p class="text-sm font-medium text-text-primary">
            Unlock unlimited briefings
          </p>
          <p class="mt-0.5 text-xs text-text-muted">
            Add your own API key to generate unlimited briefing reports. Without a key, you get a small free allowance using our platform keys.
          </p>
        </div>
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
          v-if="showAddForm"
          class="mb-5 overflow-hidden rounded-xl border border-border-subtle"
        >
          <div class="border-b border-border-subtle px-4 py-3">
            <div class="flex items-center justify-between">
              <h5 class="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Icon
                  name="lucide:plus-circle"
                  class="size-4 text-text-muted"
                />
                New Workspace Key
              </h5>
              <button
                type="button"
                class="rounded-md p-1 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
                @click="handleCancelAdd"
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
                    v-model="newProvider"
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
              <span>This will replace your existing {{ AI_PROVIDERS.find(p => p.value === newProvider)?.label }} key.</span>
            </div>

            <div class="flex justify-end gap-2 border-t border-border-subtle pt-4">
              <BaseButton
                variant="secondary"
                @click="handleCancelAdd"
              >
                Cancel
              </BaseButton>
              <BaseButton
                variant="primary"
                :loading="isSubmitting"
                :disabled="!newProvider || !newKeyValue || isSubmitting"
                @click="handleAddKey"
              >
                Save Key
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Loading -->
      <div
        v-if="isLoading"
        class="flex justify-center py-8"
      >
        <Icon
          name="lucide:loader-2"
          class="size-6 animate-spin text-text-muted"
        />
      </div>

      <!-- Keys List -->
      <div
        v-else-if="providerKeys.length > 0"
        class="space-y-2"
      >
        <div
          v-for="key in providerKeys"
          :key="key.id"
          class="group flex items-center justify-between rounded-xl border border-border-subtle bg-bg-elevated p-4 transition-all duration-200 hover:border-border-muted"
        >
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface">
              <Icon
                :name="providerIcons[key.provider] ?? 'lucide:key'"
                class="size-5 text-text-secondary"
              />
            </div>
            <div>
              <p class="text-sm font-semibold text-text-primary">
                {{ key.provider_label }}
              </p>
              <div class="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                <span class="flex size-1.5 rounded-full bg-emerald-500" />
                <span>Configured</span>
              </div>
            </div>
          </div>
          <button
            v-if="canManage"
            type="button"
            class="rounded-lg p-2 text-text-muted opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
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

      <!-- Empty State -->
      <div
        v-else-if="!showAddForm && !isLoading"
        class="rounded-xl border-2 border-dashed border-border-subtle p-8 text-center"
      >
        <div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-bg-surface">
          <Icon
            name="lucide:key"
            class="size-5 text-text-muted"
          />
        </div>
        <p class="text-sm font-medium text-text-primary">
          No workspace API keys
        </p>
        <p class="mt-1 text-xs text-text-muted">
          Add a key to unlock unlimited briefings
        </p>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <BaseConfirmModal
      :model-value="!!keyToDelete"
      title="Delete Workspace API Key?"
      message="Removing this key will limit briefing generations to the free allowance until a new key is added."
      variant="danger"
      confirm-label="Delete"
      :loading="isSubmitting"
      @update:model-value="!$event && (keyToDelete = null)"
      @confirm="handleDeleteKey"
      @cancel="keyToDelete = null"
    />
  </section>
</template>

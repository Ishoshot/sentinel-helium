<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useWorkspaces } from '~/composables/workspace/useWorkspaces'

/**
 * WorkspaceSwitcher - Workspace selection dropdown
 * Domain component for switching between workspaces
 */

const workspaceStore = useWorkspaceStore()
const { workspaces, switchWorkspace, createWorkspace, isLoading, error: apiError } = useWorkspaces()
const router = useRouter()

const isOpen = ref(false)
const showCreateModal = ref(false)
const newWorkspaceName = ref('')
const createError = ref('')

// Current workspace
const currentWorkspace = computed(() => workspaceStore.currentWorkspace)

// Toggle dropdown
function toggle() {
  isOpen.value = !isOpen.value
}

// Switch to a workspace
async function handleSwitch(workspaceId: number) {
  isOpen.value = false
  const workspace = await switchWorkspace(workspaceId)
  if (workspace) {
    router.push(`/${workspace.slug}`)
  }
}

// Open create modal
function openCreateModal() {
  isOpen.value = false
  showCreateModal.value = true
  newWorkspaceName.value = ''
  createError.value = ''
}

// Create new workspace
async function handleCreate() {
  if (!newWorkspaceName.value.trim()) {
    createError.value = 'Name is required'
    return
  }

  createError.value = ''
  const workspace = await createWorkspace({ name: newWorkspaceName.value.trim() })
  if (workspace) {
    showCreateModal.value = false
    router.push(`/${workspace.slug}`)
  }
  else {
    // Use the error message from the API
    createError.value = apiError.value || 'Failed to create workspace'
  }
}

// Close dropdown when clicking outside
const dropdownRef = ref<HTMLElement | null>(null)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative"
  >
    <!-- Trigger button -->
    <button
      class="group flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-text-primary hover:bg-bg-surface rounded-lg transition-all duration-200"
      @click="toggle"
    >
      <BaseAvatar
        v-if="currentWorkspace"
        :name="currentWorkspace.name"
        size="sm"
        class="rounded-lg ring-2 ring-border-subtle transition-all duration-200 group-hover:ring-accent/50"
      />
      <span class="truncate max-w-[120px]">{{ currentWorkspace?.name || 'Select Workspace' }}</span>
      <Icon
        name="lucide:chevrons-up-down"
        class="w-4 h-4 text-text-muted transition-transform duration-200 group-hover:text-text-primary"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95 -translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 z-50 mt-3 w-72 bg-bg-elevated/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl overflow-hidden"
      >
        <!-- Header -->
        <div class="px-4 py-3 border-b border-border-subtle bg-bg-surface/50">
          <p class="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Workspaces
          </p>
        </div>

        <!-- Workspaces list -->
        <div class="max-h-64 overflow-y-auto p-2">
          <button
            v-for="workspace in workspaces"
            :key="workspace.id"
            class="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
            :class="[
              workspace.id === currentWorkspace?.id
                ? 'bg-accent/10 text-accent ring-1 ring-accent/20'
                : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary hover:scale-[1.02]'
            ]"
            @click="handleSwitch(workspace.id)"
          >
            <BaseAvatar
              :name="workspace.name"
              size="sm"
              class="rounded-lg shrink-0"
            />
            <div class="flex-1 text-left truncate font-medium">
              {{ workspace.name }}
            </div>
            <Icon
              v-if="workspace.id === currentWorkspace?.id"
              name="lucide:check"
              class="w-4 h-4 shrink-0"
            />
          </button>
        </div>

        <!-- Create new workspace -->
        <div class="border-t border-border-subtle bg-bg-surface/30 p-2">
          <button
            class="group w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-all duration-200 hover:scale-[1.02]"
            @click="openCreateModal"
          >
            <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-accent/20">
              <Icon
                name="lucide:plus"
                class="w-4 h-4 text-accent"
              />
            </div>
            <span>Create Workspace</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Create workspace modal -->
    <BaseModal
      v-model="showCreateModal"
      title="Create Workspace"
      size="sm"
    >
      <!-- Error alert for API errors -->
      <div
        v-if="createError && !createError.includes('required')"
        class="mb-4 p-4 rounded-xl bg-error-light border border-error/20"
      >
        <div class="flex gap-3">
          <Icon
            name="ph:warning-circle-bold"
            class="w-5 h-5 text-error shrink-0 mt-0.5"
          />
          <div>
            <p class="text-sm font-medium text-error">
              Unable to create workspace
            </p>
            <p class="text-sm text-error/80 mt-1">
              {{ createError }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleCreate">
        <BaseInput
          v-model="newWorkspaceName"
          label="Workspace Name"
          placeholder="Enter workspace name"
          :error="createError.includes('required') ? createError : ''"
        />
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton
            variant="secondary"
            @click="showCreateModal = false"
          >
            Cancel
          </BaseButton>
          <BaseButton
            :loading="isLoading"
            @click="handleCreate"
          >
            Create
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

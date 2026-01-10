<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useWorkspaces } from '~/composables/useWorkspaces'

/**
 * WorkspaceSwitcher - Workspace selection dropdown
 * Domain component for switching between workspaces
 */

const workspaceStore = useWorkspaceStore()
const { workspaces, switchWorkspace, createWorkspace, isLoading } = useWorkspaces()
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

  const workspace = await createWorkspace({ name: newWorkspaceName.value.trim() })
  if (workspace) {
    showCreateModal.value = false
    router.push(`/${workspace.slug}`)
  }
  else {
    createError.value = 'Failed to create workspace'
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
      class="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-text-secondary transition-default"
      @click="toggle"
    >
      <BaseAvatar
        v-if="currentWorkspace"
        :name="currentWorkspace.name"
        size="sm"
        class="rounded-md"
      />
      <span class="truncate max-w-[120px]">{{ currentWorkspace?.name || 'Select Workspace' }}</span>
      <Icon
        name="lucide:chevrons-up-down"
        class="w-4 h-4 text-text-muted"
      />
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 z-50 mt-2 w-56 bg-bg-elevated border border-border-subtle rounded-lg shadow-elevated overflow-hidden"
      >
        <!-- Workspaces list -->
        <div class="max-h-64 overflow-y-auto py-1">
          <button
            v-for="workspace in workspaces"
            :key="workspace.id"
            class="w-full flex items-center gap-3 px-3 py-2 text-sm transition-default"
            :class="[
              workspace.id === currentWorkspace?.id
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
            ]"
            @click="handleSwitch(workspace.id)"
          >
            <div class="flex-1 text-left truncate">
              {{ workspace.name }}
            </div>
            <Icon
              v-if="workspace.id === currentWorkspace?.id"
              name="lucide:check"
              class="w-4 h-4"
            />
          </button>
        </div>

        <!-- Create new workspace -->
        <div class="border-t border-border-subtle p-1">
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface hover:text-text-primary rounded transition-default"
            @click="openCreateModal"
          >
            <Icon
              name="lucide:plus"
              class="w-4 h-4"
            />
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
      <form @submit.prevent="handleCreate">
        <BaseInput
          v-model="newWorkspaceName"
          label="Workspace Name"
          placeholder="Enter workspace name"
          :error="createError"
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

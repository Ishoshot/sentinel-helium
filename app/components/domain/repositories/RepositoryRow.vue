<script setup lang="ts">
import type { Repository } from '~/types'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useSentinelConfig } from '~/composables/repositories/useSentinelConfig'

/**
 * RepositoryRow - Clean, functional repository list item
 */

interface Props {
  repository: Repository
  canManage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canManage: false,
})

defineEmits<{
  toggleAutoReview: [repositoryId: number]
  openSettings: [repositoryId: number]
}>()

const workspaceStore = useWorkspaceStore()
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug ?? '')
const runsUrl = computed(() => `/${workspaceSlug.value}/repositories/${props.repository.id}/runs`)

const { status: configStatus } = useSentinelConfig(
  computed(() => props.repository.settings)
)

// Language color mapping
const languageColors: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-blue-600',
  Go: 'bg-cyan-500',
  Rust: 'bg-orange-600',
  Java: 'bg-red-500',
  PHP: 'bg-purple-500',
  Ruby: 'bg-red-600',
  'C#': 'bg-green-600',
  'C++': 'bg-pink-500',
  C: 'bg-zinc-500',
  Swift: 'bg-orange-500',
  Kotlin: 'bg-purple-400',
  Vue: 'bg-emerald-500',
  HTML: 'bg-orange-400',
  CSS: 'bg-blue-400',
}

const languageColor = computed(
  () => languageColors[props.repository.language ?? ''] ?? 'bg-zinc-400'
)

const githubUrl = computed(
  () => `https://github.com/${props.repository.full_name}`
)
</script>

<template>
  <div class="group rounded-lg border border-border-subtle bg-bg-elevated transition-colors hover:border-border-muted">
    <div class="flex items-center gap-4 p-4">
      <!-- Icon -->
      <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-bg-surface">
        <Icon
          :name="repository.private ? 'lucide:lock' : 'lucide:folder-git-2'"
          class="size-5 text-text-muted"
        />
      </div>

      <!-- Info -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-3">
          <h3 class="truncate text-sm font-semibold text-text-primary">
            {{ repository.full_name }}
          </h3>

          <!-- Language -->
          <div
            v-if="repository.language"
            class="hidden items-center gap-1.5 sm:flex"
          >
            <span
              class="size-2 rounded-full"
              :class="languageColor"
            />
            <span class="text-xs text-text-muted">
              {{ repository.language }}
            </span>
          </div>

          <!-- Status badges -->
          <div class="flex items-center gap-2">
            <span
              class="rounded px-1.5 py-0.5 text-[10px] font-medium"
              :class="repository.auto_review_enabled
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-bg-surface text-text-muted'"
            >
              {{ repository.auto_review_enabled ? 'Active' : 'Inactive' }}
            </span>

            <span
              v-if="configStatus === 'active'"
              class="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400"
            >
              Config
            </span>
            <span
              v-else-if="configStatus === 'error'"
              class="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400"
            >
              Error
            </span>
          </div>
        </div>

        <p
          v-if="repository.description"
          class="mt-1 truncate text-sm text-text-muted"
        >
          {{ repository.description }}
        </p>
        <p
          v-else
          class="mt-1 text-sm italic text-text-muted"
        >
          No description
        </p>
      </div>

      <!-- Meta -->
      <div class="hidden items-center gap-4 text-sm text-text-muted lg:flex">
        <span class="flex items-center gap-1.5">
          <Icon
            name="lucide:git-branch"
            class="size-4"
          />
          {{ repository.default_branch }}
        </span>
        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 hover:text-text-secondary"
        >
          <Icon
            name="lucide:external-link"
            class="size-4"
          />
          GitHub
        </a>
      </div>

      <!-- Actions - always visible on mobile, hover on desktop -->
      <div class="flex items-center gap-1 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
        <NuxtLink
          :to="runsUrl"
          class="rounded p-2 text-text-muted hover:bg-bg-hover hover:text-text-secondary"
          title="View runs"
        >
          <Icon
            name="lucide:history"
            class="size-4"
          />
        </NuxtLink>

        <template v-if="canManage">
          <button
            class="rounded p-2 transition-colors"
            :class="repository.auto_review_enabled
              ? 'text-emerald-400 hover:bg-emerald-500/10'
              : 'text-text-muted hover:bg-bg-hover hover:text-text-secondary'"
            :title="repository.auto_review_enabled ? 'Disable auto-review' : 'Enable auto-review'"
            @click="$emit('toggleAutoReview', repository.id)"
          >
            <Icon
              :name="repository.auto_review_enabled ? 'lucide:toggle-right' : 'lucide:toggle-left'"
              class="size-4"
            />
          </button>

          <button
            class="rounded p-2 text-text-muted hover:bg-bg-hover hover:text-text-secondary"
            title="Settings"
            @click="$emit('openSettings', repository.id)"
          >
            <Icon
              name="lucide:settings"
              class="size-4"
            />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

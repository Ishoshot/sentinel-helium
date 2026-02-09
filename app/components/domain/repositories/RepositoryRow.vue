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
  <div
    class="group relative cursor-pointer overflow-hidden rounded-xl border bg-bg-elevated transition-all duration-200"
    :class="[
      repository.auto_review_enabled
        ? 'border-border-subtle hover:border-accent/15'
        : 'border-border-subtle hover:border-border-subtle',
    ]"
  >
    <div class="flex items-center gap-4 p-4">
      <!-- Icon -->
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        :class="repository.auto_review_enabled ? 'bg-accent-glow' : 'bg-bg-surface'"
      >
        <Icon
          :name="repository.private ? 'lucide:lock' : 'lucide:folder-git-2'"
          class="size-5"
          :class="repository.auto_review_enabled ? 'text-accent' : 'text-text-muted'"
        />
      </div>

      <!-- Info -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-3">
          <h3 class="truncate text-sm font-semibold text-text-primary">
            <span class="text-text-muted">{{ repository.owner }}/</span>{{ repository.name }}
          </h3>

          <!-- Active indicator pill -->
          <div
            v-if="repository.auto_review_enabled"
            class="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 ring-1 ring-emerald-500/20"
          >
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            <span class="text-[11px] font-medium text-emerald-400">Active</span>
          </div>
          <span
            v-else
            class="rounded-full bg-bg-surface px-2 py-0.5 text-[11px] font-medium text-text-muted ring-1 ring-border-subtle"
          >
            Inactive
          </span>

          <!-- Config / Error badges -->
          <span
            v-if="configStatus === 'active'"
            class="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400 ring-1 ring-blue-500/20"
          >
            <Icon
              name="lucide:file-code"
              class="size-3"
            />
            Config
          </span>
          <span
            v-else-if="configStatus === 'error'"
            class="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 ring-1 ring-amber-500/20"
          >
            <Icon
              name="lucide:alert-triangle"
              class="size-3"
            />
            Error
          </span>
        </div>

        <p
          v-if="repository.description"
          class="mt-1 truncate text-sm text-text-muted group-hover:text-text-secondary"
        >
          {{ repository.description }}
        </p>
        <p
          v-else
          class="mt-1 text-sm text-text-faint"
        >
          No description provided
        </p>
      </div>

      <!-- Meta pills -->
      <div class="hidden items-center gap-2 lg:flex">
        <span
          v-if="repository.language"
          class="inline-flex items-center gap-1.5 rounded-full bg-bg-surface px-2.5 py-0.5 text-xs text-text-muted ring-1 ring-border-subtle"
        >
          <span
            class="size-2 rounded-full"
            :class="languageColor"
          />
          {{ repository.language }}
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-bg-surface px-2.5 py-0.5 font-mono text-xs text-text-muted ring-1 ring-border-subtle">
          <Icon
            name="lucide:git-branch"
            class="size-3.5"
          />
          {{ repository.default_branch }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <template v-if="canManage">
          <button
            type="button"
            role="switch"
            :aria-checked="repository.auto_review_enabled"
            :title="repository.auto_review_enabled ? 'Disable auto-review' : 'Enable auto-review'"
            class="relative h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated"
            :class="repository.auto_review_enabled ? 'bg-accent' : 'bg-bg-surface'"
            @click="$emit('toggleAutoReview', repository.id)"
          >
            <span
              class="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-md transition-transform duration-200"
              :class="repository.auto_review_enabled ? 'translate-x-4' : 'translate-x-0'"
            />
          </button>
        </template>

        <div class="flex items-center gap-0.5 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:bg-bg-hover hover:text-text-secondary"
            title="GitHub"
          >
            <Icon
              name="lucide:external-link"
              class="size-4"
            />
          </a>
          <NuxtLink
            :to="runsUrl"
            class="inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:bg-bg-hover hover:text-text-secondary"
            title="View runs"
          >
            <Icon
              name="lucide:history"
              class="size-4"
            />
          </NuxtLink>

          <button
            v-if="canManage"
            class="inline-flex items-center justify-center rounded-lg p-2 text-text-muted hover:bg-bg-hover hover:text-text-secondary"
            title="Settings"
            @click="$emit('openSettings', repository.id)"
          >
            <Icon
              name="lucide:settings"
              class="size-4"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

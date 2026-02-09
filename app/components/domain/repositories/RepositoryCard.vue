<script setup lang="ts">
import type { Repository } from '~/types'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useSentinelConfig } from '~/composables/repositories/useSentinelConfig'

/**
 * RepositoryCard - Clean grid view card for a repository
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
  <article
    class="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-bg-elevated transition-all duration-200"
    :class="[
      repository.auto_review_enabled
        ? 'border-border-subtle hover:border-accent/15'
        : 'border-border-subtle hover:border-border-subtle',
    ]"
  >
    <!-- Header -->
    <div class="relative flex items-start justify-between gap-3 p-4 pb-0">
      <!-- Icon -->
      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        :class="repository.auto_review_enabled ? 'bg-accent-glow' : 'bg-bg-surface'"
      >
        <Icon
          :name="repository.private ? 'lucide:lock' : 'lucide:folder-git-2'"
          class="size-5"
          :class="repository.auto_review_enabled ? 'text-accent' : 'text-text-muted'"
        />
      </div>

      <!-- Active indicator -->
      <div
        v-if="repository.auto_review_enabled"
        class="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 ring-1 ring-emerald-500/20"
      >
        <span class="relative flex size-1.5">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span class="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
        </span>
        <span class="text-[11px] font-medium text-emerald-400">Active</span>
      </div>
      <span
        v-else
        class="rounded-full bg-bg-surface px-2 py-1 text-[11px] font-medium text-text-muted ring-1 ring-border-subtle"
      >
        Inactive
      </span>
    </div>

    <!-- Content -->
    <div class="relative flex flex-1 flex-col p-4">
      <!-- Title -->
      <div class="min-w-0">
        <h3 class="truncate text-[15px] font-semibold text-text-primary transition-colors group-hover:text-white">
          {{ repository.name }}
        </h3>
        <p class="truncate text-xs text-text-muted">
          {{ repository.owner }}
        </p>
      </div>

      <!-- Description -->
      <p
        v-if="repository.description"
        class="mt-2.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-text-secondary"
      >
        {{ repository.description }}
      </p>
      <p
        v-else
        class="mt-2.5 flex-1 text-[13px] text-text-faint"
      >
        No description provided
      </p>

      <!-- Tags row -->
      <div class="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          v-if="repository.language"
          class="hidden items-center gap-1.5 rounded-full bg-bg-surface px-2 py-0.5 text-[11px] font-medium text-text-muted ring-1 ring-border-subtle sm:inline-flex"
        >
          <span class="size-2 rounded-full" :class="languageColor" />
          {{ repository.language }}
        </span>
        <span class="inline-flex items-center gap-1 rounded-full bg-bg-surface px-2 py-0.5 font-mono text-[11px] text-text-muted ring-1 ring-border-subtle">
          <Icon name="lucide:git-branch" class="size-3" />
          {{ repository.default_branch }}
        </span>
        <span
          v-if="configStatus === 'active'"
          class="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400 ring-1 ring-blue-500/20"
        >
          <Icon name="lucide:file-code" class="size-3" />
          Config
        </span>
        <span
          v-else-if="configStatus === 'error'"
          class="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 ring-1 ring-amber-500/20"
        >
          <Icon name="lucide:alert-triangle" class="size-3" />
          Error
        </span>
      </div>
    </div>

    <!-- Footer -->
    <div class="relative flex items-center justify-between border-t border-border-subtle p-3">
      <a
        :href="githubUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-secondary"
      >
        <Icon name="lucide:external-link" class="size-3.5" />
        GitHub
      </a>

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

        <!-- Reveal actions -->
        <div class="flex items-center gap-0.5 opacity-0 transition-all duration-200 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100">
          <NuxtLink
            :to="runsUrl"
            class="inline-flex items-center justify-center rounded-lg p-1.5 text-text-muted hover:bg-bg-hover hover:text-text-secondary"
            title="View runs"
          >
            <Icon name="lucide:history" class="size-4" />
          </NuxtLink>

          <button
            v-if="canManage"
            class="inline-flex items-center justify-center rounded-lg p-1.5 text-text-muted hover:bg-bg-hover hover:text-text-secondary"
            title="Settings"
            @click="$emit('openSettings', repository.id)"
          >
            <Icon name="lucide:settings" class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

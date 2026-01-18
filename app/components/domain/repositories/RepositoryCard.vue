<script setup lang="ts">
import type { Repository } from '~/types'
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useSentinelConfig } from '~/composables/repositories/useSentinelConfig'

/**
 * RepositoryCard - Grid view card for a repository
 */

interface Props {
  repository: Repository
  canManage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canManage: false,
})

const emit = defineEmits<{
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
  C: 'bg-gray-600',
  Swift: 'bg-orange-500',
  Kotlin: 'bg-purple-400',
  Vue: 'bg-emerald-500',
  HTML: 'bg-orange-400',
  CSS: 'bg-blue-400',
}

const languageColor = computed(
  () => languageColors[props.repository.language ?? ''] ?? 'bg-gray-400'
)

const githubUrl = computed(
  () => `https://github.com/${props.repository.full_name}`
)
</script>

<template>
  <div class="group bg-bg-elevated border border-border-subtle rounded-2xl p-6 hover:border-border-muted hover:shadow-lg transition-all duration-200 flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 mb-5">
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-bg-surface to-bg-elevated border border-border-subtle flex items-center justify-center shrink-0 shadow-sm">
          <Icon
            :name="repository.private ? 'lucide:lock' : 'lucide:folder-git-2'"
            class="w-6 h-6 text-text-muted"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-base font-bold text-text-primary truncate leading-tight">
            {{ repository.name }}
          </h3>
          <p class="text-sm text-text-muted truncate mt-1">
            {{ repository.owner }}
          </p>
        </div>
      </div>

      <!-- Auto-review indicator -->
      <div class="flex flex-col items-end gap-2 shrink-0">
        <div
          v-if="configStatus !== 'default'"
          class="px-3 py-1 rounded-lg text-xs font-semibold ring-1 ring-inset flex items-center gap-1.5"
          :class="configStatus === 'error'
            ? 'bg-warning/10 text-warning ring-warning/20'
            : 'bg-accent/10 text-accent ring-accent/20'"
          :title="configStatus === 'error' ? 'Configuration error' : 'Configuration active'"
        >
          <Icon
            :name="configStatus === 'error' ? 'lucide:alert-triangle' : 'lucide:check-circle-2'"
            class="w-3.5 h-3.5"
          />
          <span>{{ configStatus === 'error' ? 'Error' : 'Config' }}</span>
        </div>

        <div
          class="px-3 py-1 rounded-lg text-xs font-semibold ring-1 ring-inset"
          :class="repository.auto_review_enabled
            ? 'bg-success/10 text-success ring-success/20'
            : 'bg-bg-surface text-text-muted ring-border-subtle'"
        >
          {{ repository.auto_review_enabled ? 'Active' : 'Inactive' }}
        </div>
      </div>
    </div>

    <!-- Description -->
    <p
      v-if="repository.description"
      class="text-sm text-text-secondary mb-6 line-clamp-2 flex-1 leading-relaxed"
    >
      {{ repository.description }}
    </p>
    <div
      v-else
      class="flex-1 mb-6"
    >
      <span class="text-sm text-text-muted italic">No description provided</span>
    </div>

    <!-- Meta -->
    <div class="flex items-center gap-5 text-sm text-text-muted mb-6 font-semibold">
      <span
        v-if="repository.language"
        class="flex items-center gap-2"
      >
        <span
          class="w-2.5 h-2.5 rounded-full ring-1 ring-inset ring-black/10"
          :class="languageColor"
        />
        {{ repository.language }}
      </span>
      <span class="flex items-center gap-2">
        <Icon
          name="lucide:git-branch"
          class="w-4 h-4"
        />
        {{ repository.default_branch }}
      </span>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-5 border-t border-border-subtle mt-auto">
      <!-- Open in GitHub -->
      <a
        :href="githubUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-text-primary transition-colors"
      >
        <Icon
          name="lucide:external-link"
          class="w-4 h-4"
        />
        GitHub
      </a>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <NuxtLink
          :to="runsUrl"
          class="p-2.5 text-text-muted hover:text-text-primary rounded-xl hover:bg-bg-surface transition-all hover:shadow-sm"
          title="View runs history"
        >
          <Icon
            name="lucide:history"
            class="w-5 h-5"
          />
        </NuxtLink>

        <template v-if="canManage">
          <button
            class="p-2.5 rounded-xl transition-all hover:shadow-sm"
            :class="[
              repository.auto_review_enabled
                ? 'text-success hover:bg-success/10'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-surface'
            ]"
            :title="repository.auto_review_enabled ? 'Disable auto-review' : 'Enable auto-review'"
            @click="$emit('toggleAutoReview', repository.id)"
          >
            <Icon
              :name="repository.auto_review_enabled ? 'lucide:toggle-right' : 'lucide:toggle-left'"
              class="w-5 h-5"
            />
          </button>
          <button
            class="p-2.5 text-text-muted hover:text-text-primary rounded-xl hover:bg-bg-surface transition-all hover:shadow-sm"
            title="Repository settings"
            @click="$emit('openSettings', repository.id)"
          >
            <Icon
              name="lucide:settings"
              class="w-5 h-5"
            />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

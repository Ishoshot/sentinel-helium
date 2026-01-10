<script setup lang="ts">
import type { Repository } from '~/types'

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
  <div class="bg-bg-elevated border border-border-subtle rounded-xl p-5 hover:border-border-muted transition-default flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 mb-4">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-9 h-9 rounded-lg bg-bg-surface flex items-center justify-center shrink-0">
          <Icon
            :name="repository.private ? 'lucide:lock' : 'lucide:folder-git-2'"
            class="w-4.5 h-4.5 text-text-muted"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-medium text-text-primary truncate">
            {{ repository.name }}
          </h3>
          <p class="text-xs text-text-muted truncate">
            {{ repository.owner }}
          </p>
        </div>
      </div>

      <!-- Auto-review indicator -->
      <div
        class="shrink-0 px-2 py-1 rounded-full text-xs font-medium"
        :class="repository.auto_review_enabled 
          ? 'bg-success/10 text-success' 
          : 'bg-bg-surface text-text-muted'"
      >
        {{ repository.auto_review_enabled ? 'Active' : 'Inactive' }}
      </div>
    </div>

    <!-- Description -->
    <p
      v-if="repository.description"
      class="text-sm text-text-secondary mb-4 line-clamp-2 flex-1"
    >
      {{ repository.description }}
    </p>
    <div
      v-else
      class="flex-1 mb-4"
    />

    <!-- Meta -->
    <div class="flex items-center gap-4 text-xs text-text-muted mb-4">
      <span
        v-if="repository.language"
        class="flex items-center gap-1.5"
      >
        <span
          class="w-2.5 h-2.5 rounded-full"
          :class="languageColor"
        />
        {{ repository.language }}
      </span>
      <span class="flex items-center gap-1.5">
        <Icon
          name="lucide:git-branch"
          class="w-3.5 h-3.5"
        />
        {{ repository.default_branch }}
      </span>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-4 border-t border-border-subtle">
      <!-- Open in GitHub -->
      <a
        :href="githubUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-default"
      >
        <Icon
          name="lucide:external-link"
          class="w-3.5 h-3.5"
        />
        Open in GitHub
      </a>

      <!-- Actions -->
      <div
        v-if="canManage"
        class="flex items-center gap-1"
      >
        <button
          class="p-2 rounded-lg hover:bg-bg-surface transition-default"
          :class="repository.auto_review_enabled ? 'text-success' : 'text-text-muted'"
          :title="repository.auto_review_enabled ? 'Disable auto-review' : 'Enable auto-review'"
          @click="$emit('toggleAutoReview', repository.id)"
        >
          <Icon
            :name="repository.auto_review_enabled ? 'lucide:toggle-right' : 'lucide:toggle-left'"
            class="w-5 h-5"
          />
        </button>
        <button
          class="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-surface transition-default"
          title="Repository settings"
          @click="$emit('openSettings', repository.id)"
        >
          <Icon
            name="lucide:settings"
            class="w-5 h-5"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RepositoryGroup } from '~/types'

const props = defineProps<{
  group: RepositoryGroup
}>()

const isExpanded = ref(true)

const languageColors: Record<string, string> = {
  JavaScript: 'bg-yellow-400',
  TypeScript: 'bg-blue-500',
  Python: 'bg-blue-600',
  Java: 'bg-orange-600',
  Go: 'bg-cyan-500',
  Ruby: 'bg-red-500',
  PHP: 'bg-purple-500',
  Rust: 'bg-orange-700',
  Swift: 'bg-orange-500',
  Kotlin: 'bg-purple-600',
  C: 'bg-gray-600',
  'C++': 'bg-pink-600',
  'C#': 'bg-green-600',
  Vue: 'bg-emerald-500',
  default: 'bg-gray-400',
}

const languageColor = computed(() => {
  const language = props.group.repository.language
  return language && languageColors[language] ? languageColors[language] : languageColors.default
})
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-gray-300">
    <!-- Header -->
    <button
      type="button"
      class="w-full px-4 py-4 text-left transition-colors hover:bg-gray-50"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 flex-1 items-start gap-3">
          <!-- Repository Icon -->
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <Icon
              name="lucide:folder-git-2"
              class="size-5 text-gray-500"
            />
          </div>

          <!-- Repository Info -->
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-center gap-2">
              <span
                v-if="group.repository.private"
                class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
              >
                Private
              </span>
              <span
                v-if="group.repository.language"
                class="inline-flex items-center gap-1.5 text-xs text-gray-500"
              >
                <span
                  class="size-2 rounded-full"
                  :class="languageColor"
                />
                {{ group.repository.language }}
              </span>
            </div>
            <h3 class="text-sm font-semibold text-gray-900">
              {{ group.repository.name }}
            </h3>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>
                <span class="font-medium text-gray-700">{{ group.pull_requests_count }}</span>
                {{ group.pull_requests_count === 1 ? 'pull request' : 'pull requests' }}
              </span>
              <span class="text-gray-300">·</span>
              <span>
                <span class="font-medium text-gray-700">{{ group.runs_count }}</span>
                {{ group.runs_count === 1 ? 'run' : 'runs' }} total
              </span>
            </div>
          </div>
        </div>

        <!-- Expand/Collapse -->
        <Icon
          name="lucide:chevron-down"
          class="size-5 shrink-0 text-gray-400 transition-transform"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </button>

    <!-- Pull Requests List -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[4000px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-[4000px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-if="isExpanded"
        class="border-t border-gray-100 bg-gray-50/50"
      >
        <div class="space-y-3 p-4">
          <DomainReviewsPullRequestGroup
            v-for="prGroup in group.pull_requests"
            :key="`${group.repository.id}-${prGroup.pull_request_number}`"
            :group="prGroup"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

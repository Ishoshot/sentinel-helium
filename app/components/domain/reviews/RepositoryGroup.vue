<script setup lang="ts">
import type { RepositoryGroup } from "~/types";

const props = defineProps<{
  group: RepositoryGroup;
}>();

const isExpanded = ref(true);

const languageColors: Record<string, string> = {
  JavaScript: "bg-yellow-500",
  TypeScript: "bg-blue-500",
  Python: "bg-blue-400",
  Java: "bg-orange-600",
  Go: "bg-cyan-500",
  Ruby: "bg-red-500",
  PHP: "bg-purple-500",
  Rust: "bg-orange-700",
  Swift: "bg-orange-500",
  Kotlin: "bg-purple-600",
  C: "bg-gray-600",
  "C++": "bg-pink-600",
  "C#": "bg-green-600",
  Vue: "bg-green-500",
  default: "bg-gray-500",
};

const languageColor = computed(() => {
  const language = props.group.repository.language;
  return language && languageColors[language] ? languageColors[language] : languageColors.default;
});
</script>

<template>
  <div class="rounded-2xl border border-border-subtle bg-bg-base shadow-sm transition-all duration-200 hover:shadow-md">
    <!-- Collapsible Header -->
    <button
      type="button"
      class="w-full px-6 py-5 text-left transition-all duration-200 hover:bg-bg-surface/50"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 flex-1 items-start gap-4">
          <!-- Repository Icon -->
          <div
            class="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5"
          >
            <Icon
              name="lucide:folder-git-2"
              class="size-6 text-primary"
            />
          </div>

          <!-- Repository Info -->
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-center gap-2">
              <span
                v-if="group.repository.private"
                class="inline-flex items-center gap-1 rounded-full bg-muted/20 px-2.5 py-0.5 text-xs font-medium text-muted"
              >
                🔒 Private
              </span>
              <span
                v-if="group.repository.language"
                class="inline-flex items-center gap-1.5 rounded-full bg-bg-surface px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                <span :class="['size-2 rounded-full', languageColor]" />
                {{ group.repository.language }}
              </span>
            </div>
            <h3 class="mb-2 text-lg font-bold leading-tight text-primary">
              {{ group.repository.name }}
            </h3>
            <div class="flex flex-wrap items-center gap-3 text-sm text-muted">
              <span class="flex items-center gap-1.5">
                <span class="font-medium text-primary">{{ group.pull_requests_count }}</span>
                {{ group.pull_requests_count === 1 ? "pull request" : "pull requests" }}
              </span>
              <span class="text-border-subtle">•</span>
              <span>
                <span class="font-medium text-primary">{{ group.runs_count }}</span>
                {{ group.runs_count === 1 ? "run" : "runs" }} total
              </span>
            </div>
          </div>
        </div>

        <!-- Expand/Collapse Icon -->
        <Icon
          name="lucide:chevron-down"
          :class="[
            'size-5 shrink-0 text-muted transition-transform duration-200',
            isExpanded && 'rotate-180',
          ]"
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
      <div v-if="isExpanded" class="border-t border-border-subtle bg-bg-surface/30">
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

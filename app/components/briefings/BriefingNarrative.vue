<script setup lang="ts">
import { marked } from "marked";
import DOMPurify from "dompurify";
import type { BriefingGeneration } from "~/types";
import {
  getAchievementIcon,
  getAchievementColor,
  EXCERPT_META,
} from "~/utils/briefing-icons";
import { CLIPBOARD_FEEDBACK_DEFAULT } from "~/constants/animations";
import { useAppToast } from "~/composables/shared/useAppToast";

const toast = useAppToast();

interface Props {
  generation: BriefingGeneration;
  showAchievements?: boolean;
  showExcerpts?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showAchievements: true,
  showExcerpts: false,
});

// Async markdown parsing state
const narrativeHtml = ref<string>("");
const isParsingNarrative = ref(false);
let narrativeParseRequestId = 0;

/**
 * Parse markdown narrative asynchronously to prevent UI blocking on large documents.
 */
async function parseNarrative(content: string | null): Promise<void> {
  if (!content) {
    narrativeHtml.value = "";
    return;
  }

  const requestId = ++narrativeParseRequestId;
  isParsingNarrative.value = true;

  try {
    const rawHtml = await marked.parse(content, {
      breaks: true,
      gfm: true,
      async: true,
    });

    if (requestId === narrativeParseRequestId) {
      narrativeHtml.value = DOMPurify.sanitize(rawHtml as string);
    }
  } catch (error) {
    console.error("Narrative parsing error:", error);
    if (requestId === narrativeParseRequestId) {
      narrativeHtml.value = DOMPurify.sanitize(content);
    }
  } finally {
    if (requestId === narrativeParseRequestId) {
      isParsingNarrative.value = false;
    }
  }
}

// Parse on mount and when narrative changes
onMounted(() => {
  void parseNarrative(props.generation.narrative);
});

watch(() => props.generation.narrative, (newNarrative) => {
  void parseNarrative(newNarrative);
});

// Format achievements nicely
const achievements = computed(() => props.generation.achievements ?? []);
const hasAchievements = computed(() => achievements.value.length > 0);

// Excerpts
const excerpts = computed(() => props.generation.excerpts);
const hasExcerpts = computed(() => !!excerpts.value && Object.keys(excerpts.value).length > 0);

// Copy state
const copiedExcerpt = ref<string | null>(null);

async function copyExcerpt(key: string | number, value: string | undefined) {
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    copiedExcerpt.value = String(key);
    setTimeout(() => {
      copiedExcerpt.value = null;
    }, CLIPBOARD_FEEDBACK_DEFAULT);
  } catch (e) {
    console.error("Failed to copy:", e);
    toast.error("Failed to copy to clipboard");
  }
}

// Excerpt labels and icons (from shared utility)

// Generation metadata
const metadata = computed(() => props.generation.metadata);
const completedAt = computed(() => {
  if (!props.generation.completed_at) return null;
  return new Date(props.generation.completed_at);
});
</script>

<template>
  <div class="space-y-8">
    <!-- Narrative Content -->
    <article class="prose prose-slate max-w-none">
      <!-- Header with title from briefing -->
      <header
        v-if="generation.briefing"
        class="not-prose mb-8 pb-6 border-b border-border-subtle"
      >
        <div class="flex items-start gap-4">
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-text-primary mb-2">
              {{ generation.briefing.title }}
            </h1>
            <div class="flex items-center gap-4 text-sm text-text-muted">
              <span
                v-if="generation.generated_by"
                class="flex items-center gap-1.5"
              >
                <BaseAvatar
                  :src="generation.generated_by.avatar_url"
                  :name="generation.generated_by.name"
                  size="xs"
                />
                {{ generation.generated_by.name }}
              </span>
              <span
                v-if="completedAt"
                class="flex items-center gap-1"
              >
                <Icon
                  name="lucide:calendar"
                  class="w-4 h-4"
                />
                {{ completedAt.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) }}
              </span>
            </div>
          </div>

          <!-- AI badge -->
          <div
            v-if="generation.briefing.requires_ai"
            class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent-light rounded-full"
          >
            <Icon
              name="lucide:sparkles"
              class="w-3.5 h-3.5"
            />
            AI Generated
          </div>
        </div>
      </header>

      <!-- Main narrative -->
      <div
        v-if="isParsingNarrative && !narrativeHtml"
        class="flex items-center gap-2 text-text-muted py-4"
      >
        <Icon
          name="lucide:loader-2"
          class="w-4 h-4 animate-spin"
        />
        <span class="text-sm">Rendering narrative...</span>
      </div>
      <div
        v-else
        class="narrative-content"
        v-html="narrativeHtml"
      />
    </article>

    <!-- Achievements Section -->
    <section
      v-if="showAchievements && hasAchievements"
      class="mt-10"
    >
      <h2 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Icon
          name="lucide:trophy"
          class="w-5 h-5 text-amber-500"
        />
        Achievements Unlocked
      </h2>

      <div class="grid gap-3 sm:grid-cols-2">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          class="group relative overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <!-- Confetti background on hover -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div class="absolute top-0 left-1/4 w-1 h-1 bg-amber-400 rounded-full animate-bounce" />
            <div
              class="absolute top-2 right-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
              style="animation-delay: 0.1s"
            />
            <div
              class="absolute bottom-2 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-bounce"
              style="animation-delay: 0.2s"
            />
          </div>

          <div class="relative flex items-start gap-3">
            <div
              class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
              :class="getAchievementColor(achievement)"
            >
              <Icon
                :name="achievement.icon || getAchievementIcon(achievement)"
                class="w-5 h-5"
              />
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-text-primary text-sm leading-tight">
                {{ achievement.title }}
              </h3>
              <p class="text-xs text-text-muted mt-0.5 line-clamp-2">
                {{ achievement.description }}
              </p>
              <div
                v-if="achievement.value"
                class="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-bg-surface rounded text-xs font-medium text-text-secondary"
              >
                {{ achievement.value }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Smart Excerpts Section -->
    <section
      v-if="showExcerpts && hasExcerpts"
      class="mt-10"
    >
      <h2 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Icon
          name="lucide:share-2"
          class="w-5 h-5 text-text-muted"
        />
        Ready to Share
      </h2>

      <div class="space-y-3">
        <div
          v-for="(value, key) in excerpts"
          :key="key"
          class="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-2 bg-bg-elevated border-b border-border-subtle">
            <div class="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <Icon
                :name="EXCERPT_META[key]?.icon ?? 'lucide:file-text'"
                class="w-4 h-4"
              />
              {{ EXCERPT_META[key]?.label ?? key }}
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
              :class="copiedExcerpt === key
                ? 'text-success bg-success/10'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-surface'"
              @click="copyExcerpt(key, value)"
            >
              <Icon
                :name="copiedExcerpt === key ? 'lucide:check' : 'lucide:copy'"
                class="w-3.5 h-3.5"
              />
              {{ copiedExcerpt === key ? 'Copied!' : 'Copy' }}
            </button>
          </div>

          <!-- Content -->
          <div class="p-4">
            <p class="text-sm text-text-secondary whitespace-pre-wrap">
              {{ value }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Metadata footer -->
    <footer
      v-if="metadata"
      class="mt-10 pt-6 border-t border-border-subtle"
    >
      <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-muted">
        <span
          v-if="metadata.model"
          class="flex items-center gap-1"
        >
          <Icon
            name="lucide:cpu"
            class="w-3.5 h-3.5"
          />
          {{ metadata.model }}
        </span>
        <span
          v-if="metadata.tokens_used"
          class="flex items-center gap-1"
        >
          <Icon
            name="lucide:hash"
            class="w-3.5 h-3.5"
          />
          {{ metadata.tokens_used.toLocaleString() }} tokens
        </span>
        <span
          v-if="metadata.duration_ms"
          class="flex items-center gap-1"
        >
          <Icon
            name="lucide:timer"
            class="w-3.5 h-3.5"
          />
          {{ (metadata.duration_ms / 1000).toFixed(1) }}s
        </span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Enhanced prose styling for narrative content */
.narrative-content :deep(h1) {
  @apply text-2xl font-bold text-text-primary mt-8 mb-4 first:mt-0;
}

.narrative-content :deep(h2) {
  @apply text-xl font-semibold text-text-primary mt-8 mb-3;
}

.narrative-content :deep(h3) {
  @apply text-lg font-semibold text-text-primary mt-6 mb-2;
}

.narrative-content :deep(p) {
  @apply text-text-secondary leading-relaxed mb-4;
}

.narrative-content :deep(ul),
.narrative-content :deep(ol) {
  @apply mb-4 pl-6;
}

.narrative-content :deep(li) {
  @apply text-text-secondary mb-2;
}

.narrative-content :deep(ul li) {
  @apply list-disc;
}

.narrative-content :deep(ol li) {
  @apply list-decimal;
}

.narrative-content :deep(strong) {
  @apply font-semibold text-text-primary;
}

.narrative-content :deep(em) {
  @apply italic;
}

.narrative-content :deep(blockquote) {
  @apply border-l-4 border-accent pl-4 py-1 my-4 italic text-text-muted;
}

.narrative-content :deep(code) {
  @apply px-1.5 py-0.5 bg-bg-surface rounded text-sm font-mono;
}

.narrative-content :deep(pre) {
  @apply p-4 bg-bg-surface rounded-lg overflow-x-auto mb-4;
}

.narrative-content :deep(pre code) {
  @apply p-0 bg-transparent;
}

.narrative-content :deep(a) {
  @apply text-accent hover:text-accent-hover underline;
}

.narrative-content :deep(hr) {
  @apply border-border-subtle my-8;
}

/* Tables */
.narrative-content :deep(table) {
  @apply w-full border-collapse mb-4;
}

.narrative-content :deep(th) {
  @apply text-left font-semibold text-text-primary p-3 bg-bg-surface border-b border-border-subtle;
}

.narrative-content :deep(td) {
  @apply p-3 border-b border-border-subtle text-text-secondary;
}

.narrative-content :deep(tr:last-child td) {
  @apply border-b-0;
}
</style>

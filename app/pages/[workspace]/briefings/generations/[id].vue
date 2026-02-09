<script setup lang="ts">
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";
import { useBriefings } from "~/composables/briefings/useBriefings";
import { useAppToast } from "~/composables/shared/useAppToast";
import type { BriefingGeneration } from "~/types";
import { BriefingGenerationStatus, BriefingOutputFormat } from "~/types";

/**
 * Briefing View Page
 *
 * A premium reading experience for completed briefings.
 * Designed to be beautiful, shareable, and memorable.
 */

definePageMeta({
  middleware: ["auth", "workspace"],
});

const route = useRoute();
const router = useRouter();
const workspaceStore = useWorkspaceStore();
const toast = useAppToast();

const workspaceId = computed(() => workspaceStore.currentWorkspaceId);
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug ?? "");
const generationId = computed(() => Number(route.params.id));

// Composables
const {
  fetchGeneration,
  downloadBriefing,
  submitFeedback,
  isSubmittingFeedback,
} = useBriefings(workspaceId);

// State
const generation = ref<BriefingGeneration | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isDownloading = ref(false);
const showShareModal = ref(false);
const showExcerpts = ref(false);
const isNarrativeHighlighted = ref(false);
const narrativeSectionRef = ref<HTMLElement | null>(null);
const narrativeContentRef = ref<HTMLElement | null>(null);
let highlightTimeout: ReturnType<typeof setTimeout> | null = null;
const rating = ref<number | null>(null);
const comment = ref("");
const tagsInput = ref("");
const feedbackError = ref<string | null>(null);
const feedbackSubmitted = ref(false);

// Fetch generation data
onMounted(async () => {
  try {
    const data = await fetchGeneration(generationId.value);
    if (data) {
      generation.value = data;

      // Redirect if not completed
      if (data.status !== BriefingGenerationStatus.Completed) {
        if (data.briefing) {
          router.replace(
            `/${workspaceSlug.value}/briefings/${data.briefing.slug}?generation=${data.id}`
          );
        } else {
          router.replace(`/${workspaceSlug.value}/briefings`);
        }
      }
    } else {
      error.value = "Briefing not found";
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load briefing";
  } finally {
    isLoading.value = false;
  }
});

// Download handler
async function handleDownload(format: BriefingOutputFormat) {
  if (!generation.value) return;

  isDownloading.value = true;

  try {
    const url = await downloadBriefing(generation.value.id, format);
    if (url) {
      // Open download in new tab
      window.open(url, "_blank");
      toast.success(`Downloading ${format.toUpperCase()}...`);
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Download failed";
    toast.error(message);
  } finally {
    isDownloading.value = false;
  }
}

// Share handler - opens modal
function handleShare() {
  showShareModal.value = true;
}

// Handle share created
function handleShareCreated() {
  toast.success("Share link created!");
}

function scrollToNarrativeSection() {
  const targetElement = narrativeContentRef.value ?? narrativeSectionRef.value;
  if (!targetElement) {
    return;
  }

  const viewportWidth = window.innerWidth;
  const stickyOffset = viewportWidth >= 640 ? 104 : 88;
  const scrollPastSectionStart = viewportWidth >= 1280 ? 180 : viewportWidth >= 1024 ? 140 : viewportWidth >= 640 ? 96 : 72;
  const targetTop = targetElement.getBoundingClientRect().top
    + window.scrollY
    - stickyOffset
    + scrollPastSectionStart;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

function handleToggleExcerpts(options?: { shouldScroll?: boolean }) {
  const willShowExcerpts = !showExcerpts.value;
  showExcerpts.value = willShowExcerpts;

  if (!willShowExcerpts) {
    return;
  }

  if (options?.shouldScroll ?? true) {
    nextTick(() => {
      scrollToNarrativeSection();
    });
  }

  isNarrativeHighlighted.value = true;
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
  }
  highlightTimeout = setTimeout(() => {
    isNarrativeHighlighted.value = false;
  }, 1200);
}

// Print handler
function handlePrint() {
  window.print();
}

// Go back
function handleGoBack() {
  router.push(`/${workspaceSlug.value}/briefings`);
}

onUnmounted(() => {
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
  }
});

// Available output formats
const availableFormats = computed(() => {
  if (!generation.value) {
    return [] as BriefingOutputFormat[];
  }
  return generation.value.output_formats ?? [];
});

// Check if has excerpts
const hasExcerpts = computed(() => {
  return generation.value?.excerpts && Object.keys(generation.value.excerpts).length > 0;
});

// Completed date formatted
const completedDate = computed(() => {
  if (!generation.value?.completed_at) return null;
  return new Date(generation.value.completed_at);
});

const parsedTags = computed(() => {
  if (!tagsInput.value.trim()) return [];
  return tagsInput.value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 10);
});

async function handleSubmitFeedback() {
  if (!generation.value) return;

  if (!rating.value) {
    feedbackError.value = "Please select a rating.";
    return;
  }

  feedbackError.value = null;

  const success = await submitFeedback(generation.value.id, {
    rating: rating.value,
    comment: comment.value.trim() || undefined,
    tags: parsedTags.value.length > 0 ? parsedTags.value : undefined,
  });

  if (success) {
    feedbackSubmitted.value = true;
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg-app pb-24 sm:pb-0">
    <header class="no-print sticky top-0 z-30 border-b border-border-subtle bg-bg-elevated">
      <div class="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex items-start gap-3 sm:gap-4">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md p-1 text-text-muted transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              aria-label="Back to briefings"
              @click="handleGoBack"
            >
              <Icon
                name="lucide:arrow-left"
                class="h-5 w-5"
              />
            </button>

            <div class="min-w-0">
              <p class="text-xs font-medium uppercase tracking-wider text-text-muted">
                Briefing
              </p>
              <BaseSkeleton
                v-if="isLoading"
                class="mt-2 h-6 w-52"
              />
              <h1
                v-else-if="generation?.briefing"
                class="mt-1 text-lg font-semibold tracking-tight text-text-primary sm:text-xl"
              >
                <span class="text-balance">{{ generation.briefing.title }}</span>
              </h1>
              <p
                v-if="completedDate"
                class="mt-1 text-xs text-text-muted"
              >
                Generated {{ completedDate.toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="hasExcerpts"
              type="button"
              class="hidden items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors sm:flex"
              :class="showExcerpts
                ? 'border-accent/20 bg-accent/10 text-accent'
                : 'border-border-subtle text-text-muted hover:border-border-muted hover:text-text-secondary'"
              aria-controls="briefing-narrative"
              :aria-expanded="showExcerpts"
              :aria-label="showExcerpts ? 'Hide excerpts' : 'Show excerpts'"
              @click="handleToggleExcerpts"
            >
              <Icon
                name="lucide:book-open"
                class="h-4 w-4"
              />
              {{ showExcerpts ? 'Hide Excerpts' : 'Excerpts' }}
            </button>

            <button
              type="button"
              class="hidden items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-border-muted hover:text-text-secondary sm:flex"
              @click="handlePrint"
            >
              <Icon
                name="lucide:printer"
                class="h-4 w-4"
              />
            </button>

            <BaseDropdown
              :options="availableFormats.map(f => ({ label: f.toUpperCase(), value: f }))"
              placeholder="Download"
              menu-width="w-32"
              @update:model-value="(v) => handleDownload(v as BriefingOutputFormat)"
            >
              <template #trigger>
                <button
                  type="button"
                  class="flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-border-muted hover:text-text-secondary"
                  :disabled="isDownloading"
                >
                  <Icon
                    v-if="isDownloading"
                    name="lucide:loader-2"
                    class="h-4 w-4 animate-spin"
                  />
                  <Icon
                    v-else
                    name="lucide:download"
                    class="h-4 w-4"
                  />
                  <span class="hidden sm:inline">Download</span>
                </button>
              </template>
            </BaseDropdown>

            <BaseButton
              variant="primary"
              size="sm"
              @click="handleShare"
            >
              <Icon
                name="lucide:share"
                class="mr-1.5 h-4 w-4"
              />
              Share
            </BaseButton>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div
        v-if="isLoading"
        class="rounded-2xl border border-border-subtle bg-bg-elevated p-8 shadow-elevated"
      >
        <div class="space-y-6">
          <BaseSkeleton class="h-10 w-3/4" />
          <BaseSkeleton class="h-6 w-1/2" />
          <div class="my-8 h-px bg-border-subtle" />
          <BaseSkeleton class="h-4 w-full" />
          <BaseSkeleton class="h-4 w-full" />
          <BaseSkeleton class="h-4 w-4/5" />
          <BaseSkeleton class="h-4 w-full" />
          <BaseSkeleton class="h-4 w-3/4" />
        </div>
      </div>

      <div
        v-else-if="error"
        class="rounded-2xl border border-error/20 bg-bg-elevated p-8 shadow-elevated sm:p-10"
      >
        <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-error/10">
          <Icon
            name="lucide:alert-circle"
            class="h-6 w-6 text-error"
          />
        </div>
        <h2 class="text-xl font-semibold tracking-tight text-text-primary">
          {{ error }}
        </h2>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
          We could not load this briefing. It may have been deleted or you do not have access.
        </p>
        <div class="mt-7">
          <button
            type="button"
            class="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 rounded-md"
            @click="handleGoBack"
          >
            <Icon
              name="lucide:arrow-left"
              class="mr-2 h-4 w-4"
            />
            Back to Briefings
          </button>
        </div>
      </div>

      <div
        v-else-if="generation"
        class="space-y-8"
      >
        <section
          id="briefing-narrative"
          ref="narrativeSectionRef"
          class="scroll-mt-24 overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated shadow-elevated transition-all duration-500 sm:scroll-mt-28"
          :class="isNarrativeHighlighted ? 'ring-2 ring-accent/30' : ''"
        >
          <header class="border-b border-border-subtle bg-bg-surface px-6 py-4">
            <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
              <div class="flex flex-wrap items-center gap-3">
                <span class="font-medium text-text-secondary">Narrative</span>
                <span v-if="hasExcerpts && showExcerpts">Excerpts are visible below.</span>
              </div>

              <button
                v-if="hasExcerpts"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors sm:hidden"
                :class="showExcerpts
                  ? 'border-accent/20 bg-accent/10 text-accent'
                  : 'border-border-subtle text-text-muted hover:border-border-muted hover:text-text-secondary'"
                aria-controls="briefing-narrative"
                :aria-expanded="showExcerpts"
                :aria-label="showExcerpts ? 'Hide excerpts' : 'Show excerpts'"
                @click="handleToggleExcerpts({ shouldScroll: false })"
              >
                <Icon
                  name="lucide:book-open"
                  class="h-3.5 w-3.5"
                />
                {{ showExcerpts ? 'Hide' : 'Excerpts' }}
              </button>
            </div>
          </header>

          <div
            ref="narrativeContentRef"
            class="p-6 sm:p-8 lg:p-10"
          >
            <BriefingsBriefingNarrative
              :generation="generation"
              :show-achievements="true"
              :show-excerpts="showExcerpts"
            />
          </div>
        </section>

        <section class="rounded-2xl border border-border-subtle bg-bg-elevated p-6 shadow-elevated sm:p-8">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 class="text-lg font-semibold tracking-tight text-text-primary">
                How was this briefing?
              </h3>
              <p class="mt-1 text-sm text-text-muted">
                Share quick feedback to help us improve.
              </p>
            </div>
            <div
              v-if="feedbackSubmitted"
              class="inline-flex items-center gap-2 rounded-lg border border-success/20 bg-success/10 px-3 py-1.5 text-sm text-success"
            >
              <Icon
                name="lucide:check-circle"
                class="h-4 w-4"
              />
              Feedback received
            </div>
          </div>

          <div
            v-if="!feedbackSubmitted"
            class="mt-6 space-y-5"
          >
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm text-text-muted">Rating</span>
              <div class="flex items-center gap-2">
                <button
                  v-for="value in 5"
                  :key="value"
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors"
                  :class="rating === value
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-border-muted'"
                  @click="rating = value"
                >
                  {{ value }}
                </button>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-text-primary">
                Comment (optional)
              </label>
              <textarea
                v-model="comment"
                rows="4"
                class="w-full rounded-xl border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="Tell us what stood out or what we could improve."
              />
            </div>

            <BaseInput
              v-model="tagsInput"
              label="Tags (optional)"
              placeholder="e.g. clarity, accuracy, completeness"
            />

            <p
              v-if="feedbackError"
              class="text-sm text-error"
            >
              {{ feedbackError }}
            </p>

            <div>
              <BaseButton
                variant="primary"
                size="sm"
                :disabled="isSubmittingFeedback"
                @click="handleSubmitFeedback"
              >
                <Icon
                  v-if="isSubmittingFeedback"
                  name="lucide:loader-2"
                  class="mr-2 h-4 w-4 animate-spin"
                />
                Submit Feedback
              </BaseButton>
            </div>
          </div>
        </section>

        <section class="no-print rounded-2xl border border-border-subtle bg-bg-elevated px-5 py-4">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <span
                v-if="completedDate"
                class="flex items-center gap-1.5"
              >
                <Icon
                  name="lucide:calendar"
                  class="h-4 w-4"
                />
                {{ completedDate.toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }) }}
              </span>
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
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                class="text-sm text-text-muted transition-colors hover:text-text-secondary"
                @click="handleGoBack"
              >
                Back to Briefings
              </button>

              <BaseButton
                v-if="generation.briefing"
                variant="secondary"
                size="sm"
                @click="router.push(`/${workspaceSlug}/briefings/${generation.briefing.slug}`)"
              >
                <Icon
                  name="lucide:refresh-cw"
                  class="mr-1.5 h-4 w-4"
                />
                Generate Again
              </BaseButton>
            </div>
          </div>
        </section>
      </div>
    </main>

    <div
      v-if="generation && !isLoading"
      class="no-print fixed bottom-0 left-0 right-0 border-t border-border-subtle bg-bg-elevated p-4 sm:hidden"
    >
      <div class="flex items-center gap-3">
        <BaseButton
          variant="secondary"
          class="flex-1"
          @click="handleDownload(BriefingOutputFormat.Pdf)"
        >
          <Icon
            name="lucide:download"
            class="mr-1.5 h-4 w-4"
          />
          PDF
        </BaseButton>
        <BaseButton
          variant="primary"
          class="flex-1"
          @click="handleShare"
        >
          <Icon
            name="lucide:share"
            class="mr-1.5 h-4 w-4"
          />
          Share
        </BaseButton>
      </div>
    </div>

    <BriefingsBriefingShareModal
      v-model="showShareModal"
      :generation="generation"
      @created="handleShareCreated"
    />
  </div>
</template>

<style>
/* Print-friendly styles */
@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  body {
    background: white;
  }

  .prose {
    max-width: 100% !important;
  }
}
</style>

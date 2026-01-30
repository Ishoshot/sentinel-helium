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

// Print handler
function handlePrint() {
  window.print();
}

// Go back
function handleGoBack() {
  router.push(`/${workspaceSlug.value}/briefings`);
}

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
  <div class="min-h-screen bg-bg-app">
    <!-- Header (No print) -->
    <header class="no-print sticky top-0 z-30 bg-bg-elevated/95 backdrop-blur-sm border-b border-border-subtle">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between gap-4">
          <!-- Left: Back & Title -->
          <div class="flex items-center gap-4 min-w-0">
            <button
              type="button"
              class="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-surface transition-all duration-200"
              @click="handleGoBack"
            >
              <Icon
                name="lucide:arrow-left"
                class="w-5 h-5"
              />
            </button>

            <div class="min-w-0">
              <BaseSkeleton
                v-if="isLoading"
                class="h-6 w-48"
              />
              <h1
                v-else-if="generation?.briefing"
                class="font-semibold text-text-primary truncate"
              >
                {{ generation.briefing.title }}
              </h1>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2">
            <!-- Toggle Excerpts -->
            <button
              v-if="hasExcerpts"
              type="button"
              class="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="showExcerpts
                ? 'bg-accent/10 text-accent'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-surface'"
              @click="showExcerpts = !showExcerpts"
            >
              <Icon
                name="lucide:share-2"
                class="w-4 h-4"
              />
              Excerpts
            </button>

            <!-- Print -->
            <button
              type="button"
              class="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-muted hover:text-text-secondary hover:bg-bg-surface rounded-lg transition-colors"
              @click="handlePrint"
            >
              <Icon
                name="lucide:printer"
                class="w-4 h-4"
              />
            </button>

            <!-- Download Dropdown -->
            <BaseDropdown
              :options="availableFormats.map(f => ({ label: f.toUpperCase(), value: f }))"
              placeholder="Download"
              menu-width="w-32"
              @update:model-value="(v) => handleDownload(v as BriefingOutputFormat)"
            >
              <template #trigger>
                <button
                  type="button"
                  class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-muted hover:text-text-secondary hover:bg-bg-surface rounded-lg transition-colors"
                  :disabled="isDownloading"
                >
                  <Icon
                    v-if="isDownloading"
                    name="lucide:loader-2"
                    class="w-4 h-4 animate-spin"
                  />
                  <Icon
                    v-else
                    name="lucide:download"
                    class="w-4 h-4"
                  />
                  <span class="hidden sm:inline">Download</span>
                </button>
              </template>
            </BaseDropdown>

            <!-- Share Button -->
            <BaseButton
              variant="primary"
              size="sm"
              @click="handleShare"
            >
              <Icon
                name="lucide:share"
                class="w-4 h-4 mr-1.5"
              />
              Share
            </BaseButton>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-6"
      >
        <BaseSkeleton class="h-10 w-3/4" />
        <BaseSkeleton class="h-6 w-1/2" />
        <div class="h-px bg-border-subtle my-8" />
        <BaseSkeleton class="h-4 w-full" />
        <BaseSkeleton class="h-4 w-full" />
        <BaseSkeleton class="h-4 w-4/5" />
        <BaseSkeleton class="h-4 w-full" />
        <BaseSkeleton class="h-4 w-3/4" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="text-center py-16"
      >
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-error/10 flex items-center justify-center">
          <Icon
            name="lucide:alert-circle"
            class="w-8 h-8 text-error"
          />
        </div>
        <h3 class="text-lg font-semibold text-text-primary mb-2">
          {{ error }}
        </h3>
        <p class="text-sm text-text-muted mb-6">
          We couldn't load this briefing. It may have been deleted or you don't have access.
        </p>
        <BaseButton
          variant="secondary"
          @click="handleGoBack"
        >
          <Icon
            name="lucide:arrow-left"
            class="w-4 h-4 mr-2"
          />
          Back to Briefings
        </BaseButton>
      </div>

      <!-- Briefing Content -->
      <div v-else-if="generation">
        <!-- Narrative Component -->
        <BriefingsBriefingNarrative
          :generation="generation"
          :show-achievements="true"
          :show-excerpts="showExcerpts"
        />

        <!-- Feedback -->
        <section class="mt-12 rounded-2xl border border-border-subtle bg-bg-elevated p-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-base font-semibold text-text-primary">
                How was this briefing?
              </h3>
              <p class="text-sm text-text-muted">
                Share quick feedback to help us improve.
              </p>
            </div>
            <div
              v-if="feedbackSubmitted"
              class="inline-flex items-center gap-2 text-sm text-success"
            >
              <Icon
                name="lucide:check-circle"
                class="w-4 h-4"
              />
              Feedback received
            </div>
          </div>

          <div
            v-if="!feedbackSubmitted"
            class="mt-4 space-y-4"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm text-text-muted">Rating</span>
              <div class="flex items-center gap-2">
                <button
                  v-for="value in 5"
                  :key="value"
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors"
                  :class="rating === value
                    ? 'border-accent-primary/40 bg-accent-primary/10 text-accent-primary'
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
                rows="3"
                class="w-full rounded-xl border border-border-subtle bg-bg-elevated px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
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
                  class="w-4 h-4 mr-2 animate-spin"
                />
                Submit Feedback
              </BaseButton>
            </div>
          </div>
        </section>

        <!-- Actions Footer (No print) -->
        <div class="no-print mt-12 pt-8 border-t border-border-subtle">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4 text-sm text-text-muted">
              <span
                v-if="completedDate"
                class="flex items-center gap-1.5"
              >
                <Icon
                  name="lucide:calendar"
                  class="w-4 h-4"
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
                class="text-sm text-text-muted hover:text-text-secondary transition-colors"
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
                  class="w-4 h-4 mr-1.5"
                />
                Generate Again
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Floating Actions (Mobile) -->
    <div
      v-if="generation && !isLoading"
      class="no-print fixed bottom-0 left-0 right-0 p-4 bg-bg-elevated/95 backdrop-blur-sm border-t border-border-subtle sm:hidden"
    >
      <div class="flex items-center gap-3">
        <BaseButton
          variant="secondary"
          class="flex-1"
          @click="handleDownload(BriefingOutputFormat.Pdf)"
        >
          <Icon
            name="lucide:download"
            class="w-4 h-4 mr-1.5"
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
            class="w-4 h-4 mr-1.5"
          />
          Share
        </BaseButton>
      </div>
    </div>

    <!-- Share Modal -->
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

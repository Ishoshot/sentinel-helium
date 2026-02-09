<script setup lang="ts">
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";
import { useBriefings } from "~/composables/briefings/useBriefings";
import { useBriefingGeneration } from "~/composables/briefings/useBriefingGeneration";
import { useAppToast } from "~/composables/shared/useAppToast";
import { BriefingGenerationStatus } from "~/types";
import type { Briefing, BriefingGeneration } from "~/types";

/**
 * Briefing Generation Page
 *
 * Shows parameter collection modal and real-time progress
 * of briefing generation with a polished experience.
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
const briefingSlug = computed(() => route.params.slug as string);
const generationIdFromQuery = computed(() => {
  const id = route.query.generation;
  return id ? Number(id) : null;
});

// Composables
const {
  briefings,
  currentBriefing,
  isLoadingBriefings,
  isWorkspaceEligible,
  workspaceRestrictionReason,
  fetchBriefings,
  fetchBriefing,
  fetchWorkspaceEligibility,
  generateBriefing,
} = useBriefings(workspaceId);

// Find the current briefing
const briefing = computed<Briefing | null>(() => {
  if (currentBriefing.value?.slug === briefingSlug.value) {
    return currentBriefing.value;
  }
  return briefings.value.find((b) => b.slug === briefingSlug.value) ?? null;
});

// State
const isInitializing = ref(true);
const currentGeneration = ref<BriefingGeneration | null>(null);
const isStartingGeneration = ref(false);
const showGenerateModal = ref(false);

// Generation tracking composable
const {
  generation: trackedGeneration,
  isPolling,
  isComplete,
  isFailed,
  isProcessing,
  isInProgress,
  progress,
  startTracking,
  stopTracking,
} = useBriefingGeneration(workspaceId);

// Watch for generation completion
watch(isComplete, (completed) => {
  if (completed && trackedGeneration.value) {
    currentGeneration.value = trackedGeneration.value;
    toast.success("Your briefing is ready!");
  }
});

// Watch for generation failure
watch(isFailed, (failed) => {
  if (failed && trackedGeneration.value) {
    currentGeneration.value = trackedGeneration.value;
    toast.error("Briefing generation failed");
  }
});

// Initial load
onMounted(async () => {
  try {
    await fetchBriefings();
    await fetchWorkspaceEligibility();
    if (briefingSlug.value) {
      await fetchBriefing(briefingSlug.value);
    }

    // If we have a generation ID from query, start tracking it
    if (generationIdFromQuery.value) {
      startTracking(generationIdFromQuery.value);
    }
  } finally {
    isInitializing.value = false;
  }
});

// Cleanup on unmount
onUnmounted(() => {
  stopTracking();
});

// Open generate modal
function handleOpenGenerateModal() {
  showGenerateModal.value = true;
}

// Start a new generation with parameters
async function handleGenerate(parameters: Record<string, unknown>) {
  if (!briefing.value) return;
  if (!isWorkspaceEligible.value) {
    toast.error(
      workspaceRestrictionReason.value || "Briefing generation is currently unavailable."
    );
    return;
  }

  showGenerateModal.value = false;
  isStartingGeneration.value = true;

  try {
    const generation = await generateBriefing(briefing.value.id, { parameters });
    if (generation) {
      currentGeneration.value = generation;

      // Update URL with generation ID
      router.replace({
        query: { generation: generation.id },
      });

      // Start tracking
      startTracking(generation.id);
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to start generation";
    toast.error(message);
  } finally {
    isStartingGeneration.value = false;
  }
}

// View completed briefing
function handleViewBriefing() {
  if (trackedGeneration.value) {
    router.push(
      `/${workspaceSlug.value}/briefings/generations/${trackedGeneration.value.id}`
    );
  }
}

// Retry generation
function handleRetry() {
  stopTracking();
  currentGeneration.value = null;

  // Clear query param
  router.replace({ query: {} });

  handleOpenGenerateModal();
}

// Go back to briefings list
function handleGoBack() {
  router.push(`/${workspaceSlug.value}/briefings`);
}

// Computed states
const showStartState = computed(() => {
  return !isInitializing.value && !currentGeneration.value && !generationIdFromQuery.value;
});

const showProgressState = computed(() => {
  return isInProgress.value && !isComplete.value && !isFailed.value;
});

const showCompleteState = computed(() => {
  return isComplete.value;
});

const showFailedState = computed(() => {
  return isFailed.value;
});

// Check if briefing has parameters
const hasParameters = computed(() => {
  const schema = briefing.value?.parameter_schema;
  return schema && Object.keys(schema.properties || {}).length > 0;
});

const isGenerationAllowed = computed(() => isWorkspaceEligible.value);
const restrictionReason = computed(() => workspaceRestrictionReason.value);
</script>

<template>
  <BaseContainer>
    <div class="-mx-6 -my-6 min-h-[calc(100vh-64px)] bg-bg-app sm:-mx-8 sm:-my-8 lg:-mx-12 lg:-my-10">
      <header class="border-b border-border-subtle bg-bg-elevated">
        <div class="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
          <div class="flex items-start gap-4">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md p-1 text-text-muted transition-colors hover:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              aria-label="Back to briefings"
              @click="handleGoBack"
            >
              <Icon
                name="lucide:arrow-left"
                class="h-5 w-5"
              />
            </button>

            <div class="min-w-0 flex-1">
              <p class="text-xs font-medium uppercase tracking-wider text-text-muted">
                Briefing Template
              </p>
              <BaseSkeleton
                v-if="isLoadingBriefings"
                class="mt-2 h-8 w-60"
              />
              <h1
                v-else
                class="mt-1 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
              >
                <span class="text-balance">{{ briefing?.title ?? 'Briefing' }}</span>
              </h1>
              <p
                v-if="briefing?.description"
                class="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary"
              >
                <span class="text-pretty">{{ briefing.description }}</span>
              </p>
            </div>

            <div
              v-if="briefing?.requires_ai"
              class="hidden shrink-0 items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent sm:flex"
            >
              <Icon
                name="lucide:sparkles"
                class="h-3.5 w-3.5"
              />
              AI-Powered
            </div>
          </div>
        </div>
      </header>

      <main class="mx-auto flex w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div
          v-if="isInitializing"
          class="mx-auto w-full rounded-2xl border border-border-subtle bg-bg-elevated p-8 shadow-elevated sm:p-10"
        >
          <div class="flex items-center gap-3 text-text-secondary">
            <Icon
              name="lucide:loader-2"
              class="h-5 w-5 animate-spin"
            />
            <p class="text-sm">
              Loading briefing...
            </p>
          </div>
        </div>

        <div
          v-else-if="!briefing && !isLoadingBriefings"
          class="mx-auto w-full rounded-2xl border border-error/20 bg-bg-elevated p-8 shadow-elevated sm:p-10"
        >
          <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-error/10">
            <Icon
              name="lucide:file-question"
              class="h-6 w-6 text-error"
            />
          </div>
          <h2 class="text-xl font-semibold tracking-tight text-text-primary">
            Briefing not found
          </h2>
          <p class="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
            This briefing does not exist or you do not have access.
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
          v-else-if="showStartState"
          class="mx-auto w-full rounded-2xl border border-border-subtle bg-bg-elevated p-8 shadow-elevated sm:p-10"
        >
          <div class="flex items-start gap-5">
            <div class="mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface">
              <Icon
                :name="briefing?.icon ?? 'lucide:file-text'"
                class="h-7 w-7 text-text-secondary"
              />
            </div>
            <div class="min-w-0">
              <h2 class="text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
                Ready to generate
              </h2>
              <p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
                <span class="text-pretty">{{ briefing?.description }}</span>
              </p>
            </div>
          </div>

          <div class="mt-8 flex flex-wrap gap-3">
            <div
              v-if="hasParameters"
              class="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm text-text-secondary"
            >
              <Icon
                name="lucide:sliders"
                class="h-4 w-4"
              />
              Configure options before generating
            </div>
            <div
              v-if="briefing?.requires_ai"
              class="inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-sm text-accent"
            >
              <Icon
                name="lucide:cpu"
                class="h-4 w-4"
              />
              AI narrative enabled
            </div>
          </div>

          <div class="mt-8 border-t border-border-subtle pt-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <BaseButton
                variant="primary"
                size="lg"
                :disabled="isStartingGeneration || !isGenerationAllowed"
                @click="handleOpenGenerateModal"
              >
                <Icon
                  v-if="isStartingGeneration"
                  name="lucide:loader-2"
                  class="mr-2 h-5 w-5 animate-spin"
                />
                <Icon
                  v-else
                  name="lucide:sparkles"
                  class="mr-2 h-5 w-5"
                />
                {{ isStartingGeneration ? 'Starting...' : 'Generate Briefing' }}
              </BaseButton>

              <button
                type="button"
                class="text-sm text-text-muted transition-colors hover:text-text-secondary"
                @click="handleGoBack"
              >
                Cancel
              </button>
            </div>

            <p
              v-if="!isGenerationAllowed && restrictionReason"
              class="mt-4 text-sm text-text-muted"
            >
              {{ restrictionReason }}
            </p>
          </div>
        </div>

        <div
          v-else-if="showProgressState"
          class="mx-auto w-full rounded-2xl border border-border-subtle bg-bg-elevated p-8 shadow-elevated sm:p-10"
        >
          <h2 class="text-xl font-semibold tracking-tight text-text-primary">
            Generating briefing
          </h2>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
            We are processing your workspace data and composing your narrative.
          </p>

          <div class="mt-7">
            <BriefingsBriefingProgress
              variant="fullscreen"
              :progress="progress"
              :message="trackedGeneration?.progress_message"
              :status="trackedGeneration?.status as BriefingGenerationStatus"
            />
          </div>

          <p class="mt-4 text-xs text-text-muted">
            {{ isProcessing ? 'Processing your workspace data...' : isPolling ? 'Tracking live progress...' : 'Waiting for updates...' }}
          </p>
        </div>

        <div
          v-else-if="showCompleteState"
          class="mx-auto w-full rounded-2xl border border-success/20 bg-bg-elevated p-8 shadow-elevated sm:p-10"
        >
          <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
            <Icon
              name="lucide:check"
              class="h-6 w-6 text-success"
            />
          </div>

          <h2 class="text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
            Your briefing is ready
          </h2>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
            {{ briefing?.title }} has been generated successfully.
            View the full narrative and share it with your team.
          </p>

          <div
            v-if="trackedGeneration?.achievements?.length"
            class="mt-8"
          >
            <BriefingsBriefingAchievements
              :achievements="trackedGeneration.achievements"
              variant="compact"
              :animated="true"
            />
          </div>

          <div class="mt-8 border-t border-success/20 pt-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <BaseButton
                variant="primary"
                size="lg"
                @click="handleViewBriefing"
              >
                <Icon
                  name="lucide:eye"
                  class="mr-2 h-5 w-5"
                />
                View Briefing
              </BaseButton>

              <button
                type="button"
                class="text-sm text-text-muted transition-colors hover:text-text-secondary"
                @click="handleGoBack"
              >
                Back to Briefings
              </button>
            </div>
          </div>
        </div>

        <div
          v-else-if="showFailedState"
          class="mx-auto w-full rounded-2xl border border-error/20 bg-bg-elevated p-8 shadow-elevated sm:p-10"
        >
          <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-error/10">
            <Icon
              name="lucide:alert-circle"
              class="h-6 w-6 text-error"
            />
          </div>

          <h2 class="text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
            Generation failed
          </h2>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
            Something went wrong while generating your briefing.
          </p>

          <div
            v-if="trackedGeneration?.error_message"
            class="mt-4 rounded-xl border border-error/20 bg-error/10 p-4"
          >
            <p class="text-sm text-error">
              {{ trackedGeneration.error_message }}
            </p>
          </div>

          <div class="mt-8 border-t border-error/20 pt-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <BaseButton
                variant="primary"
                size="lg"
                @click="handleRetry"
              >
                <Icon
                  name="lucide:refresh-cw"
                  class="mr-2 h-5 w-5"
                />
                Try Again
              </BaseButton>

              <button
                type="button"
                class="text-sm text-text-muted transition-colors hover:text-text-secondary"
                @click="handleGoBack"
              >
                Back to Briefings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <BriefingsBriefingGenerateModal
      v-if="briefing"
      v-model="showGenerateModal"
      :briefing="briefing"
      :loading="isStartingGeneration"
      @generate="handleGenerate"
    />
  </BaseContainer>
</template>

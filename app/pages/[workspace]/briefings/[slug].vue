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
  isLoadingBriefings,
  fetchBriefings,
  generateBriefing,
} = useBriefings(workspaceId);

// Find the current briefing
const briefing = computed<Briefing | null>(() => {
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
</script>

<template>
  <BaseContainer>
    <div class="min-h-[calc(100vh-64px)] flex flex-col -m-4 sm:-m-6 lg:-m-8">
      <!-- Header -->
      <div class="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200 bg-white shrink-0">
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
            @click="handleGoBack"
          >
            <Icon
              name="lucide:arrow-left"
              class="w-5 h-5"
            />
          </button>

          <div class="flex-1 min-w-0">
            <BaseSkeleton
              v-if="isLoadingBriefings"
              class="h-7 w-48"
            />
            <h1
              v-else
              class="text-xl font-semibold text-gray-900 truncate"
            >
              {{ briefing?.title ?? 'Briefing' }}
            </h1>
            <p
              v-if="briefing?.description"
              class="text-sm text-gray-500 truncate mt-1"
            >
              {{ briefing.description }}
            </p>
          </div>

          <!-- AI Badge -->
          <div
            v-if="briefing?.requires_ai"
            class="shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md"
          >
            <Icon
              name="lucide:sparkles"
              class="w-3.5 h-3.5"
            />
            AI-Powered
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <!-- Loading State -->
        <div
          v-if="isInitializing"
          class="text-center"
        >
          <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
            <Icon
              name="lucide:loader-2"
              class="w-8 h-8 text-gray-400 animate-spin"
            />
          </div>
          <p class="text-sm text-gray-500">
            Loading briefing...
          </p>
        </div>

        <!-- Not Found State -->
        <div
          v-else-if="!briefing && !isLoadingBriefings"
          class="text-center"
        >
          <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-red-50 flex items-center justify-center">
            <Icon
              name="lucide:file-question"
              class="w-8 h-8 text-red-500"
            />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Briefing not found
          </h3>
          <p class="text-sm text-gray-500 mb-6">
            This briefing doesn't exist or you don't have access to it.
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

        <!-- Start Generation State -->
        <div
          v-else-if="showStartState"
          class="text-center max-w-lg"
        >
          <!-- Icon -->
          <div class="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Icon
              :name="briefing?.icon ?? 'lucide:file-text'"
              class="w-10 h-10 text-gray-600"
            />
          </div>

          <h2 class="text-2xl font-bold text-gray-900 mb-3">
            Ready to generate?
          </h2>
          <p class="text-gray-600 mb-8 leading-relaxed">
            {{ briefing?.description }}
          </p>

          <!-- Configuration hint -->
          <div
            v-if="hasParameters"
            class="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm text-gray-600 bg-gray-100 rounded-lg"
          >
            <Icon
              name="lucide:sliders"
              class="w-4 h-4"
            />
            Configure options before generating
          </div>

          <div class="flex flex-col items-center gap-4">
            <BaseButton
              variant="primary"
              size="lg"
              :disabled="isStartingGeneration"
              @click="handleOpenGenerateModal"
            >
              <Icon
                v-if="isStartingGeneration"
                name="lucide:loader-2"
                class="w-5 h-5 mr-2 animate-spin"
              />
              <Icon
                v-else
                name="lucide:sparkles"
                class="w-5 h-5 mr-2"
              />
              {{ isStartingGeneration ? 'Starting...' : 'Generate Briefing' }}
            </BaseButton>

            <button
              type="button"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              @click="handleGoBack"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Progress State -->
        <div
          v-else-if="showProgressState"
          class="w-full max-w-2xl"
        >
          <BriefingsBriefingProgress
            variant="fullscreen"
            :progress="progress"
            :message="trackedGeneration?.progress_message"
            :status="trackedGeneration?.status as BriefingGenerationStatus"
          />
        </div>

        <!-- Complete State -->
        <div
          v-else-if="showCompleteState"
          class="text-center max-w-lg"
        >
          <!-- Success Icon -->
          <div class="w-20 h-20 mx-auto mb-8 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Icon
              name="lucide:check"
              class="w-10 h-10 text-emerald-500"
            />
          </div>

          <h2 class="text-2xl font-bold text-gray-900 mb-3">
            Your briefing is ready!
          </h2>
          <p class="text-gray-600 mb-8">
            {{ briefing?.title }} has been generated successfully.
            View the full narrative and share it with your team.
          </p>

          <!-- Achievements preview -->
          <div
            v-if="trackedGeneration?.achievements?.length"
            class="mb-8"
          >
            <BriefingsBriefingAchievements
              :achievements="trackedGeneration.achievements"
              variant="compact"
              :animated="true"
            />
          </div>

          <div class="flex flex-col items-center gap-4">
            <BaseButton
              variant="primary"
              size="lg"
              @click="handleViewBriefing"
            >
              <Icon
                name="lucide:eye"
                class="w-5 h-5 mr-2"
              />
              View Briefing
            </BaseButton>

            <button
              type="button"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              @click="handleGoBack"
            >
              Back to Briefings
            </button>
          </div>
        </div>

        <!-- Failed State -->
        <div
          v-else-if="showFailedState"
          class="text-center max-w-lg"
        >
          <!-- Error Icon -->
          <div class="w-20 h-20 mx-auto mb-8 rounded-2xl bg-red-50 flex items-center justify-center">
            <Icon
              name="lucide:alert-circle"
              class="w-10 h-10 text-red-500"
            />
          </div>

          <h2 class="text-2xl font-bold text-gray-900 mb-3">
            Generation failed
          </h2>
          <p class="text-gray-600 mb-4">
            Something went wrong while generating your briefing.
          </p>

          <div
            v-if="trackedGeneration?.error_message"
            class="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-left"
          >
            <p class="text-sm text-red-600">
              {{ trackedGeneration.error_message }}
            </p>
          </div>

          <div class="flex flex-col items-center gap-4">
            <BaseButton
              variant="primary"
              size="lg"
              @click="handleRetry"
            >
              <Icon
                name="lucide:refresh-cw"
                class="w-5 h-5 mr-2"
              />
              Try Again
            </BaseButton>

            <button
              type="button"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              @click="handleGoBack"
            >
              Back to Briefings
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Modal -->
    <BriefingsBriefingGenerateModal
      v-if="briefing"
      v-model="showGenerateModal"
      :briefing="briefing"
      :loading="isStartingGeneration"
      @generate="handleGenerate"
    />
  </BaseContainer>
</template>

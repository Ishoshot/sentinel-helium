<script setup lang="ts">
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";
import { useBriefings } from "~/composables/briefings/useBriefings";
import { useAppToast } from "~/composables/shared/useAppToast";
import type { Briefing, BriefingSubscription } from "~/types";

/**
 * Briefings Hub - Browse and generate AI-powered briefings
 *
 * This is designed to be "the talk of the town" - a premium,
 * polished experience that showcases narrative intelligence.
 */

definePageMeta({
  middleware: ["auth", "workspace"],
});

const router = useRouter();
const workspaceStore = useWorkspaceStore();
const toast = useAppToast();

const workspaceId = computed(() => workspaceStore.currentWorkspaceId);
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug ?? "");

// Composables
const {
  briefings,
  generations,
  subscriptions,
  pagination,
  isLoadingBriefings,
  isLoadingGenerations,
  error,
  fetchBriefings,
  fetchRecentGenerations,
  fetchGenerations,
  fetchSubscriptions,
  generateBriefing,
} = useBriefings(workspaceId);

// State
const isInitializing = ref(true);
const activeTab = ref<"templates" | "history">("templates");
const selectedBriefing = ref<Briefing | null>(null);
const isGenerating = ref(false);
const showGenerateModal = ref(false);
const showInfoModal = ref(false);
const infoBriefing = ref<Briefing | null>(null);

// Modal states
const showSubscribeModal = ref(false);
const showManageSubscriptionModal = ref(false);
const selectedSubscription = ref<BriefingSubscription | null>(null);

// Get subscription for a briefing
function getSubscription(briefingId: number): BriefingSubscription | null {
  return subscriptions.value.find((s) => s.briefing_id === briefingId) ?? null;
}

// History filters
const historyFilters = ref({
  search: '',
  status: [] as string[],
  briefingId: null as number | null,
  dateFrom: '',
  dateTo: '',
  sort: 'created_at',
  direction: 'desc' as 'asc' | 'desc',
})

// Initial data fetch
onMounted(async () => {
  try {
    if (workspaceId.value) {
      await Promise.all([
        fetchBriefings(),
        fetchGenerations({ perPage: 20 }),
        fetchSubscriptions(),
      ]);
    }
  } finally {
    isInitializing.value = false;
  }
});

// Handle info - show expanded briefing details
function handleInfo(briefing: Briefing) {
  infoBriefing.value = briefing;
  showInfoModal.value = true;
}

// Handle generate from info modal
function handleGenerateFromInfo(briefing: Briefing) {
  showInfoModal.value = false;
  infoBriefing.value = null;
  handleGenerate(briefing);
}

// Handle subscribe from info modal
function handleSubscribeFromInfo(briefing: Briefing) {
  showInfoModal.value = false;
  infoBriefing.value = null;
  handleSubscribe(briefing);
}

// Handle generate - open modal to collect parameters
function handleGenerate(briefing: Briefing) {
  selectedBriefing.value = briefing;
  showGenerateModal.value = true;
}

// Handle actual generation after modal submission
async function handleConfirmGenerate(parameters: Record<string, unknown>) {
  if (!selectedBriefing.value) return;

  showGenerateModal.value = false;
  isGenerating.value = true;

  try {
    const generation = await generateBriefing(selectedBriefing.value.id, { parameters });
    if (generation) {
      // Navigate to generation progress page
      router.push(`/${workspaceSlug.value}/briefings/${selectedBriefing.value.slug}?generation=${generation.id}`);
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to start generation";
    toast.error(message);
  } finally {
    isGenerating.value = false;
    selectedBriefing.value = null;
  }
}

// Handle subscribe
function handleSubscribe(briefing: Briefing) {
  selectedBriefing.value = briefing;
  showSubscribeModal.value = true;
}

// Handle manage subscription
function handleManageSubscription(subscription: BriefingSubscription) {
  selectedSubscription.value = subscription;
  showManageSubscriptionModal.value = true;
}

// View generation
function handleViewGeneration(generationId: number) {
  router.push(`/${workspaceSlug.value}/briefings/generations/${generationId}`);
}

// Handle filters change
function handleFiltersChange(filters: typeof historyFilters.value) {
  historyFilters.value = filters;
  fetchGenerations({
    page: 1, // Reset to first page on filter change
    perPage: 20,
    search: filters.search || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    briefingId: filters.briefingId || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    sort: filters.sort,
    direction: filters.direction,
  });
}

// Handle page change
function handlePageChange(page: number) {
  fetchGenerations({
    page,
    perPage: 20,
    search: historyFilters.value.search || undefined,
    status: historyFilters.value.status.length > 0 ? historyFilters.value.status : undefined,
    briefingId: historyFilters.value.briefingId || undefined,
    dateFrom: historyFilters.value.dateFrom || undefined,
    dateTo: historyFilters.value.dateTo || undefined,
    sort: historyFilters.value.sort,
    direction: historyFilters.value.direction,
  });
}

// Statistics
const totalGenerations = computed(() => pagination.value.total);
const activeSubscriptions = computed(
  () => subscriptions.value.filter((s) => s.is_active).length
);

// Empty states
const hasTemplates = computed(() => briefings.value.length > 0);
const hasHistory = computed(() => generations.value.length > 0);
</script>

<template>
  <BaseContainer>
    <div class="min-h-[calc(100vh-64px)] -m-4 sm:-m-6 lg:-m-8">
      <!-- Hero Section -->
      <div class="bg-bg-elevated border-b border-border-subtle">
        <div class="px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div class="max-w-4xl">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-xs font-medium text-accent bg-accent/10 rounded-full">
              <Icon
                name="lucide:sparkles"
                class="w-3.5 h-3.5"
              />
              AI-Powered Intelligence
            </div>

            <!-- Title -->
            <h1 class="text-4xl lg:text-5xl font-bold text-text-primary tracking-tight mb-4">
              Briefings
            </h1>

            <!-- Description -->
            <p class="text-lg text-text-secondary max-w-2xl leading-relaxed">
              Transform your development data into narrative intelligence.
              Get personalized updates, celebrate achievements, and share
              progress with stakeholders.
            </p>

            <!-- Quick Stats -->
            <div class="flex items-center gap-6 mt-8">
              <div class="flex items-center gap-2 text-sm text-text-muted">
                <div class="w-8 h-8 rounded-lg bg-bg-surface flex items-center justify-center">
                  <Icon
                    name="lucide:file-text"
                    class="w-4 h-4 text-text-secondary"
                  />
                </div>
                <span>
                  <strong class="text-text-primary">{{ totalGenerations }}</strong>
                  generated
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm text-text-muted">
                <div class="w-8 h-8 rounded-lg bg-bg-surface flex items-center justify-center">
                  <Icon
                    name="lucide:bell"
                    class="w-4 h-4 text-text-secondary"
                  />
                </div>
                <span>
                  <strong class="text-text-primary">{{ activeSubscriptions }}</strong>
                  active subscriptions
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <!-- Tab Navigation -->
        <div class="flex items-center gap-1 p-1 mb-8 bg-bg-surface rounded-xl w-fit">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="
              activeTab === 'templates'
                ? 'bg-bg-elevated text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            "
            @click="activeTab = 'templates'"
          >
            <span class="flex items-center gap-2">
              <Icon
                name="lucide:layout-grid"
                class="w-4 h-4"
              />
              Templates
            </span>
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="
              activeTab === 'history'
                ? 'bg-bg-elevated text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            "
            @click="activeTab = 'history'"
          >
            <span class="flex items-center gap-2">
              <Icon
                name="lucide:history"
                class="w-4 h-4"
              />
              History
              <span
                v-if="totalGenerations > 0"
                class="px-1.5 py-0.5 text-xs bg-bg-surface rounded-md"
              >
                {{ totalGenerations }}
              </span>
            </span>
          </button>
        </div>

        <!-- Templates Tab -->
        <div v-if="activeTab === 'templates'">
          <!-- Loading State -->
          <div
            v-if="isLoadingBriefings || isInitializing"
            class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <BaseSkeleton
              v-for="i in 6"
              :key="i"
              class="h-72 rounded-2xl"
            />
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
              Failed to load briefings
            </h3>
            <p class="text-sm text-text-muted mb-6">
              {{ error }}
            </p>
            <BaseButton
              variant="secondary"
              @click="fetchBriefings()"
            >
              <Icon
                name="lucide:refresh-cw"
                class="w-4 h-4 mr-2"
              />
              Try again
            </BaseButton>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="!hasTemplates"
            class="text-center py-16"
          >
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-surface flex items-center justify-center">
              <Icon
                name="lucide:file-text"
                class="w-8 h-8 text-text-muted"
              />
            </div>
            <h3 class="text-lg font-semibold text-text-primary mb-2">
              No briefing templates available
            </h3>
            <p class="text-sm text-text-muted max-w-md mx-auto">
              Briefing templates will appear here once they're configured for your workspace.
            </p>
          </div>

          <!-- Briefing Templates Grid -->
          <div
            v-else
            class="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
          >
            <BriefingsBriefingCard
              v-for="briefing in briefings"
              :key="briefing.id"
              :briefing="briefing"
              :subscription="getSubscription(briefing.id)"
              :is-eligible="true"
              @generate="handleGenerate"
              @subscribe="handleSubscribe"
              @manage="handleManageSubscription"
              @info="handleInfo"
            />
          </div>
        </div>

        <!-- History Tab -->
        <div v-else-if="activeTab === 'history'">
          <!-- Filters -->
          <BriefingsHistoryFilters
            :briefings="briefings"
            @filters-change="handleFiltersChange"
          />

          <!-- Loading State -->
          <div
            v-if="isLoadingGenerations || isInitializing"
            class="space-y-4 mt-6"
          >
            <BaseSkeleton
              v-for="i in 5"
              :key="i"
              class="h-20 rounded-xl"
            />
          </div>

          <!-- Empty State -->
          <div
            v-else-if="!hasHistory"
            class="text-center py-16"
          >
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-surface flex items-center justify-center">
              <Icon
                name="lucide:history"
                class="w-8 h-8 text-text-muted"
              />
            </div>
            <h3 class="text-lg font-semibold text-text-primary mb-2">
              {{ historyFilters.search || historyFilters.status.length > 0 || historyFilters.briefingId || historyFilters.dateFrom || historyFilters.dateTo ? 'No results found' : 'No briefings generated yet' }}
            </h3>
            <p class="text-sm text-text-muted max-w-md mx-auto mb-6">
              {{ historyFilters.search || historyFilters.status.length > 0 || historyFilters.briefingId || historyFilters.dateFrom || historyFilters.dateTo ? 'Try adjusting your filters to find what you\'re looking for.' : 'Generate your first briefing to see it here. Each generation creates a unique narrative based on your latest activity.' }}
            </p>
            <BaseButton
              variant="primary"
              @click="activeTab = 'templates'"
            >
              <Icon
                name="lucide:sparkles"
                class="w-4 h-4 mr-2"
              />
              Browse Templates
            </BaseButton>
          </div>

          <!-- Generations List -->
          <div
            v-else
            class="mt-6"
          >
            <div class="space-y-4">
              <BriefingsBriefingGenerationCard
                v-for="generation in generations"
                :key="generation.id"
                :generation="generation"
                :workspace-slug="workspaceSlug"
                compact
                @view="handleViewGeneration(generation.id)"
              />
            </div>

            <!-- Pagination -->
            <BriefingsPagination
              v-if="pagination.lastPage > 1"
              :current-page="pagination.currentPage"
              :last-page="pagination.lastPage"
              :total="pagination.total"
              :from="pagination.from"
              :to="pagination.to"
              @page-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Info Modal -->
    <BriefingsBriefingInfoModal
      v-if="infoBriefing"
      v-model="showInfoModal"
      :briefing="infoBriefing"
      :subscription="getSubscription(infoBriefing.id)"
      @generate="handleGenerateFromInfo"
      @subscribe="handleSubscribeFromInfo"
    />

    <!-- Generate Modal -->
    <BriefingsBriefingGenerateModal
      v-if="selectedBriefing"
      v-model="showGenerateModal"
      :briefing="selectedBriefing"
      :loading="isGenerating"
      @generate="handleConfirmGenerate"
    />

    <!-- Generate Loading Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isGenerating"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Icon
              name="lucide:loader-2"
              class="w-8 h-8 text-accent animate-spin"
            />
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">
            Starting Generation
          </h3>
          <p class="text-sm text-white/70">
            Preparing {{ selectedBriefing?.title }}...
          </p>
        </div>
      </div>
    </Transition>
  </BaseContainer>
</template>

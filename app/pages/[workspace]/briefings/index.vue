<script setup lang="ts">
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";
import { useBriefings } from "~/composables/briefings/useBriefings";
import { useSlack } from "~/composables/integrations/useSlack";
import { useAppToast } from "~/composables/shared/useAppToast";
import type { Briefing, BriefingSubscription } from "~/types";
import BaseContainer from "~/components/base/BaseContainer.vue";

/**
 * Briefings Hub - AI-powered narrative intelligence
 *
 * Flagship feature page with immersive design
 */

definePageMeta({
  middleware: ["auth", "workspace"],
});

const router = useRouter();
const workspaceStore = useWorkspaceStore();
const toast = useAppToast();

const workspaceId = computed(() => workspaceStore.currentWorkspaceId);
const workspaceSlug = computed(() => workspaceStore.currentWorkspaceSlug ?? "");

const {
  briefings,
  generations,
  subscriptions,
  pagination,
  isLoadingBriefings,
  isLoadingGenerations,
  isLoadingWorkspaceEligibility,
  isWorkspaceEligible,
  workspaceRestrictionReason,
  error,
  fetchBriefings,
  fetchGenerations,
  fetchSubscriptions,
  fetchWorkspaceEligibility,
  generateBriefing,
} = useBriefings(workspaceId);

const { isConnected: isSlackConnected, fetchIntegration: fetchSlackIntegration } = useSlack(workspaceId);

const isInitializing = ref(true);
const isPageReady = ref(false);

const activeTab = ref<"templates" | "history">("templates");
const selectedBriefing = ref<Briefing | null>(null);
const isGenerating = ref(false);
const showGenerateModal = ref(false);
const showInfoModal = ref(false);
const infoBriefing = ref<Briefing | null>(null);

const showSubscribeModal = ref(false);
const showManageSubscriptionModal = ref(false);
const selectedSubscription = ref<BriefingSubscription | null>(null);

function getSubscription(briefingId: number): BriefingSubscription | null {
  return subscriptions.value.find((s) => s.briefing_id === briefingId) ?? null;
}

const historyFilters = ref({
  search: '',
  status: [] as string[],
  briefingId: null as number | null,
  dateFrom: '',
  dateTo: '',
  sort: 'created_at',
  direction: 'desc' as 'asc' | 'desc',
})

onMounted(async () => {
  try {
    if (workspaceId.value) {
      await Promise.all([
        fetchBriefings(),
        fetchGenerations({ perPage: 20 }),
        fetchSubscriptions(),
        fetchWorkspaceEligibility(),
        fetchSlackIntegration(),
      ]);
    }
  } finally {
    isInitializing.value = false;
    setTimeout(() => {
      isPageReady.value = true;
    }, 100);
  }
});

function handleInfo(briefing: Briefing) {
  infoBriefing.value = briefing;
  showInfoModal.value = true;
}

function handleViewFromInfo(briefing: Briefing) {
  showInfoModal.value = false;
  infoBriefing.value = null;
  router.push(`/${workspaceSlug.value}/briefings/${briefing.slug}`);
}

function handleSubscribeFromInfo(briefing: Briefing) {
  showInfoModal.value = false;
  infoBriefing.value = null;
  handleSubscribe(briefing);
}

function handleGenerate(briefing: Briefing) {
  if (!isWorkspaceEligible.value) {
    toast.error(workspaceRestrictionReason.value || "Briefing generation is currently unavailable.");
    return;
  }
  selectedBriefing.value = briefing;
  showGenerateModal.value = true;
}

async function handleConfirmGenerate(parameters: Record<string, unknown>) {
  if (!selectedBriefing.value) return;

  showGenerateModal.value = false;
  isGenerating.value = true;

  try {
    const generation = await generateBriefing(selectedBriefing.value.id, { parameters });
    if (generation) {
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

function handleSubscribe(briefing: Briefing) {
  selectedBriefing.value = briefing;
  showSubscribeModal.value = true;
}

function handleManageSubscription(subscription: BriefingSubscription) {
  selectedSubscription.value = subscription;
  showManageSubscriptionModal.value = true;
}

function handleSubscriptionCreated() {
  toast.success("Subscription created successfully");
  fetchSubscriptions();
}

function handleSubscriptionUpdated() {
  toast.success("Subscription updated successfully");
  fetchSubscriptions();
}

function handleSubscriptionCancelled() {
  toast.success("Subscription cancelled");
  fetchSubscriptions();
}

function handleViewGeneration(generationId: number) {
  router.push(`/${workspaceSlug.value}/briefings/generations/${generationId}`);
}

function handleFiltersChange(filters: typeof historyFilters.value) {
  historyFilters.value = filters;
  fetchGenerations({
    page: 1,
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

const totalGenerations = computed(() => pagination.value.total);
const activeSubscriptions = computed(
  () => subscriptions.value.filter((s) => s.is_active).length
);

const hasTemplates = computed(() => briefings.value.length > 0);
const hasHistory = computed(() => generations.value.length > 0);

// Featured briefing (first one or most popular)
const featuredBriefing = computed(() => briefings.value[0] ?? null);
const otherBriefings = computed(() => briefings.value.slice(1));

// Recent generations for quick access
const recentGenerations = computed(() => generations.value.slice(0, 3));
</script>

<template>
  <BaseContainer>
    <div class="min-h-screen">
      <div class="relative mx-auto">
        <!-- Page Header -->
        <header class="mb-12">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1">
                <span class="relative flex size-2">
                  <span class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                  <span class="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
                <span class="text-xs font-medium text-accent">AI-Powered</span>
              </div>
              <h1 class="text-3xl font-bold tracking-tight text-text-primary lg:text-4xl">
                Briefings
              </h1>
              <p class="mt-2 max-w-2xl text-base text-text-secondary">
                Transform your development data into compelling narratives. Celebrate achievements, track progress, and keep your team aligned.
              </p>
            </div>

            <!-- Quick Stats -->
            <div class="flex items-center gap-6 rounded-2xl border border-border-subtle bg-bg-elevated px-6 py-4 shadow-sm backdrop-blur-sm">
              <template v-if="isInitializing">
                <div class="text-center">
                  <div class="mx-auto h-7 w-8 animate-pulse rounded bg-bg-surface" />
                  <div class="mt-1 h-3 w-16 animate-pulse rounded bg-bg-surface" />
                </div>
                <div class="h-8 w-px bg-border-subtle" />
                <div class="text-center">
                  <div class="mx-auto h-7 w-8 animate-pulse rounded bg-bg-surface" />
                  <div class="mt-1 h-3 w-12 animate-pulse rounded bg-bg-surface" />
                </div>
                <div class="h-8 w-px bg-border-subtle" />
                <div class="text-center">
                  <div class="mx-auto h-7 w-8 animate-pulse rounded bg-bg-surface" />
                  <div class="mt-1 h-3 w-16 animate-pulse rounded bg-bg-surface" />
                </div>
              </template>
              <template v-else>
                <div class="text-center">
                  <p class="text-2xl font-bold tabular-nums text-text-primary">
                    {{ totalGenerations }}
                  </p>
                  <p class="text-xs text-text-muted">
                    Generated
                  </p>
                </div>
                <div class="h-8 w-px bg-border-subtle" />
                <div class="text-center">
                  <p class="text-2xl font-bold tabular-nums text-text-primary">
                    {{ activeSubscriptions }}
                  </p>
                  <p class="text-xs text-text-muted">
                    Active
                  </p>
                </div>
                <div class="h-8 w-px bg-border-subtle" />
                <div class="text-center">
                  <p class="text-2xl font-bold tabular-nums text-text-primary">
                    {{ briefings.length }}
                  </p>
                  <p class="text-xs text-text-muted">
                    Templates
                  </p>
                </div>
              </template>
            </div>
          </div>
        </header>

        <div
          v-if="!isLoadingWorkspaceEligibility && !isWorkspaceEligible"
          class="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-amber-400"
        >
          <Icon
            name="lucide:info"
            class="mt-0.5 size-4 text-amber-400"
          />
          <div class="space-y-0.5">
            <p class="text-sm font-medium">
              Briefing generation is currently unavailable.
            </p>
            <p class="text-xs text-amber-400/80">
              {{ workspaceRestrictionReason || "Your workspace does not meet the current requirements." }}
            </p>
          </div>
        </div>

        <!-- Main Layout: Two Column -->
        <div class="grid gap-8 lg:grid-cols-3">
          <!-- Left Column: Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Featured Briefing Skeleton -->
            <section
              v-if="isInitializing && activeTab === 'templates'"
              class="transition-all duration-700 delay-100"
            >
              <div class="overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-br from-bg-elevated to-bg-surface/50 p-6 lg:p-8">
                <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
                  <div class="size-16 animate-pulse rounded-2xl bg-bg-surface lg:size-20" />
                  <div class="flex-1 space-y-3">
                    <div class="h-5 w-20 animate-pulse rounded-md bg-bg-surface" />
                    <div class="h-7 w-48 animate-pulse rounded bg-bg-surface" />
                    <div class="space-y-2">
                      <div class="h-4 w-full animate-pulse rounded bg-bg-surface" />
                      <div class="h-4 w-2/3 animate-pulse rounded bg-bg-surface" />
                    </div>
                    <div class="flex gap-3 pt-2">
                      <div class="h-10 w-32 animate-pulse rounded-lg bg-bg-surface" />
                      <div class="h-10 w-28 animate-pulse rounded-lg bg-bg-surface" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Featured Briefing -->
            <section
              v-else-if="featuredBriefing && activeTab === 'templates'"
              class="transition-all duration-700 delay-100"
              :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
            >
              <div class="group relative overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-br from-bg-elevated to-bg-surface/50 p-6 shadow-sm transition-all hover:border-border-muted lg:p-8">
                <div class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-8">
                  <!-- Icon -->
                  <div class="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-teal-600 shadow-lg shadow-accent/25 lg:size-20">
                    <Icon
                      name="lucide:sparkles"
                      class="size-8 text-white lg:size-10"
                    />
                  </div>

                  <!-- Content -->
                  <div class="flex-1">
                    <div class="mb-2 flex items-center gap-2">
                      <span class="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">Featured</span>
                      <span
                        v-if="getSubscription(featuredBriefing.id)?.is_active"
                        class="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400"
                      >Active</span>
                    </div>
                    <h2 class="text-xl font-semibold text-text-primary lg:text-2xl">
                      {{ featuredBriefing.title }}
                    </h2>
                    <p class="mt-2 text-sm text-text-secondary lg:text-base">
                      {{ featuredBriefing.description }}
                    </p>

                    <div class="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        :disabled="!isWorkspaceEligible"
                        @click="handleGenerate(featuredBriefing)"
                      >
                        <Icon
                          name="lucide:play"
                          class="size-4"
                        />
                        Generate Now
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-border-muted hover:bg-bg-hover"
                        @click="handleInfo(featuredBriefing)"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Tab Navigation -->
            <div
              class="flex items-center gap-1 border-b border-border-subtle transition-all duration-700 delay-150"
              :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
            >
              <button
                type="button"
                class="relative px-4 py-3 text-sm font-medium transition-colors"
                :class="activeTab === 'templates' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'"
                @click="activeTab = 'templates'"
              >
                All Templates
                <span
                  v-if="activeTab === 'templates'"
                  class="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
                />
              </button>
              <button
                type="button"
                class="relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
                :class="activeTab === 'history' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'"
                @click="activeTab = 'history'"
              >
                Generation History
                <span
                  v-if="totalGenerations > 0"
                  class="rounded-full bg-bg-surface px-2 py-0.5 text-xs tabular-nums"
                >
                  {{ totalGenerations }}
                </span>
                <span
                  v-if="activeTab === 'history'"
                  class="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
                />
              </button>
            </div>

            <!-- Templates Tab Content -->
            <div v-if="activeTab === 'templates'">
              <!-- Loading -->
              <div
                v-if="isLoadingBriefings || isInitializing"
                class="grid gap-4 sm:grid-cols-2"
              >
                <div
                  v-for="i in 4"
                  :key="i"
                  class="flex h-full flex-col rounded-xl border border-border-subtle bg-bg-elevated"
                >
                  <!-- Header skeleton -->
                  <div class="flex items-start justify-between p-4 pb-0">
                    <div class="size-11 animate-pulse rounded-xl bg-bg-surface" />
                  </div>
                  <!-- Content skeleton -->
                  <div class="flex flex-1 flex-col p-4">
                    <div class="h-5 w-32 animate-pulse rounded bg-bg-surface" />
                    <div class="mt-2 h-3 w-20 animate-pulse rounded bg-bg-surface" />
                    <div class="mt-3 space-y-2">
                      <div class="h-3 w-full animate-pulse rounded bg-bg-surface" />
                      <div class="h-3 w-3/4 animate-pulse rounded bg-bg-surface" />
                    </div>
                    <div class="mt-3 flex gap-2">
                      <div class="h-5 w-12 animate-pulse rounded-md bg-bg-surface" />
                      <div class="h-5 w-20 animate-pulse rounded-md bg-bg-surface" />
                    </div>
                  </div>
                  <!-- Actions skeleton -->
                  <div class="flex items-center gap-2 border-t border-border-subtle p-3">
                    <div class="h-9 flex-1 animate-pulse rounded-lg bg-bg-surface" />
                    <div class="size-9 animate-pulse rounded-lg bg-bg-surface" />
                  </div>
                </div>
              </div>

              <!-- Error -->
              <div
                v-else-if="error"
                class="rounded-xl border border-border-subtle bg-bg-elevated p-10 text-center"
              >
                <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-red-500/10">
                  <Icon
                    name="lucide:alert-circle"
                    class="size-6 text-red-400"
                  />
                </div>
                <h3 class="mt-4 font-semibold text-text-primary">
                  Failed to load briefings
                </h3>
                <p class="mt-1 text-sm text-text-muted">
                  {{ error }}
                </p>
                <button
                  class="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-teal-600 px-4 py-2 text-sm font-medium text-white hover:shadow-glow"
                  @click="fetchBriefings()"
                >
                  Try again
                </button>
              </div>

              <!-- Empty -->
              <div
                v-else-if="!hasTemplates"
                class="rounded-xl border border-border-subtle bg-bg-elevated p-10 text-center"
              >
                <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-bg-surface">
                  <Icon
                    name="lucide:file-text"
                    class="size-6 text-text-muted"
                  />
                </div>
                <h3 class="mt-4 font-semibold text-text-primary">
                  No templates available
                </h3>
                <p class="mt-1 text-sm text-text-muted">
                  Templates will appear once configured.
                </p>
              </div>

              <!-- Templates Grid (excluding featured) -->
              <div
                v-else
                class="grid gap-4 sm:grid-cols-2"
              >
                <BriefingsBriefingCard
                  v-for="(briefing, index) in otherBriefings"
                  :key="briefing.id"
                  :briefing="briefing"
                  :subscription="getSubscription(briefing.id)"
                  :is-eligible="isWorkspaceEligible"
                  class="transition-all duration-500"
                  :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
                  :style="{ transitionDelay: `${200 + index * 50}ms` }"
                  @generate="handleGenerate"
                  @subscribe="handleSubscribe"
                  @manage="handleManageSubscription"
                  @info="handleInfo"
                />
              </div>
            </div>

            <!-- History Tab Content -->
            <div v-else-if="activeTab === 'history'">
              <BriefingsHistoryFilters
                :briefings="briefings"
                @filters-change="handleFiltersChange"
              />

              <!-- Loading -->
              <div
                v-if="isLoadingGenerations || isInitializing"
                class="mt-6 space-y-3"
              >
                <div
                  v-for="i in 5"
                  :key="i"
                  class="h-16 animate-pulse rounded-xl bg-bg-surface"
                />
              </div>

              <!-- Empty -->
              <div
                v-else-if="!hasHistory"
                class="mt-6 rounded-xl border border-border-subtle bg-bg-elevated p-10 text-center"
              >
                <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-bg-surface">
                  <Icon
                    name="lucide:inbox"
                    class="size-6 text-text-muted"
                  />
                </div>
                <h3 class="mt-4 font-semibold text-text-primary">
                  {{ historyFilters.search || historyFilters.status.length > 0 || historyFilters.briefingId ? 'No results found' : 'No briefings generated yet' }}
                </h3>
                <p class="mt-1 text-sm text-text-muted">
                  {{ historyFilters.search || historyFilters.status.length > 0 || historyFilters.briefingId ? 'Try adjusting your filters.' : 'Generate your first briefing to see it here.' }}
                </p>
                <button
                  v-if="!(historyFilters.search || historyFilters.status.length > 0 || historyFilters.briefingId)"
                  class="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-teal-600 px-4 py-2 text-sm font-medium text-white hover:shadow-glow"
                  @click="activeTab = 'templates'"
                >
                  Browse Templates
                </button>
              </div>

              <!-- Generations List -->
              <div
                v-else
                class="mt-6 space-y-2"
              >
                <BriefingsBriefingGenerationCard
                  v-for="generation in generations"
                  :key="generation.id"
                  :generation="generation"
                  :workspace-slug="workspaceSlug"
                  compact
                  @view="handleViewGeneration(generation.id)"
                />

                <BriefingsPagination
                  v-if="pagination.lastPage > 1"
                  :current-page="pagination.currentPage"
                  :last-page="pagination.lastPage"
                  :total="pagination.total"
                  :from="pagination.from"
                  :to="pagination.to"
                  class="mt-8"
                  @page-change="handlePageChange"
                />
              </div>
            </div>
          </div>

          <!-- Right Column: Sidebar -->
          <aside
            class="space-y-6 transition-all duration-700 delay-200"
            :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
          >
            <!-- Quick Actions -->
            <div class="rounded-xl border border-border-subtle bg-bg-elevated p-5 shadow-sm">
              <h3 class="mb-4 text-sm font-semibold text-text-primary">
                Quick Actions
              </h3>
              <div class="space-y-2">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-left text-sm font-medium text-text-secondary transition-all hover:border-border-muted hover:bg-bg-hover"
                  @click="activeTab = 'templates'"
                >
                  <div class="flex size-8 items-center justify-center rounded-md bg-accent/10">
                    <Icon
                      name="lucide:plus"
                      class="size-4 text-accent"
                    />
                  </div>
                  New Briefing
                </button>
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3 text-left text-sm font-medium text-text-secondary transition-all hover:border-border-muted hover:bg-bg-hover"
                  @click="activeTab = 'history'"
                >
                  <div class="flex size-8 items-center justify-center rounded-md bg-bg-hover">
                    <Icon
                      name="lucide:history"
                      class="size-4 text-text-secondary"
                    />
                  </div>
                  View History
                </button>
              </div>
            </div>

            <!-- Recent Activity -->
            <div
              v-if="recentGenerations.length > 0"
              class="rounded-xl border border-border-subtle bg-bg-elevated p-5 shadow-sm"
            >
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-sm font-semibold text-text-primary">
                  Recent
                </h3>
                <button
                  type="button"
                  class="text-xs font-medium text-accent hover:text-accent/80"
                  @click="activeTab = 'history'"
                >
                  View all
                </button>
              </div>
              <div class="space-y-3">
                <button
                  v-for="gen in recentGenerations"
                  :key="gen.id"
                  type="button"
                  class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-bg-hover"
                  @click="handleViewGeneration(gen.id)"
                >
                  <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-md"
                    :class="{
                      'bg-emerald-500/10': gen.status === 'completed',
                      'bg-blue-500/10': gen.status === 'processing' || gen.status === 'pending',
                      'bg-red-500/10': gen.status === 'failed',
                      'bg-bg-surface': !['completed', 'processing', 'pending', 'failed'].includes(gen.status),
                    }"
                  >
                    <Icon
                      :name="gen.status === 'completed' ? 'lucide:check' : gen.status === 'failed' ? 'lucide:x' : 'lucide:loader-2'"
                      class="size-4"
                      :class="{
                        'text-emerald-400': gen.status === 'completed',
                        'text-blue-400 animate-spin': gen.status === 'processing' || gen.status === 'pending',
                        'text-red-400': gen.status === 'failed',
                        'text-text-muted': !['completed', 'processing', 'pending', 'failed'].includes(gen.status),
                      }"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-text-primary">
                      {{ gen.briefing?.title ?? 'Briefing' }}
                    </p>
                    <p class="text-xs text-text-muted">
                      {{ new Date(gen.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <!-- What are Briefings -->
            <div class="rounded-xl border border-border-subtle bg-gradient-to-br from-bg-elevated to-bg-surface p-5 shadow-sm">
              <div class="mb-3 flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-teal-600">
                <Icon
                  name="lucide:lightbulb"
                  class="size-5 text-white"
                />
              </div>
              <h3 class="mb-2 text-sm font-semibold text-text-primary">
                What are Briefings?
              </h3>
              <p class="text-sm leading-relaxed text-text-secondary">
                AI-powered reports that transform your raw development data into meaningful narratives. Perfect for standups, team updates, and celebrating wins.
              </p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span class="inline-flex items-center gap-1 rounded-full bg-bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary">
                  <Icon
                    name="lucide:zap"
                    class="size-3"
                  />
                  Automated
                </span>
                <span class="inline-flex items-center gap-1 rounded-full bg-bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary">
                  <Icon
                    name="lucide:clock"
                    class="size-3"
                  />
                  Schedulable
                </span>
                <span class="inline-flex items-center gap-1 rounded-full bg-bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary">
                  <Icon
                    name="lucide:share-2"
                    class="size-3"
                  />
                  Shareable
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <!-- Modals -->
      <BriefingsBriefingInfoModal
        v-if="infoBriefing"
        v-model="showInfoModal"
        :briefing="infoBriefing"
        :subscription="getSubscription(infoBriefing.id)"
        @view="handleViewFromInfo"
        @subscribe="handleSubscribeFromInfo"
      />

      <BriefingsBriefingGenerateModal
        v-if="selectedBriefing"
        v-model="showGenerateModal"
        :briefing="selectedBriefing"
        :loading="isGenerating"
        @generate="handleConfirmGenerate"
      />

      <BriefingsBriefingSubscriptionModal
        v-model="showSubscribeModal"
        :briefing="selectedBriefing"
        :subscription="null"
        :is-slack-connected="isSlackConnected"
        @created="handleSubscriptionCreated"
      />

      <BriefingsBriefingSubscriptionModal
        v-model="showManageSubscriptionModal"
        :briefing="null"
        :subscription="selectedSubscription"
        :is-slack-connected="isSlackConnected"
        @updated="handleSubscriptionUpdated"
        @cancelled="handleSubscriptionCancelled"
      />

      <!-- Generation Overlay -->
      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isGenerating"
          class="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/95 backdrop-blur-sm"
        >
          <div class="text-center">
            <div class="relative mx-auto size-20">
              <div class="absolute inset-0 animate-ping rounded-full bg-accent/20" />
              <div class="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-teal-600 shadow-xl shadow-accent/30">
                <Icon
                  name="lucide:sparkles"
                  class="size-8 animate-pulse text-white"
                />
              </div>
            </div>
            <h3 class="mt-6 text-lg font-semibold text-text-primary">
              Generating your briefing
            </h3>
            <p class="mt-1 text-sm text-text-muted">
              {{ selectedBriefing?.title }}
            </p>
            <div class="mt-6 flex justify-center gap-1">
              <span
                class="size-2 animate-bounce rounded-full bg-accent"
                style="animation-delay: 0ms;"
              />
              <span
                class="size-2 animate-bounce rounded-full bg-accent"
                style="animation-delay: 150ms;"
              />
              <span
                class="size-2 animate-bounce rounded-full bg-accent"
                style="animation-delay: 300ms;"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </BaseContainer>
</template>

<style scoped>
.hover\:shadow-glow:hover {
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.4);
}
</style>

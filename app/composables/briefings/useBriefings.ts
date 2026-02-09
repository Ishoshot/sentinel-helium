import type {
  Briefing,
  BriefingGeneration,
  BriefingSubscription,
  BriefingShare,
  BriefingWorkspaceEligibility,
  GenerateBriefingRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreateShareRequest,
  BriefingOutputFormat,
} from "~/types";
import { useBriefingsService } from "~/services/briefings/briefingsService";
import { ApiError } from "~/services/core/api";
import { useAppToast } from "~/composables/shared/useAppToast";

/**
 * Briefings composable - orchestrates briefings state and operations
 */
export function useBriefings(workspaceId: Ref<number | null>) {
  const briefingsService = useBriefingsService();
  const toast = useAppToast();

  // ============================================================================
  // State
  // ============================================================================

  const briefings = ref<Briefing[]>([]);
  const currentBriefing = ref<Briefing | null>(null);
  const generations = ref<BriefingGeneration[]>([]);
  const currentGeneration = ref<BriefingGeneration | null>(null);
  const subscriptions = ref<BriefingSubscription[]>([]);
  const workspaceEligibility = ref<BriefingWorkspaceEligibility | null>(null);

  // Loading states
  const isLoadingBriefings = ref(false);
  const isLoadingGenerations = ref(false);
  const isLoadingSubscriptions = ref(false);
  const isLoadingWorkspaceEligibility = ref(false);
  const isGenerating = ref(false);
  const isProcessing = ref(false);
  const isSubmittingFeedback = ref(false);

  // Error state
  const error = ref<string | null>(null);

  // Pagination for generations
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
    from: 0,
    to: 0,
  });

  // ============================================================================
  // Briefings (Templates)
  // ============================================================================

  /**
   * Fetch all available briefings
   */
  async function fetchBriefings() {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return [];
    }
    isLoadingBriefings.value = true;
    error.value = null;

    try {
      const data = await briefingsService.listBriefings(workspaceId.value);
      briefings.value = data;
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch briefings";
      error.value = message;
      toast.error(message);
      return [];
    } finally {
      isLoadingBriefings.value = false;
    }
  }

  /**
   * Fetch workspace-level eligibility for generating briefings.
   */
  async function fetchWorkspaceEligibility() {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return null;
    }

    isLoadingWorkspaceEligibility.value = true;
    error.value = null;

    try {
      const data = await briefingsService.getWorkspaceEligibility(workspaceId.value);
      workspaceEligibility.value = data;
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to check briefing eligibility";
      error.value = message;
      toast.error(message);
      return null;
    } finally {
      isLoadingWorkspaceEligibility.value = false;
    }
  }

  /**
   * Fetch a single briefing by slug
   */
  async function fetchBriefing(slug: string) {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return null;
    }
    isLoadingBriefings.value = true;
    error.value = null;

    try {
      const data = await briefingsService.getBriefing(workspaceId.value, slug);
      currentBriefing.value = data;
      return data;
    } catch (e) {
      let message: string;
      if (e instanceof ApiError && e.status === 404) {
        message = "Briefing not found";
      } else {
        message = e instanceof Error ? e.message : "Failed to fetch briefing";
      }
      error.value = message;
      toast.error(message);
      currentBriefing.value = null;
      return null;
    } finally {
      isLoadingBriefings.value = false;
    }
  }

  // ============================================================================
  // Generations
  // ============================================================================

  /**
   * Generate a new briefing
   */
  async function generateBriefing(
    briefingIdOrSlug: number | string,
    data?: GenerateBriefingRequest
  ): Promise<BriefingGeneration | null> {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return null;
    }
    isGenerating.value = true;
    error.value = null;

    // Resolve slug to ID if needed
    let slug: string;
    if (typeof briefingIdOrSlug === "number") {
      const briefing = briefings.value.find((b) => b.id === briefingIdOrSlug);
      if (!briefing) {
        error.value = "Briefing not found";
        toast.error("Briefing not found");
        isGenerating.value = false;
        return null;
      }
      slug = briefing.slug;
    } else {
      slug = briefingIdOrSlug;
    }

    try {
      const generation = await briefingsService.generateBriefing(
        workspaceId.value,
        slug,
        data
      );
      // Add to the beginning of the list
      generations.value = [generation, ...generations.value];
      currentGeneration.value = generation;
      return generation;
    } catch (e) {
      let message: string;
      if (e instanceof ApiError) {
        if (e.status === 403 || e.status === 429) {
          // Use the API's contextual message (e.g. "You've used all 3 of your free briefings...")
          message = e.message;
        } else {
          message = e.message;
        }
      } else {
        message = e instanceof Error ? e.message : "Failed to generate briefing";
      }
      error.value = message;
      toast.error(message);
      return null;
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Fetch recent generations (convenience method)
   */
  async function fetchRecentGenerations(params?: { limit?: number; briefingId?: number }) {
    return fetchGenerations({
      page: 1,
      perPage: params?.limit ?? 10,
      briefingId: params?.briefingId,
    });
  }

  /**
   * Download a briefing - fetches a signed temporary URL from the backend
   */
  async function downloadBriefing(
    generationId: number,
    format: BriefingOutputFormat
  ): Promise<string | null> {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return null;
    }
    try {
      return await briefingsService.getDownloadUrl(workspaceId.value, generationId, format);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to get download URL";
      error.value = message;
      toast.error(message);
      return null;
    }
  }

  /**
   * Fetch generations list
   */
  async function fetchGenerations(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    status?: string[];
    briefingId?: number;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
  }) {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return;
    }
    isLoadingGenerations.value = true;
    error.value = null;

    try {
      const response = await briefingsService.listGenerations(workspaceId.value, {
        page: params?.page ?? 1,
        perPage: params?.perPage ?? pagination.value.perPage,
        search: params?.search,
        status: params?.status,
        briefingId: params?.briefingId,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        sort: params?.sort,
        direction: params?.direction,
      });

      generations.value = response.data;

      // Update pagination from response
      // Handle both Laravel paginate() format (fields at root) and API Resource format (fields in meta)
      const meta = 'meta' in response ? response.meta : response;
      pagination.value = {
        currentPage: meta.current_page,
        lastPage: meta.last_page,
        total: meta.total,
        perPage: meta.per_page,
        from: meta.from ?? 0,
        to: meta.to ?? 0,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch generations";
      error.value = message;
      toast.error(message);
      generations.value = [];
    } finally {
      isLoadingGenerations.value = false;
    }
  }

  /**
   * Fetch a single generation
   */
  async function fetchGeneration(generationId: number) {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return null;
    }
    isLoadingGenerations.value = true;
    error.value = null;

    try {
      const data = await briefingsService.getGeneration(workspaceId.value, generationId);
      currentGeneration.value = data;

      // Update in list if present
      const index = generations.value.findIndex((g) => g.id === generationId);
      if (index !== -1) {
        generations.value[index] = data;
      }

      return data;
    } catch (e) {
      let message: string;
      if (e instanceof ApiError && e.status === 404) {
        message = "Briefing generation not found";
      } else {
        message = e instanceof Error ? e.message : "Failed to fetch generation";
      }
      error.value = message;
      toast.error(message);
      currentGeneration.value = null;
      return null;
    } finally {
      isLoadingGenerations.value = false;
    }
  }

  /**
   * Get download URL for a format - fetches a signed temporary URL from the backend
   */
  async function getDownloadUrl(generationId: number, format: BriefingOutputFormat): Promise<string> {
    if (!workspaceId.value) return "";
    return await briefingsService.getDownloadUrl(workspaceId.value, generationId, format);
  }

  /**
   * Update a generation in the local state (used by WebSocket updates)
   */
  function updateGenerationState(updated: Partial<BriefingGeneration> & { id: number }) {
    // Update in list
    const index = generations.value.findIndex((g) => g.id === updated.id);
    if (index !== -1) {
      generations.value[index] = {
        ...generations.value[index],
        ...updated,
      } as BriefingGeneration;
    }

    // Update current if matching
    if (currentGeneration.value?.id === updated.id) {
      currentGeneration.value = {
        ...currentGeneration.value,
        ...updated,
      } as BriefingGeneration;
    }
  }

  // ============================================================================
  // Subscriptions
  // ============================================================================

  /**
   * Fetch user's subscriptions
   */
  async function fetchSubscriptions() {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return [];
    }
    isLoadingSubscriptions.value = true;
    error.value = null;

    try {
      const data = await briefingsService.listSubscriptions(workspaceId.value);
      subscriptions.value = data;
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch subscriptions";
      error.value = message;
      toast.error(message);
      return [];
    } finally {
      isLoadingSubscriptions.value = false;
    }
  }

  /**
   * Create a subscription
   */
  async function createSubscription(
    data: CreateSubscriptionRequest
  ): Promise<BriefingSubscription | null> {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return null;
    }
    isProcessing.value = true;
    error.value = null;

    try {
      const subscription = await briefingsService.createSubscription(
        workspaceId.value,
        data
      );
      subscriptions.value = [...subscriptions.value, subscription];
      return subscription;
    } catch (e) {
      let message: string;
      if (e instanceof ApiError) {
        if (e.status === 403) {
          message = "Scheduling is not available on your plan";
        } else if (e.isValidationError && e.firstError) {
          message = e.firstError;
        } else {
          message = e.message;
        }
      } else {
        message = e instanceof Error ? e.message : "Failed to create subscription";
      }
      error.value = message;
      toast.error(message);
      return null;
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Update a subscription
   */
  async function updateSubscription(
    subscriptionId: number,
    data: UpdateSubscriptionRequest
  ): Promise<BriefingSubscription | null> {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return null;
    }
    isProcessing.value = true;
    error.value = null;

    try {
      const subscription = await briefingsService.updateSubscription(
        workspaceId.value,
        subscriptionId,
        data
      );
      // Update in list
      const index = subscriptions.value.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subscriptions.value[index] = subscription;
      }
      return subscription;
    } catch (e) {
      let message: string;
      if (e instanceof ApiError && e.isValidationError && e.firstError) {
        message = e.firstError;
      } else {
        message = e instanceof Error ? e.message : "Failed to update subscription";
      }
      error.value = message;
      toast.error(message);
      return null;
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Cancel a subscription
   */
  async function cancelSubscription(subscriptionId: number): Promise<boolean> {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return false;
    }
    isProcessing.value = true;
    error.value = null;

    try {
      await briefingsService.cancelSubscription(workspaceId.value, subscriptionId);
      subscriptions.value = subscriptions.value.filter((s) => s.id !== subscriptionId);
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to cancel subscription";
      error.value = message;
      toast.error(message);
      return false;
    } finally {
      isProcessing.value = false;
    }
  }

  // ============================================================================
  // Shares
  // ============================================================================

  /**
   * Create a share link
   */
  async function createShare(
    generationId: number,
    data?: CreateShareRequest
  ): Promise<BriefingShare | null> {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return null;
    }
    isProcessing.value = true;
    error.value = null;

    try {
      const share = await briefingsService.createShare(
        workspaceId.value,
        generationId,
        data
      );
      return share;
    } catch (e) {
      let message: string;
      if (e instanceof ApiError && e.status === 403) {
        message = "External sharing is not available on your plan";
      } else {
        message = e instanceof Error ? e.message : "Failed to create share link";
      }
      error.value = message;
      toast.error(message);
      return null;
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Revoke a share link
   */
  async function revokeShare(shareId: number): Promise<boolean> {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return false;
    }
    isProcessing.value = true;
    error.value = null;

    try {
      await briefingsService.revokeShare(workspaceId.value, shareId);
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to revoke share";
      error.value = message;
      toast.error(message);
      return false;
    } finally {
      isProcessing.value = false;
    }
  }

  // ============================================================================
  // Feedback
  // ============================================================================

  /**
   * Submit feedback for a briefing generation
   */
  async function submitFeedback(
    generationId: number,
    payload: { rating: number; comment?: string; tags?: string[] }
  ): Promise<boolean> {
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return false;
    }

    isSubmittingFeedback.value = true;
    error.value = null;

    try {
      await briefingsService.submitFeedback(workspaceId.value, generationId, payload);
      toast.success("Feedback received. Thank you!");
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to submit feedback";
      error.value = message;
      toast.error(message);
      return false;
    } finally {
      isSubmittingFeedback.value = false;
    }
  }

  // ============================================================================
  // Computed
  // ============================================================================

  const isWorkspaceEligible = computed(
    () => workspaceEligibility.value?.can_generate !== false
  );

  const workspaceRestrictionReason = computed(
    () => workspaceEligibility.value?.restriction_reason ?? null
  );

  const workspaceReasonCode = computed(
    () => workspaceEligibility.value?.reason_code ?? null
  );

  /**
   * Get subscription for a specific briefing
   */
  function getSubscriptionForBriefing(briefingId: number): BriefingSubscription | undefined {
    return subscriptions.value.find((s) => s.briefing_id === briefingId && s.is_active);
  }

  /**
   * Check if a briefing has an active subscription
   */
  function hasActiveSubscription(briefingId: number): boolean {
    return !!getSubscriptionForBriefing(briefingId);
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  watch(workspaceId, (newId) => {
    if (!newId) {
      briefings.value = [];
      currentBriefing.value = null;
      generations.value = [];
      currentGeneration.value = null;
      subscriptions.value = [];
      workspaceEligibility.value = null;
    }
  });

  return {
    // State
    briefings: readonly(briefings),
    currentBriefing: readonly(currentBriefing),
    generations: readonly(generations),
    currentGeneration: readonly(currentGeneration),
    subscriptions: readonly(subscriptions),
    workspaceEligibility: readonly(workspaceEligibility),
    pagination: readonly(pagination),

    // Loading states
    isLoadingBriefings: readonly(isLoadingBriefings),
    isLoadingGenerations: readonly(isLoadingGenerations),
    isLoadingSubscriptions: readonly(isLoadingSubscriptions),
    isLoadingWorkspaceEligibility: readonly(isLoadingWorkspaceEligibility),
    isGenerating: readonly(isGenerating),
    isProcessing: readonly(isProcessing),
    isSubmittingFeedback: readonly(isSubmittingFeedback),
    error: readonly(error),

    // Briefings
    fetchBriefings,
    fetchWorkspaceEligibility,
    fetchBriefing,

    // Generations
    generateBriefing,
    fetchGenerations,
    fetchRecentGenerations,
    fetchGeneration,
    getDownloadUrl,
    downloadBriefing,
    updateGenerationState,

    // Subscriptions
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    getSubscriptionForBriefing,
    hasActiveSubscription,

    // Shares
    createShare,
    revokeShare,

    // Feedback
    submitFeedback,

    // Eligibility
    isWorkspaceEligible,
    workspaceRestrictionReason,
    workspaceReasonCode,
  };
}

import type {
  ApiListResponse,
  ApiResponse,
  Briefing,
  BriefingGeneration,
  BriefingSubscription,
  BriefingShare,
  GenerateBriefingRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreateShareRequest,
  BriefingOutputFormat,
  PaginatedResponse,
} from "~/types";
import { useApiClient } from "../core/api";

/**
 * Briefings service - handles all briefing-related API calls
 */
export function useBriefingsService() {
  const { $api } = useApiClient();

  // ============================================================================
  // Briefings (Templates)
  // ============================================================================

  /**
   * List available briefings for the workspace
   */
  async function listBriefings(workspaceId: number): Promise<Briefing[]> {
    const response = await $api<ApiListResponse<Briefing> | Briefing[]>(
      `/workspaces/${workspaceId}/briefings`
    );
    return "data" in response && Array.isArray(response.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];
  }

  /**
   * Get a single briefing by slug
   */
  async function getBriefing(
    workspaceId: number,
    slug: string
  ): Promise<Briefing> {
    const response = await $api<ApiResponse<Briefing> | Briefing>(
      `/workspaces/${workspaceId}/briefings/${slug}`
    );
    return "data" in response ? response.data : response;
  }

  // ============================================================================
  // Briefing Generations
  // ============================================================================

  /**
   * Generate a new briefing
   */
  async function generateBriefing(
    workspaceId: number,
    slug: string,
    data?: GenerateBriefingRequest
  ): Promise<BriefingGeneration> {
    const response = await $api<ApiResponse<BriefingGeneration> | BriefingGeneration>(
      `/workspaces/${workspaceId}/briefings/${slug}/generate`,
      {
        method: "POST",
        body: data ?? {},
      }
    );
    return "data" in response ? response.data : response;
  }

  /**
   * List briefing generations for the workspace
   */
  async function listGenerations(
    workspaceId: number,
    params?: {
      page?: number;
      perPage?: number;
      search?: string;
      status?: string[];
      briefingId?: number;
      dateFrom?: string;
      dateTo?: string;
      sort?: string;
      direction?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResponse<BriefingGeneration>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.perPage) query.set("per_page", String(params.perPage));
    if (params?.search) query.set("search", params.search);
    if (params?.status && params.status.length > 0) {
      params.status.forEach(s => query.append("status[]", s));
    }
    if (params?.briefingId) query.set("briefing_id", String(params.briefingId));
    if (params?.dateFrom) query.set("date_from", params.dateFrom);
    if (params?.dateTo) query.set("date_to", params.dateTo);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.direction) query.set("direction", params.direction);

    const queryString = query.toString();
    const url = `/workspaces/${workspaceId}/briefing-generations${queryString ? `?${queryString}` : ""}`;

    const response = await $api<PaginatedResponse<BriefingGeneration>>(url);
    return response;
  }

  /**
   * Get a single briefing generation
   */
  async function getGeneration(
    workspaceId: number,
    generationId: number
  ): Promise<BriefingGeneration> {
    const response = await $api<ApiResponse<BriefingGeneration> | BriefingGeneration>(
      `/workspaces/${workspaceId}/briefing-generations/${generationId}`
    );
    return "data" in response ? response.data : response;
  }

  /**
   * Get download URL for a generation in a specific format
   */
  function getDownloadUrl(
    workspaceId: number,
    generationId: number,
    format: BriefingOutputFormat
  ): string {
    const config = useRuntimeConfig();
    const baseURL = config.public.apiBaseUrl as string;
    return `${baseURL}/workspaces/${workspaceId}/briefing-generations/${generationId}/download/${format}`;
  }

  // ============================================================================
  // Briefing Subscriptions
  // ============================================================================

  /**
   * List user's briefing subscriptions
   */
  async function listSubscriptions(
    workspaceId: number
  ): Promise<BriefingSubscription[]> {
    const response = await $api<ApiListResponse<BriefingSubscription> | BriefingSubscription[]>(
      `/workspaces/${workspaceId}/briefing-subscriptions`
    );
    return "data" in response && Array.isArray(response.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];
  }

  /**
   * Create a new subscription
   */
  async function createSubscription(
    workspaceId: number,
    data: CreateSubscriptionRequest
  ): Promise<BriefingSubscription> {
    const response = await $api<ApiResponse<BriefingSubscription> | BriefingSubscription>(
      `/workspaces/${workspaceId}/briefing-subscriptions`,
      {
        method: "POST",
        body: data,
      }
    );
    return "data" in response ? response.data : response;
  }

  /**
   * Update a subscription
   */
  async function updateSubscription(
    workspaceId: number,
    subscriptionId: number,
    data: UpdateSubscriptionRequest
  ): Promise<BriefingSubscription> {
    const response = await $api<ApiResponse<BriefingSubscription> | BriefingSubscription>(
      `/workspaces/${workspaceId}/briefing-subscriptions/${subscriptionId}`,
      {
        method: "PATCH",
        body: data,
      }
    );
    return "data" in response ? response.data : response;
  }

  /**
   * Cancel (delete) a subscription
   */
  async function cancelSubscription(
    workspaceId: number,
    subscriptionId: number
  ): Promise<void> {
    await $api(`/workspaces/${workspaceId}/briefing-subscriptions/${subscriptionId}`, {
      method: "DELETE",
    });
  }

  // ============================================================================
  // Briefing Shares
  // ============================================================================

  /**
   * Create a share link for a generation
   */
  async function createShare(
    workspaceId: number,
    generationId: number,
    data?: CreateShareRequest
  ): Promise<BriefingShare> {
    const response = await $api<ApiResponse<BriefingShare> | BriefingShare>(
      `/workspaces/${workspaceId}/briefing-generations/${generationId}/share`,
      {
        method: "POST",
        body: data ?? {},
      }
    );
    return "data" in response ? response.data : response;
  }

  /**
   * Revoke a share link
   */
  async function revokeShare(
    workspaceId: number,
    shareId: number
  ): Promise<void> {
    await $api(`/workspaces/${workspaceId}/briefing-shares/${shareId}`, {
      method: "DELETE",
    });
  }

  return {
    // Briefings
    listBriefings,
    getBriefing,
    // Generations
    generateBriefing,
    listGenerations,
    getGeneration,
    getDownloadUrl,
    // Subscriptions
    listSubscriptions,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    // Shares
    createShare,
    revokeShare,
  };
}

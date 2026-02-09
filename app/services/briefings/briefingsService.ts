import type {
  ApiListResponse,
  ApiResponse,
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
  PaginatedResponse,
  ApiResourcePaginatedResponse,
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
   * Check workspace-level eligibility for generating briefings.
   */
  async function getWorkspaceEligibility(workspaceId: number): Promise<BriefingWorkspaceEligibility> {
    const response = await $api<BriefingWorkspaceEligibility>(
      `/workspaces/${workspaceId}/briefings/eligibility`
    );

    return {
      can_generate: Boolean(response.can_generate),
      restriction_reason: response.restriction_reason ?? null,
      reason_code: response.reason_code ?? null,
    };
  }

  /**
   * Get a single briefing by slug
   */
  async function getBriefing(
    workspaceId: number,
    slug: string
  ): Promise<Briefing> {
    const response = await $api<
      | (ApiResponse<Briefing> & {
          can_generate?: boolean;
          restriction_reason?: string | null;
          reason_code?: string | null;
        })
      | Briefing
    >(`/workspaces/${workspaceId}/briefings/${slug}`);

    if ("data" in response) {
      return {
        ...response.data,
        can_generate: response.can_generate,
        restriction_reason: response.restriction_reason ?? null,
        reason_code: (response.reason_code as Briefing["reason_code"]) ?? null,
      };
    }

    return response;
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
  ): Promise<PaginatedResponse<BriefingGeneration> | ApiResourcePaginatedResponse<BriefingGeneration>> {
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

    const response = await $api<PaginatedResponse<BriefingGeneration> | ApiResourcePaginatedResponse<BriefingGeneration>>(url);
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
   * Get download URL for a generation in a specific format.
   * Makes an authenticated API call to retrieve a signed temporary URL.
   */
  async function getDownloadUrl(
    workspaceId: number,
    generationId: number,
    format: BriefingOutputFormat
  ): Promise<string> {
    const response = await $api<{ url: string; filename: string; content_type: string }>(
      `/workspaces/${workspaceId}/briefing-generations/${generationId}/download/${format}`
    );
    return response.url;
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

  // ============================================================================
  // Briefing Feedback
  // ============================================================================

  /**
   * Submit feedback for a briefing generation
   */
  async function submitFeedback(
    workspaceId: number,
    generationId: number,
    payload: {
      rating: number;
      comment?: string;
      tags?: string[];
    }
  ): Promise<void> {
    await $api(`/workspaces/${workspaceId}/briefing-generations/${generationId}/feedback`, {
      method: "POST",
      body: payload,
    });
  }

  // ============================================================================
  // Public Briefing Share
  // ============================================================================

  /**
   * Fetch a shared briefing by token (public endpoint)
   */
  async function getSharedBriefing(
    token: string,
    password?: string | null
  ): Promise<BriefingGeneration> {
    const query = new URLSearchParams();
    if (password) query.set("password", password);
    const queryString = query.toString();

    const response = await $api<ApiResponse<BriefingGeneration> | BriefingGeneration>(
      `/briefings/share/${token}${queryString ? `?${queryString}` : ""}`
    );
    return "data" in response ? response.data : response;
  }

  return {
    // Briefings
    listBriefings,
    getWorkspaceEligibility,
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
    // Feedback
    submitFeedback,
    // Public
    getSharedBriefing,
  };
}

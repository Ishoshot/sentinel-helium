import type {
  ApiListResponse,
  ApiResponse,
  ChangeRequest,
  ChangeResponse,
  Plan,
  PortalResponse,
  Subscription,
  Usage,
} from "~/types";
import { useApiClient } from "../core/api";

/**
 * Billing service - handles plans and subscription API calls
 */
export function useBillingService() {
  const { $api } = useApiClient();

  /**
   * List all available plans
   */
  async function listPlans(): Promise<Plan[]> {
    const response = await $api<ApiListResponse<Plan> | Plan[]>("/plans");
    return "data" in response && Array.isArray(response.data)
      ? response.data
      : Array.isArray(response)
      ? response
      : [];
  }

  /**
   * Get current subscription for a workspace
   */
  async function getSubscription(workspaceId: number): Promise<Subscription> {
    const response = await $api<ApiResponse<Subscription> | Subscription>(
      `/workspaces/${workspaceId}/subscription`
    );
    return "data" in response ? response.data : response;
  }

  /**
   * Get usage for current billing period
   */
  async function getUsage(workspaceId: number): Promise<Usage> {
    const response = await $api<ApiResponse<Usage> | Usage>(
      `/workspaces/${workspaceId}/usage`
    );
    return "data" in response ? response.data : response;
  }

  /**
   * Change subscription plan (subscribe, upgrade, downgrade, or cancel)
   */
  async function changeSubscription(
    workspaceId: number,
    data: ChangeRequest
  ): Promise<ChangeResponse> {
    const response = await $api<ApiResponse<ChangeResponse> | ChangeResponse>(
      `/workspaces/${workspaceId}/subscription/change`,
      {
        method: "POST",
        body: data,
      }
    );
    return "data" in response ? response.data : response;
  }

  /**
   * Get a billing portal URL
   */
  async function createBillingPortal(
    workspaceId: number
  ): Promise<PortalResponse> {
    const response = await $api<ApiResponse<PortalResponse> | PortalResponse>(
      `/workspaces/${workspaceId}/subscription/portal`,
      {
        method: "POST",
      }
    );
    return "data" in response ? response.data : response;
  }

  return {
    listPlans,
    getSubscription,
    getUsage,
    changeSubscription,
    createBillingPortal,
  };
}

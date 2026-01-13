import type {
  ApiListResponse,
  ApiResponse,
  CheckoutResponse,
  Plan,
  PortalResponse,
  Subscription,
  UpgradeRequest,
  Usage,
} from "~/types";
import { useApiClient } from "./api";

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
   * Upgrade or change subscription plan
   */
  async function upgradeSubscription(
    workspaceId: number,
    data: UpgradeRequest
  ): Promise<CheckoutResponse> {
    const response = await $api<
      ApiResponse<CheckoutResponse> | CheckoutResponse
    >(`/workspaces/${workspaceId}/subscription/upgrade`, {
      method: "POST",
      body: data,
    });
    return "data" in response ? response.data : response;
  }

  /**
   * Cancel the current subscription
   */
  async function cancelSubscription(workspaceId: number): Promise<void> {
    await $api(`/workspaces/${workspaceId}/subscription/cancel`, {
      method: "POST",
    });
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
    upgradeSubscription,
    cancelSubscription,
    createBillingPortal,
  };
}

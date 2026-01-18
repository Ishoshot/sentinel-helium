import type { Activity, ApiListResponse } from "~/types";
import { useApiClient } from "../core/api";

/**
 * Activity service - handles workspace activity API calls
 */
export function useActivityService() {
  const { $api } = useApiClient();

  /**
   * List recent activities for a workspace
   */
  async function list(workspaceId: number, limit = 10): Promise<Activity[]> {
    const response = await $api<ApiListResponse<Activity>>(
      `/workspaces/${workspaceId}/activities`,
      {
        params: { limit },
      }
    );
    return response.data;
  }

  return {
    list,
  };
}

import type { ApiResponse, SlackIntegration, SlackConnectResponse, SlackChannel } from "~/types";
import { useApiClient } from "../core/api";

/**
 * Slack service - handles Slack integration API calls
 */
export function useSlackService() {
  const { $api } = useApiClient();

  /**
   * Get current Slack integration status
   */
  async function getIntegration(
    workspaceId: number,
  ): Promise<SlackIntegration | null> {
    const response = await $api<ApiResponse<SlackIntegration | null>>(
      `/workspaces/${workspaceId}/slack/integration`,
    );
    return response.data;
  }

  /**
   * Initiate Slack OAuth connection
   */
  async function connect(
    workspaceId: number,
  ): Promise<SlackConnectResponse> {
    const response = await $api<SlackConnectResponse>(
      `/workspaces/${workspaceId}/slack/connect`,
      { method: "POST" },
    );
    return response;
  }

  /**
   * List available Slack channels
   */
  async function listChannels(
    workspaceId: number,
  ): Promise<SlackChannel[]> {
    const response = await $api<ApiResponse<SlackChannel[]>>(
      `/workspaces/${workspaceId}/slack/channels`,
    );
    return response.data;
  }

  /**
   * Update the selected Slack channel
   */
  async function updateChannel(
    workspaceId: number,
    channelId: string,
    channelName: string,
  ): Promise<SlackIntegration> {
    const response = await $api<ApiResponse<SlackIntegration>>(
      `/workspaces/${workspaceId}/slack/channel`,
      {
        method: "PATCH",
        body: { channel_id: channelId, channel_name: channelName },
      },
    );
    return response.data;
  }

  /**
   * Disconnect Slack integration
   */
  async function disconnect(workspaceId: number): Promise<void> {
    await $api(`/workspaces/${workspaceId}/slack/disconnect`, {
      method: "DELETE",
    });
  }

  return {
    getIntegration,
    connect,
    listChannels,
    updateChannel,
    disconnect,
  };
}

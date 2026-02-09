import type { SlackIntegration, SlackChannel } from "~/types";
import { useSlackService } from "~/services/integrations/slackService";
import { ApiError } from "~/services/core/api";

/**
 * Slack composable - manages Slack integration state
 */
export function useSlack(workspaceId: Ref<number | null>) {
  const slackService = useSlackService();

  const slackIntegration = ref<SlackIntegration | null>(null);
  const channels = ref<SlackChannel[]>([]);
  const isLoading = ref(false);
  const isConnecting = ref(false);
  const isDisconnecting = ref(false);
  const isFetchingChannels = ref(false);
  const isUpdatingChannel = ref(false);
  const error = ref<string | null>(null);

  // Computed properties
  const isConnected = computed(
    () => slackIntegration.value?.is_connected ?? false,
  );

  /**
   * Fetch current Slack integration status
   */
  async function fetchIntegration() {
    if (!workspaceId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      slackIntegration.value = await slackService.getIntegration(
        workspaceId.value,
      );
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch Slack integration";
      slackIntegration.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Initiate Slack OAuth connection
   * Opens the Slack OAuth page in a new tab
   */
  async function connect() {
    if (!workspaceId.value) {
      error.value = "No workspace selected";
      return;
    }

    isConnecting.value = true;
    error.value = null;

    try {
      const response = await slackService.connect(workspaceId.value);

      if (response.oauth_url) {
        window.open(response.oauth_url, "_blank", "noopener,noreferrer");
      }

      slackIntegration.value = response.data;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to connect Slack";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to connect Slack";
      }
    } finally {
      isConnecting.value = false;
    }
  }

  /**
   * Fetch available Slack channels
   */
  async function fetchChannels() {
    if (!workspaceId.value) return;

    isFetchingChannels.value = true;
    error.value = null;

    try {
      channels.value = await slackService.listChannels(workspaceId.value);
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch Slack channels";
      channels.value = [];
    } finally {
      isFetchingChannels.value = false;
    }
  }

  /**
   * Update the selected Slack channel
   */
  async function updateChannel(channelId: string, channelName: string) {
    if (!workspaceId.value) return;

    isUpdatingChannel.value = true;
    error.value = null;

    try {
      slackIntegration.value = await slackService.updateChannel(
        workspaceId.value,
        channelId,
        channelName,
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to update Slack channel";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to update Slack channel";
      }
    } finally {
      isUpdatingChannel.value = false;
    }
  }

  /**
   * Disconnect Slack integration
   */
  async function disconnect() {
    if (!workspaceId.value) return;

    isDisconnecting.value = true;
    error.value = null;

    try {
      await slackService.disconnect(workspaceId.value);
      slackIntegration.value = null;
      channels.value = [];
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have permission to disconnect Slack";
      } else if (e instanceof ApiError && e.status === 404) {
        error.value = "No Slack integration found";
        slackIntegration.value = null;
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to disconnect Slack";
      }
    } finally {
      isDisconnecting.value = false;
    }
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null;
  }

  return {
    // State
    slackIntegration: readonly(slackIntegration),
    channels: readonly(channels),
    isLoading: readonly(isLoading),
    isConnecting: readonly(isConnecting),
    isDisconnecting: readonly(isDisconnecting),
    isFetchingChannels: readonly(isFetchingChannels),
    isUpdatingChannel: readonly(isUpdatingChannel),
    error: readonly(error),

    // Computed
    isConnected,

    // Methods
    fetchIntegration,
    connect,
    fetchChannels,
    updateChannel,
    disconnect,
    clearError,
  };
}

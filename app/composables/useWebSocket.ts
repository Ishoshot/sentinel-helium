/**
 * WebSocket composable for real-time event listening
 *
 * Provides typed event listeners for workspace channels using Laravel Echo and Reverb.
 */

import type { Channel } from 'laravel-echo';
import type {
  BriefingStartedEvent,
  BriefingProgressEvent,
  BriefingCompletedEvent,
  BriefingFailedEvent,
} from '~/types';
import { useAppToast } from '~/composables/shared/useAppToast';

type BriefingEventHandler<T> = (event: T) => void;

interface BriefingEventListeners {
  onStarted?: BriefingEventHandler<BriefingStartedEvent>;
  onProgress?: BriefingEventHandler<BriefingProgressEvent>;
  onCompleted?: BriefingEventHandler<BriefingCompletedEvent>;
  onFailed?: BriefingEventHandler<BriefingFailedEvent>;
}

/**
 * Composable for workspace WebSocket channel subscription
 */
export function useWebSocket(workspaceId: Ref<number | null>) {
  const { $echo } = useNuxtApp();
  const toast = useAppToast();

  const isConnected = ref(false);
  const channel = ref<Channel | null>(null);
  const error = ref<string | null>(null);

  /**
   * Subscribe to the workspace briefings channel
   */
  function subscribeToBriefings(listeners: BriefingEventListeners) {
    if (!workspaceId.value) {
      const message = 'No workspace ID provided';
      error.value = message;
      toast.error(message);
      return;
    }

    // Unsubscribe from any existing channel first
    unsubscribe();

    try {
      const channelName = `workspace.${workspaceId.value}.briefings`;

      // Subscribe to private channel
      channel.value = $echo.private(channelName);

      // Handle subscription success
      channel.value.subscribed(() => {
        console.log(`[WebSocket] Successfully subscribed to ${channelName}`);
        isConnected.value = true;
        error.value = null;
      });

      // Handle subscription errors
      channel.value.error((err: Error) => {
        console.error(`[WebSocket] Subscription error:`, err);
        const message = err instanceof Error ? err.message : 'Failed to subscribe to channel';
        error.value = message;
        isConnected.value = false;
      });

      // Register event listeners using the broadcastAs event names
      if (listeners.onStarted) {
        channel.value.listen('.briefing.started', listeners.onStarted);
      }

      if (listeners.onProgress) {
        channel.value.listen('.briefing.progress', listeners.onProgress);
      }

      if (listeners.onCompleted) {
        channel.value.listen('.briefing.completed', listeners.onCompleted);
      }

      if (listeners.onFailed) {
        channel.value.listen('.briefing.failed', listeners.onFailed);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to connect to WebSocket';
      error.value = message;
      toast.error(message);
      isConnected.value = false;
    }
  }

  /**
   * Unsubscribe from the current channel
   */
  function unsubscribe() {
    if (channel.value && workspaceId.value) {
      const channelName = `workspace.${workspaceId.value}.briefings`;
      $echo.leave(channelName);
      channel.value = null;
      isConnected.value = false;
    }
  }

  /**
   * Reconnect with updated auth token
   */
  function reconnect() {
    if (workspaceId.value && channel.value) {
      // Force Echo to update auth headers
      const token = localStorage.getItem('auth_token');
      if ($echo.connector.options.auth) {
        $echo.connector.options.auth.headers = {
          Authorization: `Bearer ${token || ''}`,
        };
      }
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribe();
  });

  // Resubscribe when workspace changes
  watch(workspaceId, () => {
    if (channel.value) {
      unsubscribe();
    }
  });

  return {
    // State
    isConnected: readonly(isConnected),
    error: readonly(error),

    // Methods
    subscribeToBriefings,
    unsubscribe,
    reconnect,
  };
}

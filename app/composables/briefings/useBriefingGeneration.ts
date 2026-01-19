import type {
  BriefingGeneration,
  BriefingGenerationStatus,
  BriefingProgressEvent,
  BriefingCompletedEvent,
  BriefingFailedEvent,
  BriefingStartedEvent,
} from "~/types";
import { useBriefingsService } from "~/services/briefings/briefingsService";
import { useWebSocket } from "~/composables/useWebSocket";
import { useAppToast } from "~/composables/shared/useAppToast";

/**
 * Composable for tracking a single briefing generation with real-time updates
 *
 * Uses WebSocket (Laravel Reverb) for real-time updates with polling as fallback.
 */
export function useBriefingGeneration(workspaceId: Ref<number | null>) {
  const briefingsService = useBriefingsService();
  const toast = useAppToast();
  const { subscribeToBriefings, unsubscribe: unsubscribeWebSocket, isConnected: wsConnected, error: wsError } = useWebSocket(workspaceId);

  // ============================================================================
  // State
  // ============================================================================

  const generationId = ref<number | null>(null);
  const generation = ref<BriefingGeneration | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Progress tracking
  const progress = ref(0);
  const progressMessage = ref<string | null>(null);
  const isComplete = ref(false);
  const isFailed = ref(false);

  // Connection mode
  const useWebSocketMode = ref(false);

  // Polling (fallback)
  const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null);
  const pollCount = ref(0);
  const maxPollCount = 120; // 2 minutes at 1s interval
  const isPolling = computed(() => pollingInterval.value !== null);

  // ============================================================================
  // Core Methods
  // ============================================================================

  /**
   * Fetch the generation data
   */
  async function fetchGeneration() {
    if (!workspaceId.value || !generationId.value) {
      const message = "No workspace or generation selected";
      error.value = message;
      toast.error(message);
      return null;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await briefingsService.getGeneration(
        workspaceId.value,
        generationId.value
      );
      generation.value = data;
      updateProgressFromGeneration(data);
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch generation";
      error.value = message;
      toast.error(message);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update progress state from generation data
   */
  function updateProgressFromGeneration(gen: BriefingGeneration) {
    progress.value = gen.progress;
    progressMessage.value = gen.progress_message;

    const status = gen.status as BriefingGenerationStatus;
    isComplete.value = status === "completed";
    isFailed.value = status === "failed";

    // Stop tracking if generation is finished
    if (isComplete.value || isFailed.value) {
      stopPolling();
    }
  }

  // ============================================================================
  // WebSocket Event Handlers
  // ============================================================================

  /**
   * Handle generation started event
   */
  function handleStartedEvent(event: BriefingStartedEvent) {
    console.log("[Briefing] Received started event", event);
    if (event.generation_id !== generationId.value) {
      console.log("[Briefing] Ignoring started event for different generation");
      return;
    }

    // Update generation status
    if (generation.value) {
      generation.value = {
        ...generation.value,
        status: event.status,
      };
    }
  }

  /**
   * Handle progress event
   */
  function handleProgressEvent(event: BriefingProgressEvent) {
    console.log("[Briefing] Received progress event", event);
    if (event.generation_id !== generationId.value) {
      console.log("[Briefing] Ignoring progress event for different generation");
      return;
    }

    progress.value = event.progress;
    progressMessage.value = event.message;

    // Update generation object if we have it
    if (generation.value) {
      generation.value = {
        ...generation.value,
        progress: event.progress,
        progress_message: event.message,
      };
    }
  }

  /**
   * Handle completed event
   */
  function handleCompletedEvent(event: BriefingCompletedEvent) {
    console.log("[Briefing] Received completed event", event);
    if (event.generation_id !== generationId.value) {
      console.log("[Briefing] Ignoring completed event for different generation");
      return;
    }

    isComplete.value = true;
    progress.value = 100;

    // Fetch final generation data to get full content
    fetchGeneration();
  }

  /**
   * Handle failed event
   */
  function handleFailedEvent(event: BriefingFailedEvent) {
    console.log("[Briefing] Received failed event", event);
    if (event.generation_id !== generationId.value) {
      console.log("[Briefing] Ignoring failed event for different generation");
      return;
    }

    isFailed.value = true;
    error.value = event.error;
    toast.error(event.error || "Briefing generation failed");

    if (generation.value) {
      generation.value = {
        ...generation.value,
        status: event.status,
        error_message: event.error,
      };
    }
  }

  // ============================================================================
  // WebSocket Management
  // ============================================================================

  /**
   * Start WebSocket listening for the current generation
   */
  function startWebSocket() {
    subscribeToBriefings({
      onStarted: handleStartedEvent,
      onProgress: handleProgressEvent,
      onCompleted: handleCompletedEvent,
      onFailed: handleFailedEvent,
    });
    useWebSocketMode.value = true;
  }

  /**
   * Stop WebSocket listening
   */
  function stopWebSocket() {
    unsubscribeWebSocket();
    useWebSocketMode.value = false;
  }

  // ============================================================================
  // Polling (Fallback)
  // ============================================================================

  /**
   * Start polling for updates
   */
  function startPolling(id: number, intervalMs = 2000) {
    if (pollingInterval.value) stopPolling();
    if (!workspaceId.value) {
      toast.error("No workspace selected");
      return;
    }

    generationId.value = id;
    pollCount.value = 0;

    pollingInterval.value = setInterval(async () => {
      pollCount.value++;

      // Stop if max polls reached
      if (pollCount.value >= maxPollCount) {
        stopPolling();
        const message = "Generation is taking longer than expected. Please refresh to check status.";
        error.value = message;
        toast.error(message);
        return;
      }

      // Fetch latest state
      await fetchGeneration();
    }, intervalMs);
  }

  /**
   * Stop polling
   */
  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
    }
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Start tracking a generation
   *
   * Attempts to use WebSocket first, falls back to polling if WebSocket fails.
   */
  async function startTracking(id: number) {
    generationId.value = id;

    // Initial fetch
    const gen = await fetchGeneration();

    if (!gen) return;

    // If already complete, no need to track
    const status = gen.status as BriefingGenerationStatus;
    if (status === "completed" || status === "failed") {
      return;
    }

    // Try WebSocket first
    try {
      startWebSocket();

      // Wait for WebSocket to connect (or fail) - give it more time for auth
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!wsConnected.value || wsError.value) {
        // WebSocket failed, fall back to polling
        console.warn("[Briefing] WebSocket connection failed, falling back to polling", {
          connected: wsConnected.value,
          error: wsError.value
        });
        stopWebSocket();
        startPolling(id);
      } else {
        console.log("[Briefing] Using WebSocket for real-time updates");
      }
    } catch {
      // WebSocket not available, use polling
      console.warn("[Briefing] WebSocket not available, using polling");
      startPolling(id);
    }
  }

  /**
   * Stop tracking
   */
  function stopTracking() {
    stopPolling();
    stopWebSocket();
    generationId.value = null;
    generation.value = null;
    progress.value = 0;
    progressMessage.value = null;
    isComplete.value = false;
    isFailed.value = false;
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopPolling();
    stopWebSocket();
  });

  // ============================================================================
  // Computed
  // ============================================================================

  const isPending = computed(() => {
    const status = generation.value?.status as BriefingGenerationStatus | undefined;
    return status === "pending";
  });

  const isProcessing = computed(() => {
    const status = generation.value?.status as BriefingGenerationStatus | undefined;
    return status === "processing";
  });

  const isInProgress = computed(() => isPending.value || isProcessing.value);

  const statusLabel = computed(() => {
    if (isPending.value) return "Queued";
    if (isProcessing.value) return "Generating";
    if (isComplete.value) return "Ready";
    if (isFailed.value) return "Failed";
    return "Unknown";
  });

  const progressPercent = computed(() => Math.min(100, Math.max(0, progress.value)));

  const progressLabel = computed(() => {
    if (isComplete.value || isFailed.value) return null;
    if (progress.value >= 90) return "Almost done...";
    if (progress.value >= 75) return "Finalizing...";
    if (progress.value >= 50) return "Analyzing data...";
    if (progress.value >= 25) return "Processing...";
    return "Starting...";
  });

  const isUsingWebSocket = computed(() => useWebSocketMode.value && wsConnected.value);

  return {
    // State
    generation: readonly(generation),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Progress
    progress: readonly(progress),
    progressMessage: readonly(progressMessage),
    progressPercent,
    progressLabel,

    // Status
    isPending,
    isProcessing,
    isInProgress,
    isComplete: readonly(isComplete),
    isFailed: readonly(isFailed),
    statusLabel,

    // Connection
    isPolling,
    isUsingWebSocket,

    // Methods
    fetchGeneration,
    startTracking,
    stopTracking,
    handleProgressEvent,
  };
}

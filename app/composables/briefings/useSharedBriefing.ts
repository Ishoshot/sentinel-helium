import type { BriefingGeneration } from "~/types";
import { useBriefingsService } from "~/services/briefings/briefingsService";
import { ApiError } from "~/services/core/api";

/**
 * Composable for loading public shared briefings.
 */
export function useSharedBriefing() {
  const briefingsService = useBriefingsService();

  const generation = ref<BriefingGeneration | null>(null);
  const isLoading = ref(false);
  const requiresPassword = ref(false);
  const error = ref<string | null>(null);

  async function fetchSharedBriefing(token: string, password?: string | null) {
    isLoading.value = true;
    requiresPassword.value = false;
    error.value = null;

    try {
      const data = await briefingsService.getSharedBriefing(token, password);
      generation.value = data;
      return data;
    } catch (e: unknown) {
      generation.value = null;

      if (e instanceof ApiError && e.status === 401) {
        requiresPassword.value = true;
      }

      error.value = e instanceof Error ? e.message : "Unable to load shared briefing";
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    generation: readonly(generation),
    isLoading: readonly(isLoading),
    requiresPassword: readonly(requiresPassword),
    error: readonly(error),
    fetchSharedBriefing,
  };
}

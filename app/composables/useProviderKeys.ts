import { AI_PROVIDERS, type AiProvider, type ProviderKey } from "~/types";
import { useProviderKeysService } from "~/services/providerKeysService";
import { ApiError } from "~/services/api";

export function useProviderKeys(
  workspaceId: Ref<number | null>,
  repositoryId: Ref<number | null>
) {
  const providerKeysService = useProviderKeysService();

  const providerKeys = ref<ProviderKey[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all provider keys for the repository
   */
  async function fetchProviderKeys() {
    if (!workspaceId.value || !repositoryId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const data = await providerKeysService.listKeys(
        workspaceId.value,
        repositoryId.value
      );
      providerKeys.value = data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to load provider keys";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Store a provider key (upsert)
   */
  async function storeProviderKey(provider: AiProvider, key: string) {
    if (!workspaceId.value || !repositoryId.value) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await providerKeysService.storeKey(
        workspaceId.value,
        repositoryId.value,
        { provider, key }
      );
      // Refresh the list after storing
      await fetchProviderKeys();
      return response;
    } catch (e) {
      if (e instanceof ApiError && e.status === 422 && e.errors) {
        // Handle validation errors specifically if needed, otherwise message
        error.value = Object.values(e.errors).flat().join(", ");
      } else if (e instanceof ApiError && e.status === 403) {
        error.value = "You are not authorized to manage provider keys";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to save provider key";
      }
      throw e; // Re-throw to let caller handle specific UI feedback if needed
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a provider key
   */
  async function deleteProviderKey(keyId: number) {
    if (!workspaceId.value || !repositoryId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      await providerKeysService.deleteKey(
        workspaceId.value,
        repositoryId.value,
        keyId
      );
      // Remove from local state
      providerKeys.value = providerKeys.value.filter((k) => k.id !== keyId);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You are not authorized to delete provider keys";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to delete provider key";
      }
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // Check if a specific provider is configured
  const hasProvider = (provider: AiProvider) => {
    return providerKeys.value.some((k) => k.provider === provider);
  };

  // Get available providers (ones not yet configured)
  const availableProviders = computed(() => {
    return AI_PROVIDERS.filter((p) => !hasProvider(p.value));
  });

  return {
    providerKeys: readonly(providerKeys),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchProviderKeys,
    storeProviderKey,
    deleteProviderKey,
    hasProvider,
    availableProviders,
  };
}

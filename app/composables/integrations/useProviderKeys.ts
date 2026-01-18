import { AI_PROVIDERS, type AiOption, type AiProvider, type ProviderKey } from "~/types";
import { useProviderKeysService } from "~/services/integrations/providerKeysService";
import { ApiError } from "~/services/core/api";

export function useProviderKeys(
  workspaceId: Ref<number | null>,
  repositoryId: Ref<number | null>
) {
  const providerKeysService = useProviderKeysService();

  const providerKeys = ref<ProviderKey[]>([]);
  const aiOptions = ref<AiOption[]>([]);
  const isLoading = ref(false);
  const isLoadingOptions = ref(false);
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
   * Fetch available AI models for a provider
   */
  async function fetchAiOptions(provider: AiProvider) {
    isLoadingOptions.value = true;
    error.value = null;

    try {
      const data = await providerKeysService.listAiOptions(provider);
      aiOptions.value = data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to load AI models";
      aiOptions.value = [];
    } finally {
      isLoadingOptions.value = false;
    }
  }

  /**
   * Store a provider key (upsert)
   */
  async function storeProviderKey(provider: AiProvider, key: string, providerModelId?: number) {
    if (!workspaceId.value || !repositoryId.value) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await providerKeysService.storeKey(
        workspaceId.value,
        repositoryId.value,
        { provider, key, provider_model_id: providerModelId }
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
   * Update the AI model for a provider key
   */
  async function updateProviderKeyModel(keyId: number, providerModelId: number | null) {
    if (!workspaceId.value || !repositoryId.value) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await providerKeysService.updateKeyModel(
        workspaceId.value,
        repositoryId.value,
        keyId,
        providerModelId
      );
      // Update in local state
      const index = providerKeys.value.findIndex((k) => k.id === keyId);
      if (index !== -1) {
        providerKeys.value[index] = response;
      }
      return response;
    } catch (e) {
      if (e instanceof ApiError && e.status === 422 && e.errors) {
        error.value = Object.values(e.errors).flat().join(", ");
      } else if (e instanceof ApiError && e.status === 403) {
        error.value = "You are not authorized to update provider keys";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to update provider key";
      }
      throw e;
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
    aiOptions: readonly(aiOptions),
    isLoading: readonly(isLoading),
    isLoadingOptions: readonly(isLoadingOptions),
    error: readonly(error),
    fetchProviderKeys,
    fetchAiOptions,
    storeProviderKey,
    updateProviderKeyModel,
    deleteProviderKey,
    hasProvider,
    availableProviders,
  };
}

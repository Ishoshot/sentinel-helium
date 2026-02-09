import { AI_PROVIDERS, type AiProvider, type ProviderKey } from "~/types";
import { useWorkspaceProviderKeysService } from "~/services/integrations/workspaceProviderKeysService";
import { ApiError } from "~/services/core/api";

export function useWorkspaceProviderKeys(workspaceId: Ref<number | null>) {
  const service = useWorkspaceProviderKeysService();

  const providerKeys = ref<ProviderKey[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all workspace-level provider keys
   */
  async function fetchProviderKeys() {
    if (!workspaceId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      const data = await service.listKeys(workspaceId.value);
      providerKeys.value = data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to load provider keys";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Store a workspace-level provider key (upsert)
   */
  async function storeProviderKey(provider: AiProvider, key: string) {
    if (!workspaceId.value) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const response = await service.storeKey(workspaceId.value, {
        provider,
        key,
      });
      await fetchProviderKeys();
      return response;
    } catch (e) {
      if (e instanceof ApiError && e.status === 422 && e.errors) {
        error.value = Object.values(e.errors).flat().join(", ");
      } else if (e instanceof ApiError && e.status === 403) {
        error.value = "You are not authorized to manage workspace API keys";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to save provider key";
      }
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a workspace-level provider key
   */
  async function deleteProviderKey(keyId: number) {
    if (!workspaceId.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      await service.deleteKey(workspaceId.value, keyId);
      providerKeys.value = providerKeys.value.filter((k) => k.id !== keyId);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You are not authorized to delete workspace API keys";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to delete provider key";
      }
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  const hasProvider = (provider: AiProvider) => {
    return providerKeys.value.some((k) => k.provider === provider);
  };

  const hasAnyKey = computed(() => providerKeys.value.length > 0);

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
    hasAnyKey,
    availableProviders,
  };
}

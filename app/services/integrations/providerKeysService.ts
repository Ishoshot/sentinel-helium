import type {
  AiOption,
  AiProvider,
  ApiResponse,
  ProviderKey,
  StoreProviderKeyRequest,
} from "~/types";
import { useApiClient } from "../core/api";

export function useProviderKeysService() {
  const { $api } = useApiClient();

  /**
   * List available AI models for a provider
   */
  async function listAiOptions(provider: AiProvider) {
    const response = await $api<ApiResponse<AiOption[]>>(
      `/ai-options/${provider}`
    );
    return response.data;
  }

  /**
   * List provider keys for a repository
   */
  async function listKeys(workspaceId: number, repositoryId: number) {
    const response = await $api<ApiResponse<ProviderKey[]>>(
      `/workspaces/${workspaceId}/repositories/${repositoryId}/provider-keys`
    );
    return response.data;
  }

  /**
   * Store a provider key (upsert)
   */
  async function storeKey(
    workspaceId: number,
    repositoryId: number,
    data: StoreProviderKeyRequest
  ) {
    const response = await $api<ApiResponse<ProviderKey>>(
      `/workspaces/${workspaceId}/repositories/${repositoryId}/provider-keys`,
      {
        method: "POST",
        body: data,
      }
    );
    return response.data;
  }

  /**
   * Update the AI model for a provider key
   */
  async function updateKeyModel(
    workspaceId: number,
    repositoryId: number,
    keyId: number,
    providerModelId: number | null
  ) {
    const response = await $api<ApiResponse<ProviderKey>>(
      `/workspaces/${workspaceId}/repositories/${repositoryId}/provider-keys/${keyId}`,
      {
        method: "PATCH",
        body: { provider_model_id: providerModelId },
      }
    );
    return response.data;
  }

  /**
   * Delete a provider key
   */
  async function deleteKey(
    workspaceId: number,
    repositoryId: number,
    keyId: number
  ) {
    await $api(
      `/workspaces/${workspaceId}/repositories/${repositoryId}/provider-keys/${keyId}`,
      {
        method: "DELETE",
      }
    );
  }

  return {
    listAiOptions,
    listKeys,
    storeKey,
    updateKeyModel,
    deleteKey,
  };
}

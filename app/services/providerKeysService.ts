import type {
  ApiResponse,
  ProviderKey,
  StoreProviderKeyRequest,
} from "~/types";
import { useApiClient } from "./api";

export function useProviderKeysService() {
  const { $api } = useApiClient();

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
    listKeys,
    storeKey,
    deleteKey,
  };
}

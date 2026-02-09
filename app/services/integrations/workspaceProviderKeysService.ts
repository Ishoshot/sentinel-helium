import type {
  ApiResponse,
  ProviderKey,
  StoreWorkspaceProviderKeyRequest,
} from "~/types";
import { useApiClient } from "../core/api";

export function useWorkspaceProviderKeysService() {
  const { $api } = useApiClient();

  /**
   * List workspace-level provider keys
   */
  async function listKeys(workspaceId: number) {
    const response = await $api<ApiResponse<ProviderKey[]>>(
      `/workspaces/${workspaceId}/provider-keys`
    );
    return response.data;
  }

  /**
   * Store a workspace-level provider key (upsert)
   */
  async function storeKey(
    workspaceId: number,
    data: StoreWorkspaceProviderKeyRequest
  ) {
    const response = await $api<ApiResponse<ProviderKey>>(
      `/workspaces/${workspaceId}/provider-keys`,
      {
        method: "POST",
        body: data,
      }
    );
    return response.data;
  }

  /**
   * Delete a workspace-level provider key
   */
  async function deleteKey(workspaceId: number, keyId: number) {
    await $api(`/workspaces/${workspaceId}/provider-keys/${keyId}`, {
      method: "DELETE",
    });
  }

  return {
    listKeys,
    storeKey,
    deleteKey,
  };
}

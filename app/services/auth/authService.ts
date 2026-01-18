import type { User, ApiResponse, OAuthProvider } from "~/types";
import { useApiClient } from "../core/api";

/**
 * Auth service - handles authentication API calls
 */
export function useAuthService() {
  const { $api, baseURL } = useApiClient();

  /**
   * Get the OAuth redirect URL for a provider
   * Note: OAuth routes are at root level, not under /api
   */
  function getOAuthUrl(provider: OAuthProvider): string {
    // Remove /api suffix from baseURL for OAuth routes
    const rootUrl = baseURL.replace(/\/api$/, "");
    return `${rootUrl}/auth/${provider}/redirect`;
  }

  /**
   * Get the current authenticated user
   */
  async function getUser(): Promise<User> {
    const response = await $api<ApiResponse<User>>("/user");
    return response.data;
  }

  /**
   * Logout the current user
   */
  async function logout(): Promise<void> {
    await $api("/logout", { method: "POST" });
  }

  return {
    getOAuthUrl,
    getUser,
    logout,
  };
}

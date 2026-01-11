import type { OAuthProvider } from "~/types";
import { useAuthService } from "~/services/authService";
import { setToken, clearToken, hasToken } from "~/services/api";
import { useUserStore } from "~/stores/useUserStore";
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";

/**
 * Auth composable - orchestrates authentication flow
 */
export function useAuth() {
  const userStore = useUserStore();
  const workspaceStore = useWorkspaceStore();
  const authService = useAuthService();
  const router = useRouter();

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => userStore.isAuthenticated);

  /**
   * Get the current user
   */
  const user = computed(() => userStore.user);

  /**
   * Redirect to OAuth provider for login
   */
  function login(provider: OAuthProvider) {
    const url = authService.getOAuthUrl(provider);
    window.location.href = url;
  }

  /**
   * Handle OAuth callback - store token and fetch user
   */
  async function handleCallback(token: string) {
    isLoading.value = true;
    error.value = null;

    try {
      setToken(token);
      await fetchUser();
      return true;
    } catch (e) {
      clearToken();
      error.value = e instanceof Error ? e.message : "Authentication failed";
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch the current user from API
   */
  async function fetchUser() {
    if (!hasToken()) return null;

    isLoading.value = true;
    error.value = null;

    try {
      const userData = await authService.getUser();
      userStore.setUser(userData);
      return userData;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to fetch user";
      clearToken();
      userStore.clearUser();
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout the current user
   */
  async function logout() {
    isLoading.value = true;
    error.value = null;

    try {
      await authService.logout();
    } catch {
      // Ignore logout errors - clear state anyway
    } finally {
      clearToken();
      userStore.clearUser();
      workspaceStore.clearWorkspaces();
      isLoading.value = false;
      router.push("/login");
    }
  }

  /**
   * Initialize auth state on app load
   */
  async function initialize() {
    if (hasToken() && !userStore.isAuthenticated) {
      await fetchUser();
    }
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated,
    user,

    // Methods
    login,
    handleCallback,
    fetchUser,
    logout,
    initialize,
  };
}

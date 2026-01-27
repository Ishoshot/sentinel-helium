/**
 * Composable for managing the Getting Started panel state
 */

import { useUserStore } from "~/stores/useUserStore";
import { useApiClient } from "~/services/core/api";
import { GETTING_STARTED_AUTO_SHOW } from "~/constants/animations";

const isGettingStartedOpen = ref(false);

export function useGettingStarted() {
  const userStore = useUserStore();
  const { $api } = useApiClient();

  /**
   * Open the getting started panel
   */
  function openGettingStarted() {
    isGettingStartedOpen.value = true;
  }

  /**
   * Close the getting started panel and mark as seen
   */
  async function closeGettingStarted() {
    isGettingStartedOpen.value = false;

    // Mark as seen in backend
    if (userStore.user && !userStore.user.has_seen_getting_started) {
      try {
        await $api("/user/mark-getting-started-seen", { method: "POST" });
        // Update local user state
        if (userStore.user) {
          userStore.user.has_seen_getting_started = true;
        }
      } catch (error) {
        console.error("Failed to mark getting started as seen:", error);
      }
    }
  }

  /**
   * Toggle the getting started panel
   */
  function toggleGettingStarted() {
    if (isGettingStartedOpen.value) {
      closeGettingStarted();
    } else {
      openGettingStarted();
    }
  }

  /**
   * Auto-show logic for first-time users
   */
  function checkAndShowForFirstTime() {
    if (userStore.user && !userStore.user.has_seen_getting_started) {
      // Small delay for better UX
      setTimeout(() => {
        openGettingStarted();
      }, GETTING_STARTED_AUTO_SHOW);
    }
  }

  return {
    isGettingStartedOpen: readonly(isGettingStartedOpen),
    openGettingStarted,
    closeGettingStarted,
    toggleGettingStarted,
    checkAndShowForFirstTime,
  };
}

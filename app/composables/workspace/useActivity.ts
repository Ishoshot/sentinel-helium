import type { Activity } from "~/types";
import { useActivityService } from "~/services/workspace/activityService";

/**
 * Activity composable - manages workspace activity
 */
export function useActivity(workspaceId: Ref<number | null>) {
  const activityService = useActivityService();

  const activities = ref<Activity[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch recent activities
   */
  async function fetchActivities(limit = 10) {
    if (!workspaceId.value) return [];

    isLoading.value = true;
    error.value = null;

    try {
      const data = await activityService.list(workspaceId.value, limit);
      activities.value = data;
      return data;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch activities";
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  // Watch for workspace changes
  watch(workspaceId, (newId) => {
    if (newId) {
      fetchActivities();
    } else {
      activities.value = [];
    }
  });

  return {
    activities: readonly(activities),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchActivities,
  };
}

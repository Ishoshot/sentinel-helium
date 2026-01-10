import type { Notification } from "~/types";
import { useNotificationsService } from "~/services/notificationsService";

/**
 * Notifications composable - manages user notifications state
 */
export function useNotifications() {
  const notificationsService = useNotificationsService();

  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const isMarkingRead = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const hasUnread = computed(() => unreadCount.value > 0);
  const hasNotifications = computed(() => notifications.value.length > 0);
  const unreadNotifications = computed(() =>
    notifications.value.filter((n) => n.read_at === null)
  );
  const readNotifications = computed(() =>
    notifications.value.filter((n) => n.read_at !== null)
  );

  /**
   * Fetch all notifications
   */
  async function fetchNotifications() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await notificationsService.list();
      notifications.value = response.data;
      unreadCount.value = response.unread_count;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to fetch notifications";
      notifications.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch unread count only (lightweight)
   */
  async function fetchUnreadCount() {
    try {
      const response = await notificationsService.getUnreadCount();
      unreadCount.value = response.count;
    } catch {
      // Silently fail for count updates
    }
  }

  /**
   * Mark all notifications as read
   */
  async function markAllAsRead() {
    if (unreadCount.value === 0) return;

    isMarkingRead.value = true;
    error.value = null;

    try {
      await notificationsService.markAllAsRead();

      // Update local state
      notifications.value = notifications.value.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      }));
      unreadCount.value = 0;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to mark notifications as read";
    } finally {
      isMarkingRead.value = false;
    }
  }

  /**
   * Mark a specific notification as read
   */
  async function markAsRead(notificationId: string) {
    const notification = notifications.value.find(
      (n) => n.id === notificationId
    );
    if (!notification || notification.read_at) return;

    try {
      const updated = await notificationsService.markAsRead(notificationId);

      // Update local state
      const index = notifications.value.findIndex(
        (n) => n.id === notificationId
      );
      if (index !== -1) {
        notifications.value[index] = updated;
      }
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to mark notification as read";
    }
  }

  /**
   * Mark a specific notification as unread
   */
  async function markAsUnread(notificationId: string) {
    const notification = notifications.value.find(
      (n) => n.id === notificationId
    );
    if (!notification || !notification.read_at) return;

    try {
      const updated = await notificationsService.markAsUnread(notificationId);

      // Update local state
      const index = notifications.value.findIndex(
        (n) => n.id === notificationId
      );
      if (index !== -1) {
        notifications.value[index] = updated;
      }
      unreadCount.value += 1;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Failed to mark notification as unread";
    }
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null;
  }

  return {
    // State
    notifications: readonly(notifications),
    unreadCount: readonly(unreadCount),
    isLoading: readonly(isLoading),
    isMarkingRead: readonly(isMarkingRead),
    error: readonly(error),

    // Computed
    hasUnread,
    hasNotifications,
    unreadNotifications,
    readNotifications,

    // Methods
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    markAsRead,
    markAsUnread,
    clearError,
  };
}

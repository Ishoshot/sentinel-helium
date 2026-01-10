import type {
  Notification,
  NotificationListResponse,
  UnreadCountResponse,
} from "~/types";
import { useApiClient } from "./api";

/**
 * Notifications service - handles notification API calls
 */
export function useNotificationsService() {
  const { $api } = useApiClient();

  /**
   * Get all notifications for the authenticated user
   */
  async function list(): Promise<NotificationListResponse> {
    return await $api<NotificationListResponse>("/notifications");
  }

  /**
   * Get unread notification count
   */
  async function getUnreadCount(): Promise<UnreadCountResponse> {
    return await $api<UnreadCountResponse>("/notifications/unread");
  }

  /**
   * Mark all notifications as read
   */
  async function markAllAsRead(): Promise<void> {
    await $api("/notifications/read-all", {
      method: "POST",
    });
  }

  /**
   * Mark a specific notification as read
   */
  async function markAsRead(notificationId: string): Promise<Notification> {
    const response = await $api<{ data: Notification }>(
      `/notifications/${notificationId}/read`,
      {
        method: "POST",
      }
    );
    return response.data;
  }

  /**
   * Mark a specific notification as unread
   */
  async function markAsUnread(notificationId: string): Promise<Notification> {
    const response = await $api<{ data: Notification }>(
      `/notifications/${notificationId}/unread`,
      {
        method: "POST",
      }
    );
    return response.data;
  }

  return {
    list,
    getUnreadCount,
    markAllAsRead,
    markAsRead,
    markAsUnread,
  };
}

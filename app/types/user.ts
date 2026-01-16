/**
 * User-related types (Notifications, etc.)
 */
import type { NotificationType } from './enums'

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationListResponse {
  data: Notification[];
  unread_count: number;
}

export interface UnreadCountResponse {
  count: number;
}

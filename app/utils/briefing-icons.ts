/**
 * Briefing icon and style utilities
 *
 * Centralized mappings for briefing-related icons and visual styles.
 */

import {
  type Achievement,
  type AchievementStyle,
  AchievementType,
  BriefingDeliveryChannel,
} from "~/types/briefings";

// ============================================================================
// Excerpt Meta
// ============================================================================

export interface ExcerptMeta {
  label: string;
  icon: string;
}

/**
 * Metadata for briefing excerpt types (labels and icons for sharing formats).
 */
export const EXCERPT_META: Record<string, ExcerptMeta> = {
  short: { label: "Short", icon: "lucide:align-left" },
  slack: { label: "Slack", icon: "lucide:hash" },
  email: { label: "Email", icon: "lucide:mail" },
  linkedin: { label: "LinkedIn", icon: "lucide:linkedin" },
  twitter: { label: "X (Twitter)", icon: "lucide:twitter" },
} as const;

// ============================================================================
// Delivery Channel Icons
// ============================================================================

/**
 * Get the icon name for a delivery channel.
 */
export function getDeliveryChannelIcon(
  channel: BriefingDeliveryChannel
): string {
  switch (channel) {
    case BriefingDeliveryChannel.Email:
      return "lucide:mail";
    case BriefingDeliveryChannel.Slack:
      return "lucide:slack";
    case BriefingDeliveryChannel.Push:
      return "lucide:bell";
    default:
      return "lucide:send";
  }
}

// ============================================================================
// Achievement Icons & Styles
// ============================================================================

/**
 * Get the icon name for an achievement based on its type.
 */
export function getAchievementIcon(achievement: Achievement): string {
  if (achievement.icon) return achievement.icon;

  switch (achievement.type) {
    case AchievementType.Milestone:
      return "lucide:flag";
    case AchievementType.Streak:
      return "lucide:flame";
    case AchievementType.PersonalBest:
      return "lucide:medal";
    default:
      return "lucide:award";
  }
}

/**
 * Get the color classes for an achievement based on its type.
 */
export function getAchievementColor(achievement: Achievement): string {
  switch (achievement.type) {
    case AchievementType.Milestone:
      return "text-blue-600 bg-blue-100";
    case AchievementType.Streak:
      return "text-orange-600 bg-orange-100";
    case AchievementType.PersonalBest:
      return "text-purple-600 bg-purple-100";
    default:
      return "text-amber-600 bg-amber-100";
  }
}

/**
 * Get full styling object for an achievement.
 */
export function getAchievementStyle(achievement: Achievement): AchievementStyle {
  switch (achievement.type) {
    case AchievementType.Milestone:
      return {
        icon: "text-blue-600",
        bg: "bg-blue-100",
        border: "border-blue-200",
        glow: "shadow-blue-500/20",
      };
    case AchievementType.Streak:
      return {
        icon: "text-orange-600",
        bg: "bg-orange-100",
        border: "border-orange-200",
        glow: "shadow-orange-500/20",
      };
    case AchievementType.PersonalBest:
      return {
        icon: "text-purple-600",
        bg: "bg-purple-100",
        border: "border-purple-200",
        glow: "shadow-purple-500/20",
      };
    default:
      return {
        icon: "text-amber-600",
        bg: "bg-amber-100",
        border: "border-amber-200",
        glow: "shadow-amber-500/20",
      };
  }
}

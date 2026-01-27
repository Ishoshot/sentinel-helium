/**
 * Animation timing constants
 *
 * Centralized timing values for animations, transitions, and timeouts.
 * Using named constants improves maintainability and consistency.
 */

// ============================================================================
// Toast Durations (milliseconds)
// ============================================================================

/** Duration for success toast notifications */
export const TOAST_DURATION_SUCCESS = 4000;

/** Duration for error toast notifications (longer for user to read) */
export const TOAST_DURATION_ERROR = 6000;

/** Duration for warning toast notifications */
export const TOAST_DURATION_WARNING = 5000;

/** Duration for info toast notifications */
export const TOAST_DURATION_INFO = 4000;

// ============================================================================
// Clipboard Feedback (milliseconds)
// ============================================================================

/** Duration to show "Copied" feedback in code blocks */
export const CLIPBOARD_FEEDBACK_CODE = 1500;

/** Duration to show "Copied" feedback in general UI */
export const CLIPBOARD_FEEDBACK_DEFAULT = 2000;

// ============================================================================
// Progress & Loading Animations (milliseconds)
// ============================================================================

/** Progress bar animation duration */
export const PROGRESS_BAR_ANIMATION = 500;

/** Animated dots interval for pending/processing states */
export const ANIMATED_DOTS_INTERVAL = 500;

/** Getting started panel auto-show delay */
export const GETTING_STARTED_AUTO_SHOW = 1000;

// ============================================================================
// Celebration & Feedback Animations (milliseconds)
// ============================================================================

/** Celebration animation timeout */
export const CELEBRATION_ANIMATION_TIMEOUT = 3000;

/** Sync state reset timeout after operation */
export const SYNC_STATE_RESET_TIMEOUT = 2000;

/** Resend state reset timeout after invitation resend */
export const RESEND_STATE_RESET_TIMEOUT = 1000;

/** Redirect delay after accepting invitation */
export const INVITATION_REDIRECT_DELAY = 2000;

// ============================================================================
// WebSocket & Polling (milliseconds)
// ============================================================================

/** WebSocket connection wait timeout before fallback */
export const WEBSOCKET_CONNECTION_TIMEOUT = 2000;

/** Default polling interval for briefing generation */
export const BRIEFING_POLLING_INTERVAL = 2000;

// ============================================================================
// Hero & Landing Page Animations (milliseconds)
// ============================================================================

/** Hero section animation delay */
export const HERO_ANIMATION_DELAY = 100;

/** Mockup animation delay on landing page */
export const MOCKUP_ANIMATION_DELAY = 400;

/** Card fade animation duration */
export const CARD_FADE_ANIMATION = 300;

// ============================================================================
// CSS Animation Delays (seconds - for inline styles)
// ============================================================================

/** Confetti animation delay step 1 */
export const CONFETTI_DELAY_1 = "0.1s";

/** Confetti animation delay step 2 */
export const CONFETTI_DELAY_2 = "0.2s";

/** Fade-in-up animation duration */
export const FADE_IN_UP_DURATION = "0.3s";

/** Subtle float animation delay for ping ring */
export const PING_RING_DELAY = "0.5s";

/** Subtle float animation delay for odd cards */
export const SUBTLE_FLOAT_DELAY_ODD = "0.5s";

/** Subtle float animation delay for even cards */
export const SUBTLE_FLOAT_DELAY_EVEN = "0.8s";

// ============================================================================
// Stagger Animation Helpers
// ============================================================================

/** Base delay for layer animation stagger (ms) */
export const STAGGER_LAYER_BASE = 200;

/** Delay per item within a layer (ms) */
export const STAGGER_ITEM_INCREMENT = 100;

/**
 * Calculate stagger delay for architecture cards
 * @param layerIndex - Index of the layer (0-based)
 * @param itemIndex - Index of the item within the layer (0-based)
 * @returns Delay in milliseconds
 */
export function calculateStaggerDelay(
  layerIndex: number,
  itemIndex: number
): number {
  return layerIndex * STAGGER_LAYER_BASE + itemIndex * STAGGER_ITEM_INCREMENT;
}

/**
 * Toast notification composable
 * Provides a simple API for showing toast notifications throughout the app
 */

import { ToastType } from "~/types";
import {
  TOAST_DURATION_SUCCESS,
  TOAST_DURATION_ERROR,
  TOAST_DURATION_WARNING,
  TOAST_DURATION_INFO,
} from "~/constants/animations";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Reactive state for toasts
const toasts = ref<Toast[]>([]);

// Default durations by type (in ms)
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  [ToastType.Success]: TOAST_DURATION_SUCCESS,
  [ToastType.Error]: TOAST_DURATION_ERROR,
  [ToastType.Warning]: TOAST_DURATION_WARNING,
  [ToastType.Info]: TOAST_DURATION_INFO,
};

// Generate unique ID
function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Add a toast notification
 */
function addToast(type: ToastType, options: ToastOptions): string {
  const id = generateId();

  const toast: Toast = {
    id,
    type,
    title: options.title,
    message: options.message,
    duration: options.duration ?? DEFAULT_DURATIONS[type],
    dismissible: options.dismissible ?? true,
    action: options.action,
  };

  toasts.value.push(toast);

  // Auto-dismiss after duration (if not 0)
  if (toast.duration && toast.duration > 0) {
    setTimeout(() => {
      dismiss(id);
    }, toast.duration);
  }

  return id;
}

/**
 * Dismiss a toast by ID
 */
function dismiss(id: string): void {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
}

/**
 * Dismiss all toasts
 */
function dismissAll(): void {
  toasts.value = [];
}

/**
 * Toast composable
 */
export function useAppToast() {
  /**
   * Show a success toast
   */
  function success(options: ToastOptions | string): string {
    const opts = typeof options === "string" ? { title: options } : options;
    return addToast(ToastType.Success, opts);
  }

  /**
   * Show an error toast
   */
  function error(options: ToastOptions | string): string {
    const opts = typeof options === "string" ? { title: options } : options;
    return addToast(ToastType.Error, opts);
  }

  /**
   * Show a warning toast
   */
  function warning(options: ToastOptions | string): string {
    const opts = typeof options === "string" ? { title: options } : options;
    return addToast(ToastType.Warning, opts);
  }

  /**
   * Show an info toast
   */
  function info(options: ToastOptions | string): string {
    const opts = typeof options === "string" ? { title: options } : options;
    return addToast(ToastType.Info, opts);
  }

  /**
   * Show a toast from an API error
   */
  function fromError(
    e: unknown,
    fallbackMessage = "An error occurred"
  ): string {
    let message = fallbackMessage;

    if (e instanceof Error) {
      message = e.message;
    } else if (typeof e === "string") {
      message = e;
    }

    return error({ title: message });
  }

  /**
   * Promise-based toast that shows loading, then success/error
   */
  async function promise<T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ): Promise<T> {
    const loadingId = info({
      title: options.loading,
      duration: 0, // Don't auto-dismiss
      dismissible: false,
    });

    try {
      const result = await promise;
      dismiss(loadingId);
      success(
        typeof options.success === "function"
          ? options.success(result)
          : options.success
      );
      return result;
    } catch (e) {
      dismiss(loadingId);
      error(
        typeof options.error === "function" ? options.error(e) : options.error
      );
      throw e;
    }
  }

  return {
    // State
    toasts: readonly(toasts),

    // Methods
    success,
    error,
    warning,
    info,
    fromError,
    promise,
    dismiss,
    dismissAll,
  };
}

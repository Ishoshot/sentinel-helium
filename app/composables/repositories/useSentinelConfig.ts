import type { RepositorySettings } from "~/types";
import { formatRelativeTime } from "~/utils/date";

export type SentinelConfigStatus = "default" | "active" | "error";

export function useSentinelConfig(
  settings: Ref<RepositorySettings | null | undefined>
) {
  const resolvedSettings = computed(() => settings.value);

  const config = computed(
    () => resolvedSettings.value?.sentinel_config ?? null
  );
  const hasConfig = computed(
    () => resolvedSettings.value?.has_sentinel_config ?? config.value !== null
  );

  const error = computed(() => resolvedSettings.value?.config_error ?? null);
  const hasError = computed(
    () => resolvedSettings.value?.has_config_error ?? Boolean(error.value)
  );

  const syncedAt = computed(
    () => resolvedSettings.value?.config_synced_at ?? null
  );
  const syncedAtLabel = computed(() => {
    if (!syncedAt.value) return "Never";
    return formatRelativeTime(syncedAt.value);
  });

  const status = computed<SentinelConfigStatus>(() => {
    if (hasError.value) return "error";
    if (hasConfig.value) return "active";
    return "default";
  });

  const configJson = computed(() => {
    if (!config.value) return "";
    return JSON.stringify(config.value, null, 2);
  });

  return {
    config,
    hasConfig,
    error,
    hasError,
    syncedAt,
    syncedAtLabel,
    status,
    configJson,
  };
}

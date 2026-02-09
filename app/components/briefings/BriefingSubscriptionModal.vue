<script setup lang="ts">
import type {
  Briefing,
  BriefingSubscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from "~/types";
import {
  BriefingSchedulePreset,
  BriefingDeliveryChannel,
  getSchedulePresetLabel,
  getDeliveryChannelLabel,
} from "~/types/briefings";
import { useBriefings } from "~/composables/briefings/useBriefings";

/**
 * BriefingSubscriptionModal - Create or manage a briefing subscription
 *
 * Dual-mode modal:
 * - Create mode: briefing prop provided, subscription is null
 * - Edit mode: subscription prop provided, briefing is null
 */

interface Props {
  modelValue: boolean;
  briefing: Briefing | null;
  subscription: BriefingSubscription | null;
  isSlackConnected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSlackConnected: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  created: [subscription: BriefingSubscription];
  updated: [subscription: BriefingSubscription];
  cancelled: [];
}>();

const isEditMode = computed(() => !!props.subscription);
const modalTitle = computed(() => (isEditMode.value ? "Manage Subscription" : "Subscribe to Briefing"));
const briefingTitle = computed(
  () => props.subscription?.briefing?.title ?? props.briefing?.title ?? "Briefing"
);

// Resolve workspace ID from whichever prop is available
const resolvedWorkspaceId = computed(
  () => props.subscription?.workspace_id ?? props.briefing?.workspace_id ?? null
);

const { createSubscription, updateSubscription, cancelSubscription } =
  useBriefings(resolvedWorkspaceId);

// Form state
const schedulePreset = ref<BriefingSchedulePreset>(BriefingSchedulePreset.Weekly);
const scheduleDay = ref<number>(1);
const scheduleHour = ref<number>(9);
const scheduleMinute = ref<number>(0);
const deliveryChannels = ref<BriefingDeliveryChannel[]>([BriefingDeliveryChannel.Email]);
const isActive = ref(true);

const isSubmitting = ref(false);
const isCancelling = ref(false);
const showCancelConfirm = ref(false);
const error = ref<string | null>(null);

// Schedule presets
const schedulePresets = [
  { label: getSchedulePresetLabel(BriefingSchedulePreset.Daily), value: BriefingSchedulePreset.Daily },
  { label: getSchedulePresetLabel(BriefingSchedulePreset.Weekly), value: BriefingSchedulePreset.Weekly },
  { label: getSchedulePresetLabel(BriefingSchedulePreset.Monthly), value: BriefingSchedulePreset.Monthly },
];

// Day options for weekly
const weekDays = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

const minimumScheduleHour = 0;
const maximumScheduleHour = 23;
const minimumScheduleMinute = 0;
const maximumScheduleMinute = 59;
const minimumMonthlyDay = 1;
const maximumMonthlyDay = 28;

// Available delivery channels
const allChannels = [
  {
    value: BriefingDeliveryChannel.Email,
    label: getDeliveryChannelLabel(BriefingDeliveryChannel.Email),
    icon: "lucide:mail",
    description: "Send briefings to your account email",
  },
  {
    value: BriefingDeliveryChannel.Slack,
    label: getDeliveryChannelLabel(BriefingDeliveryChannel.Slack),
    icon: "lucide:hash",
    description: "Deliver to your connected Slack channel",
  },
  {
    value: BriefingDeliveryChannel.Push,
    label: getDeliveryChannelLabel(BriefingDeliveryChannel.Push),
    icon: "lucide:bell",
    description: "In-app push notification delivery",
  },
];

const showScheduleDay = computed(
  () => schedulePreset.value === BriefingSchedulePreset.Weekly || schedulePreset.value === BriefingSchedulePreset.Monthly
);

const isSlackSelected = computed(
  () => deliveryChannels.value.includes(BriefingDeliveryChannel.Slack)
);

const isScheduleHourValid = computed(
  () => Number.isInteger(scheduleHour.value) && scheduleHour.value >= minimumScheduleHour && scheduleHour.value <= maximumScheduleHour
);

const isScheduleMinuteValid = computed(
  () => Number.isInteger(scheduleMinute.value) && scheduleMinute.value >= minimumScheduleMinute && scheduleMinute.value <= maximumScheduleMinute
);

const isWeeklyScheduleDayValid = computed(
  () => weekDays.some((day) => day.value === scheduleDay.value)
);

const isMonthlyScheduleDayValid = computed(
  () => Number.isInteger(scheduleDay.value) && scheduleDay.value >= minimumMonthlyDay && scheduleDay.value <= maximumMonthlyDay
);

const selectedChannels = computed(() =>
  allChannels.filter((channel) => deliveryChannels.value.includes(channel.value))
);

const cadenceSummary = computed(() => {
  if (schedulePreset.value === BriefingSchedulePreset.Daily) {
    return "Every day";
  }

  if (schedulePreset.value === BriefingSchedulePreset.Weekly) {
    const selectedDay = weekDays.find((day) => day.value === scheduleDay.value);
    return `Weekly on ${selectedDay?.label ?? "Mon"}`;
  }

  return `Monthly on day ${scheduleDay.value}`;
});

const deliveryTimeLabel = computed(
  () => `${String(scheduleHour.value).padStart(2, "0")}:${String(scheduleMinute.value).padStart(2, "0")} UTC`
);

const channelSummary = computed(() => {
  if (selectedChannels.value.length === 0) {
    return "No channels selected";
  }

  return selectedChannels.value.map((channel) => channel.label).join(", ");
});

const slackStatusLabel = computed(() => {
  if (!isSlackSelected.value) {
    return "Not selected";
  }

  return props.isSlackConnected ? "Connected" : "Not connected";
});

function isChannelSelected(channel: BriefingDeliveryChannel): boolean {
  return deliveryChannels.value.includes(channel);
}

function isChannelDisabled(channel: BriefingDeliveryChannel): boolean {
  return channel === BriefingDeliveryChannel.Slack && !props.isSlackConnected;
}

function toggleChannel(channel: BriefingDeliveryChannel): void {
  if (isChannelDisabled(channel)) return;

  if (isChannelSelected(channel)) {
    deliveryChannels.value = deliveryChannels.value.filter((c) => c !== channel);
  } else {
    deliveryChannels.value = [...deliveryChannels.value, channel];
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeIntegerInput(value: number, minimum: number, maximum: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return clamp(Math.trunc(value), minimum, maximum);
}

function normalizeScheduleHourInput(): void {
  scheduleHour.value = normalizeIntegerInput(
    scheduleHour.value,
    minimumScheduleHour,
    maximumScheduleHour,
    9
  );
}

function normalizeScheduleMinuteInput(): void {
  scheduleMinute.value = normalizeIntegerInput(
    scheduleMinute.value,
    minimumScheduleMinute,
    maximumScheduleMinute,
    0
  );
}

function normalizeMonthlyScheduleDayInput(): void {
  scheduleDay.value = normalizeIntegerInput(
    scheduleDay.value,
    minimumMonthlyDay,
    maximumMonthlyDay,
    1
  );
}

function applyScheduleHourValue(rawScheduleHour: number): void {
  const rawValue = Number.isFinite(rawScheduleHour) ? rawScheduleHour : 9;
  const totalMinutes = Math.round(rawValue * 60);
  const boundedTotalMinutes = clamp(
    totalMinutes,
    minimumScheduleHour * 60,
    maximumScheduleHour * 60 + maximumScheduleMinute
  );

  scheduleHour.value = Math.floor(boundedTotalMinutes / 60);
  scheduleMinute.value = boundedTotalMinutes % 60;
}

function getScheduleHourPayloadValue(): number {
  return Number((scheduleHour.value + (scheduleMinute.value / 60)).toFixed(4));
}

// Reset form when modal opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      error.value = null;
      showCancelConfirm.value = false;

      if (props.subscription) {
        // Edit mode: pre-fill from subscription
        schedulePreset.value = props.subscription.schedule_preset;
        scheduleDay.value = props.subscription.schedule_day ?? 1;
        applyScheduleHourValue(props.subscription.schedule_hour);
        deliveryChannels.value = [...props.subscription.delivery_channels];
        isActive.value = props.subscription.is_active;
      } else {
        // Create mode: defaults
        schedulePreset.value = BriefingSchedulePreset.Weekly;
        scheduleDay.value = 1;
        scheduleHour.value = 9;
        scheduleMinute.value = 0;
        deliveryChannels.value = [BriefingDeliveryChannel.Email];
        isActive.value = true;
      }
    }
  }
);

watch(
  () => schedulePreset.value,
  (preset) => {
    if (preset === BriefingSchedulePreset.Weekly && !isWeeklyScheduleDayValid.value) {
      scheduleDay.value = 1;
    }

    if (preset === BriefingSchedulePreset.Monthly && !isMonthlyScheduleDayValid.value) {
      scheduleDay.value = 1;
    }
  }
);

async function handleSubmit(): Promise<void> {
  if (!isScheduleHourValid.value) {
    error.value = "Hour must be between 0 and 23";
    return;
  }

  if (!isScheduleMinuteValid.value) {
    error.value = "Minute must be between 0 and 59";
    return;
  }

  if (schedulePreset.value === BriefingSchedulePreset.Weekly && !isWeeklyScheduleDayValid.value) {
    error.value = "Select a valid weekday";
    return;
  }

  if (schedulePreset.value === BriefingSchedulePreset.Monthly && !isMonthlyScheduleDayValid.value) {
    error.value = "Day of month must be between 1 and 28";
    return;
  }

  if (deliveryChannels.value.length === 0) {
    error.value = "Select at least one delivery channel";
    return;
  }

  isSubmitting.value = true;
  error.value = null;

  try {
    if (isEditMode.value && props.subscription) {
      const data: UpdateSubscriptionRequest = {
        schedule_preset: schedulePreset.value,
        schedule_day: showScheduleDay.value ? scheduleDay.value : null,
        schedule_hour: getScheduleHourPayloadValue(),
        delivery_channels: deliveryChannels.value,
        is_active: isActive.value,
      };

      const result = await updateSubscription(props.subscription.id, data);
      if (result) {
        emit("updated", result);
        close();
      }
    } else if (props.briefing) {
      const data: CreateSubscriptionRequest = {
        briefing_id: props.briefing.id,
        schedule_preset: schedulePreset.value,
        schedule_day: showScheduleDay.value ? scheduleDay.value : null,
        schedule_hour: getScheduleHourPayloadValue(),
        delivery_channels: deliveryChannels.value,
      };

      const result = await createSubscription(data);
      if (result) {
        emit("created", result);
        close();
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Something went wrong";
  } finally {
    isSubmitting.value = false;
  }
}

async function handleCancel(): Promise<void> {
  if (!props.subscription) return;

  isCancelling.value = true;
  error.value = null;

  try {
    const success = await cancelSubscription(props.subscription.id);
    if (success) {
      emit("cancelled");
      close();
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to cancel subscription";
  } finally {
    isCancelling.value = false;
  }
}

function close(): void {
  emit("update:modelValue", false);
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    size="lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex size-11 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface">
          <Icon
            :name="isEditMode ? 'lucide:settings' : 'lucide:bell'"
            class="size-5 text-text-secondary"
          />
        </div>
        <div class="min-w-0">
          <h2 class="text-balance text-lg font-semibold tracking-tight text-text-primary">
            {{ modalTitle }}
          </h2>
          <p class="truncate text-sm text-text-muted">
            {{ briefingTitle }}
          </p>
        </div>
      </div>
    </template>

    <div class="scrollbar-hidden max-h-[68vh] space-y-6 overflow-y-auto pr-1">
      <section class="rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3.5">
        <p class="text-sm leading-relaxed text-text-secondary">
          Configure cadence and channels for consistent briefing delivery across your workflow.
        </p>
      </section>

      <section
        v-if="isEditMode"
        class="rounded-2xl border border-border-subtle bg-bg-elevated px-4 py-3.5 transition-colors"
        :class="{ 'border-accent/30': isActive }"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-bg-surface">
              <Icon
                :name="isActive ? 'lucide:play' : 'lucide:pause'"
                class="size-4"
                :class="isActive ? 'text-text-secondary' : 'text-text-muted'"
              />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-text-primary">
                {{ isActive ? "Subscription Active" : "Subscription Paused" }}
              </h3>
              <p class="mt-0.5 text-sm text-text-muted">
                {{ isActive ? "Briefings are being delivered on schedule." : "Delivery is paused until reactivated." }}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="isActive"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0"
            :class="isActive ? 'bg-accent' : 'bg-bg-surface ring-1 ring-border-muted'"
            @click="isActive = !isActive"
          >
            <span
              class="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow transition-transform"
              :class="isActive ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-border-subtle bg-bg-elevated p-5">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-bg-surface text-text-muted">
            <Icon
              name="lucide:calendar-clock"
              class="size-4"
            />
          </div>
          <div class="flex-1 space-y-4">
            <div>
              <h3 class="text-sm font-semibold text-text-primary">
                Schedule
              </h3>
              <p class="mt-1 text-sm text-text-muted">
                Choose how often and when this briefing runs.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                v-for="preset in schedulePresets"
                :key="preset.value"
                type="button"
                class="h-10 rounded-lg border px-3 text-sm font-medium transition-colors"
                :class="schedulePreset === preset.value
                  ? 'border-accent bg-accent text-white'
                  : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-border-muted hover:text-text-primary'"
                @click="schedulePreset = preset.value"
              >
                {{ preset.label }}
              </button>
            </div>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="schedulePreset === BriefingSchedulePreset.Weekly"
                class="space-y-2"
              >
                <p class="text-xs font-medium uppercase tracking-wider text-text-muted">
                  Day Of Week
                </p>
                <div class="grid grid-cols-7 gap-1.5">
                  <button
                    v-for="day in weekDays"
                    :key="day.value"
                    type="button"
                    class="h-9 rounded-lg border px-2 text-center text-sm font-medium transition-colors"
                    :class="scheduleDay === day.value
                      ? 'border-accent bg-accent text-white'
                      : 'border-border-subtle bg-bg-surface text-text-secondary hover:border-border-muted hover:text-text-primary'"
                    @click="scheduleDay = day.value"
                  >
                    {{ day.label }}
                  </button>
                </div>
              </div>
            </Transition>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="schedulePreset === BriefingSchedulePreset.Monthly"
                class="space-y-2"
              >
                <label class="block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Day Of Month
                </label>
                <div class="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-end">
                  <input
                    v-model.number="scheduleDay"
                    type="number"
                    min="1"
                    max="28"
                    inputmode="numeric"
                    class="number-input h-10 rounded-lg border border-border-subtle bg-bg-surface px-3 text-center font-mono text-sm tabular-nums text-text-primary transition-colors [appearance:textfield] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    @blur="normalizeMonthlyScheduleDayInput"
                  >
                  <p class="text-xs text-text-muted">
                    Enter a value from 1 to 28.
                  </p>
                </div>
                <p
                  v-if="!isMonthlyScheduleDayValid"
                  class="text-xs text-error"
                >
                  Day of month must be between 1 and 28.
                </p>
              </div>
            </Transition>

            <div class="space-y-3">
              <div class="flex items-center justify-between gap-3">
                <label class="block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Time
                </label>
                <span class="inline-flex items-center rounded-md border border-border-subtle bg-bg-surface px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  UTC
                </span>
              </div>

              <div class="rounded-xl border border-border-subtle bg-bg-surface p-3 sm:max-w-[360px]">
                <div class="grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] items-end gap-2">
                  <div class="space-y-1">
                    <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      Hour
                    </p>
                    <input
                      v-model.number="scheduleHour"
                      type="number"
                      min="0"
                      max="23"
                      inputmode="numeric"
                      class="number-input h-12 w-full rounded-lg border border-border-subtle bg-bg-app px-3 text-center font-mono text-lg font-semibold tracking-[0.08em] tabular-nums text-text-primary transition-colors [appearance:textfield] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="00"
                      @blur="normalizeScheduleHourInput"
                    >
                  </div>

                  <span class="pb-3 text-center text-lg font-semibold text-text-muted">:</span>

                  <div class="space-y-1">
                    <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                      Minute
                    </p>
                    <input
                      v-model.number="scheduleMinute"
                      type="number"
                      min="0"
                      max="59"
                      inputmode="numeric"
                      class="number-input h-12 w-full rounded-lg border border-border-subtle bg-bg-app px-3 text-center font-mono text-lg font-semibold tracking-[0.08em] tabular-nums text-text-primary transition-colors [appearance:textfield] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="00"
                      @blur="normalizeScheduleMinuteInput"
                    >
                  </div>
                </div>
              </div>

              <p class="text-xs text-text-muted">
                24-hour format. Hour: 00-23, minute: 00-59.
              </p>
              <p
                v-if="!isScheduleHourValid || !isScheduleMinuteValid"
                class="text-xs text-error"
              >
                Enter a valid time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-border-subtle bg-bg-elevated p-5">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-bg-surface text-text-muted">
            <Icon
              name="lucide:send"
              class="size-4"
            />
          </div>
          <div class="flex-1 space-y-4">
            <div>
              <h3 class="text-sm font-semibold text-text-primary">
                Delivery Channels
              </h3>
              <p class="mt-1 text-sm text-text-muted">
                Select one or more destinations for generated briefings.
              </p>
            </div>

            <div class="space-y-2">
              <button
                v-for="channel in allChannels"
                :key="channel.value"
                type="button"
                class="flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors"
                :class="[
                  isChannelDisabled(channel.value)
                    ? 'border-border-subtle bg-bg-surface opacity-50 cursor-not-allowed'
                    : isChannelSelected(channel.value)
                      ? 'border-accent/35 bg-accent/[0.03]'
                      : 'border-border-subtle bg-bg-surface hover:border-border-muted',
                ]"
                :disabled="isChannelDisabled(channel.value)"
                @click="toggleChannel(channel.value)"
              >
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-md"
                  :class="isChannelSelected(channel.value) ? 'bg-accent/10 text-accent' : 'bg-bg-hover text-text-muted'"
                >
                  <Icon
                    :name="channel.icon"
                    class="size-4"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p
                    class="text-sm font-medium"
                    :class="isChannelSelected(channel.value) ? 'text-text-primary' : 'text-text-secondary'"
                  >
                    {{ channel.label }}
                  </p>
                  <p class="truncate text-xs text-text-muted">
                    <template v-if="isChannelDisabled(channel.value)">
                      Connect Slack in Settings &rarr; Integrations
                    </template>
                    <template v-else>
                      {{ channel.description }}
                    </template>
                  </p>
                </div>
                <div
                  class="flex size-5 items-center justify-center rounded-md border transition-colors"
                  :class="isChannelSelected(channel.value)
                    ? 'border-accent bg-accent'
                    : 'border-border-muted bg-bg-surface'"
                >
                  <Icon
                    v-if="isChannelSelected(channel.value)"
                    name="lucide:check"
                    class="size-3 text-white"
                  />
                </div>
              </button>
            </div>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="channel in selectedChannels"
                :key="channel.value"
                class="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary"
              >
                <Icon
                  :name="channel.icon"
                  class="size-3.5"
                />
                {{ channel.label }}
              </span>
              <span
                v-if="selectedChannels.length === 0"
                class="text-xs text-text-muted"
              >
                No channels selected
              </span>
            </div>

          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-border-subtle bg-bg-surface p-4">
        <p class="text-xs font-medium uppercase tracking-wider text-text-muted">
          Subscription Summary
        </p>
        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
            <p class="text-[11px] uppercase tracking-wider text-text-muted">
              Cadence
            </p>
            <p class="mt-1 text-sm font-medium text-text-primary">
              {{ cadenceSummary }}
            </p>
          </div>
          <div class="rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
            <p class="text-[11px] uppercase tracking-wider text-text-muted">
              Delivery Time
            </p>
            <p class="mt-1 text-sm font-medium text-text-primary">
              {{ deliveryTimeLabel }}
            </p>
          </div>
          <div class="rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
            <p class="text-[11px] uppercase tracking-wider text-text-muted">
              Channels
            </p>
            <p class="mt-1 text-sm font-medium text-text-primary">
              {{ channelSummary }}
            </p>
          </div>
          <div class="rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2">
            <p class="text-[11px] uppercase tracking-wider text-text-muted">
              Slack
            </p>
            <p class="mt-1 text-sm font-medium text-text-primary">
              {{ slackStatusLabel }}
            </p>
          </div>
        </div>
      </section>

      <div
        v-if="error"
        class="rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error"
      >
        {{ error }}
      </div>

      <section
        v-if="isEditMode"
        class="rounded-2xl border border-error/25 bg-error/5 p-4"
      >
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-error/10">
            <Icon
              name="lucide:triangle-alert"
              class="size-4 text-error"
            />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-text-primary">
              Cancel Subscription
            </h3>
            <p class="mt-1 text-sm text-text-muted">
              Permanently stop this subscription and remove its delivery schedule.
            </p>

            <div
              v-if="!showCancelConfirm"
              class="mt-3"
            >
              <BaseButton
                variant="danger"
                size="sm"
                class="whitespace-nowrap"
                @click="showCancelConfirm = true"
              >
                Cancel Subscription
              </BaseButton>
            </div>

            <div
              v-else
              class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <BaseButton
                variant="danger"
                size="sm"
                :loading="isCancelling"
                :disabled="isCancelling"
                class="whitespace-nowrap"
                @click="handleCancel"
              >
                Confirm Cancel
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="sm"
                :disabled="isCancelling"
                class="whitespace-nowrap"
                @click="showCancelConfirm = false"
              >
                Keep Subscription
              </BaseButton>
            </div>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-text-muted">
          Scheduled deliveries are processed in UTC.
        </p>

        <div class="flex w-full items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <BaseButton
            class="flex-1 whitespace-nowrap sm:flex-none"
            variant="secondary"
            @click="close"
          >
            Cancel
          </BaseButton>
          <BaseButton
            class="flex-1 whitespace-nowrap sm:flex-none"
            variant="primary"
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            <Icon
              v-if="!isSubmitting"
              :name="isEditMode ? 'lucide:save' : 'lucide:bell-plus'"
              class="mr-2 size-4"
            />
            {{ isEditMode ? 'Save Changes' : 'Subscribe' }}
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hidden::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.number-input::-webkit-inner-spin-button,
.number-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

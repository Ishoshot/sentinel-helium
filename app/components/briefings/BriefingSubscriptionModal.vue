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
}

const props = defineProps<Props>();

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
const deliveryChannels = ref<BriefingDeliveryChannel[]>([BriefingDeliveryChannel.Email]);
const slackWebhookUrl = ref("");
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

// Day options for monthly (1-28)
const monthDays = Array.from({ length: 28 }, (_, i) => i + 1);

// Hour options (0-23)
const hours = Array.from({ length: 24 }, (_, i) => ({
  label: `${String(i).padStart(2, "0")}:00 UTC`,
  value: i,
}));

// Available delivery channels
const allChannels = [
  { value: BriefingDeliveryChannel.Email, label: getDeliveryChannelLabel(BriefingDeliveryChannel.Email), icon: "lucide:mail" },
  { value: BriefingDeliveryChannel.Slack, label: getDeliveryChannelLabel(BriefingDeliveryChannel.Slack), icon: "lucide:hash" },
  { value: BriefingDeliveryChannel.Push, label: getDeliveryChannelLabel(BriefingDeliveryChannel.Push), icon: "lucide:bell" },
];

const showScheduleDay = computed(
  () => schedulePreset.value === BriefingSchedulePreset.Weekly || schedulePreset.value === BriefingSchedulePreset.Monthly
);

const showSlackWebhook = computed(
  () => deliveryChannels.value.includes(BriefingDeliveryChannel.Slack)
);

function isChannelSelected(channel: BriefingDeliveryChannel): boolean {
  return deliveryChannels.value.includes(channel);
}

function toggleChannel(channel: BriefingDeliveryChannel): void {
  if (isChannelSelected(channel)) {
    deliveryChannels.value = deliveryChannels.value.filter((c) => c !== channel);
  } else {
    deliveryChannels.value = [...deliveryChannels.value, channel];
  }
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
        scheduleHour.value = props.subscription.schedule_hour;
        deliveryChannels.value = [...props.subscription.delivery_channels];
        slackWebhookUrl.value = props.subscription.slack_webhook_url ?? "";
        isActive.value = props.subscription.is_active;
      } else {
        // Create mode: defaults
        schedulePreset.value = BriefingSchedulePreset.Weekly;
        scheduleDay.value = 1;
        scheduleHour.value = 9;
        deliveryChannels.value = [BriefingDeliveryChannel.Email];
        slackWebhookUrl.value = "";
        isActive.value = true;
      }
    }
  }
);

async function handleSubmit(): Promise<void> {
  if (deliveryChannels.value.length === 0) {
    error.value = "Select at least one delivery channel";
    return;
  }

  if (showSlackWebhook.value && !slackWebhookUrl.value.trim()) {
    error.value = "Slack webhook URL is required when Slack channel is selected";
    return;
  }

  isSubmitting.value = true;
  error.value = null;

  try {
    if (isEditMode.value && props.subscription) {
      const data: UpdateSubscriptionRequest = {
        schedule_preset: schedulePreset.value,
        schedule_day: showScheduleDay.value ? scheduleDay.value : null,
        schedule_hour: scheduleHour.value,
        delivery_channels: deliveryChannels.value,
        slack_webhook_url: showSlackWebhook.value ? slackWebhookUrl.value : null,
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
        schedule_hour: scheduleHour.value,
        delivery_channels: deliveryChannels.value,
        slack_webhook_url: showSlackWebhook.value ? slackWebhookUrl.value : null,
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
    size="md"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 ring-1 ring-accent/20">
          <Icon
            :name="isEditMode ? 'lucide:settings' : 'lucide:bell'"
            class="size-5 text-accent"
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-text-primary">
            {{ modalTitle }}
          </h2>
          <p class="text-sm text-text-muted">
            {{ briefingTitle }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Active/Paused Toggle (edit mode only) -->
      <div
        v-if="isEditMode"
        class="rounded-xl border border-border-subtle p-4 transition-all"
        :class="{ 'border-accent/30 bg-accent/[0.02]': isActive }"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
              :class="isActive ? 'bg-accent/10 text-accent' : 'bg-bg-surface text-text-muted'"
            >
              <Icon
                :name="isActive ? 'lucide:play' : 'lucide:pause'"
                class="size-4"
              />
            </div>
            <div>
              <h3 class="font-medium text-text-primary">
                {{ isActive ? 'Active' : 'Paused' }}
              </h3>
              <p class="mt-0.5 text-sm text-text-muted">
                {{ isActive ? 'Briefings are being delivered on schedule' : 'Delivery is paused' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="isActive"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            :class="isActive ? 'bg-accent' : 'bg-bg-surface ring-1 ring-border-muted'"
            @click="isActive = !isActive"
          >
            <span
              class="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition-transform"
              :class="isActive ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <!-- Schedule Preset -->
      <div class="rounded-xl border border-border-subtle p-4">
        <div class="flex items-start gap-3">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon
              name="lucide:calendar-clock"
              class="size-4"
            />
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-text-primary">
              Schedule
            </h3>
            <p class="mt-0.5 text-sm text-text-muted">
              How often should this briefing be generated?
            </p>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="preset in schedulePresets"
                :key="preset.value"
                type="button"
                class="rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                :class="schedulePreset === preset.value
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-bg-surface text-text-secondary ring-1 ring-border-subtle hover:ring-border-muted'"
                @click="schedulePreset = preset.value"
              >
                {{ preset.label }}
              </button>
            </div>

            <!-- Schedule Day (Weekly) -->
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
                class="mt-3"
              >
                <p class="mb-2 text-xs font-medium text-text-muted">
                  Day of week
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="day in weekDays"
                    :key="day.value"
                    type="button"
                    class="rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                    :class="scheduleDay === day.value
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg-surface text-text-secondary ring-1 ring-border-subtle hover:ring-border-muted'"
                    @click="scheduleDay = day.value"
                  >
                    {{ day.label }}
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Schedule Day (Monthly) -->
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
                class="mt-3"
              >
                <p class="mb-2 text-xs font-medium text-text-muted">
                  Day of month
                </p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="day in monthDays"
                    :key="day"
                    type="button"
                    class="size-8 rounded-lg text-sm font-medium transition-all"
                    :class="scheduleDay === day
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg-surface text-text-secondary ring-1 ring-border-subtle hover:ring-border-muted'"
                    @click="scheduleDay = day"
                  >
                    {{ day }}
                  </button>
                </div>
              </div>
            </Transition>

            <!-- Schedule Hour -->
            <div class="mt-3">
              <p class="mb-2 text-xs font-medium text-text-muted">
                Time (UTC)
              </p>
              <select
                v-model.number="scheduleHour"
                class="w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option
                  v-for="hour in hours"
                  :key="hour.value"
                  :value="hour.value"
                >
                  {{ hour.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Channels -->
      <div class="rounded-xl border border-border-subtle p-4">
        <div class="flex items-start gap-3">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Icon
              name="lucide:send"
              class="size-4"
            />
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-text-primary">
              Delivery
            </h3>
            <p class="mt-0.5 text-sm text-text-muted">
              Where should the briefing be delivered?
            </p>

            <div class="mt-3 space-y-2">
              <button
                v-for="channel in allChannels"
                :key="channel.value"
                type="button"
                class="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all"
                :class="isChannelSelected(channel.value)
                  ? 'border-accent/30 bg-accent/[0.02]'
                  : 'border-border-subtle hover:border-border-muted'"
                @click="toggleChannel(channel.value)"
              >
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
                  :class="isChannelSelected(channel.value) ? 'bg-accent/10 text-accent' : 'bg-bg-surface text-text-muted'"
                >
                  <Icon
                    :name="channel.icon"
                    class="size-4"
                  />
                </div>
                <span
                  class="flex-1 text-sm font-medium"
                  :class="isChannelSelected(channel.value) ? 'text-text-primary' : 'text-text-secondary'"
                >
                  {{ channel.label }}
                </span>
                <div
                  class="flex size-5 items-center justify-center rounded-md border transition-all"
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

            <!-- Slack Webhook URL -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-if="showSlackWebhook"
                class="mt-3"
              >
                <BaseInput
                  v-model="slackWebhookUrl"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  :error="error && error.includes('webhook') ? error : ''"
                />
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="error && !error.includes('webhook')"
        class="rounded-lg bg-error/5 p-3 text-sm text-error ring-1 ring-error/20"
      >
        {{ error }}
      </div>

      <!-- Cancel Subscription (edit mode) -->
      <div
        v-if="isEditMode"
        class="rounded-xl border border-red-500/20 p-4"
      >
        <div class="flex items-start gap-3">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
            <Icon
              name="lucide:trash-2"
              class="size-4"
            />
          </div>
          <div class="flex-1">
            <h3 class="font-medium text-text-primary">
              Cancel Subscription
            </h3>
            <p class="mt-0.5 text-sm text-text-muted">
              Permanently stop receiving this briefing. This cannot be undone.
            </p>

            <div v-if="!showCancelConfirm">
              <button
                type="button"
                class="mt-3 rounded-lg border border-red-500/30 px-3 py-1.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                @click="showCancelConfirm = true"
              >
                Cancel Subscription
              </button>
            </div>
            <div
              v-else
              class="mt-3 flex items-center gap-2"
            >
              <button
                type="button"
                class="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50"
                :disabled="isCancelling"
                @click="handleCancel"
              >
                {{ isCancelling ? 'Cancelling...' : 'Confirm Cancel' }}
              </button>
              <button
                type="button"
                class="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
                :disabled="isCancelling"
                @click="showCancelConfirm = false"
              >
                Never mind
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <BaseButton
          variant="secondary"
          @click="close"
        >
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          <Icon
            :name="isEditMode ? 'lucide:save' : 'lucide:bell'"
            class="mr-2 size-4"
          />
          {{ isEditMode ? 'Save Changes' : 'Subscribe' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

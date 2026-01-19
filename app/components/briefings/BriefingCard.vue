<script setup lang="ts">
/**
 * BriefingCard - Clean, professional briefing card
 * Uses flexbox to ensure consistent height with actions pinned to bottom
 */

import type { Briefing, BriefingSubscription } from "~/types";

interface Props {
  briefing: Briefing;
  subscription?: BriefingSubscription | null;
  isEligible?: boolean;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  subscription: null,
  isEligible: true,
  showActions: true,
});

const emit = defineEmits<{
  generate: [briefing: Briefing];
  subscribe: [briefing: Briefing];
  manage: [subscription: BriefingSubscription];
  info: [briefing: Briefing];
}>();

// Icon mapping for briefing types
const iconMap: Record<string, string> = {
  standup: "lucide:coffee",
  "standup-update": "lucide:coffee",
  "weekly-team-summary": "lucide:users",
  "delivery-velocity": "lucide:rocket",
  "engineer-spotlight": "lucide:star",
  "company-update": "lucide:building-2",
  "sprint-retrospective": "lucide:refresh-ccw",
  "code-health": "lucide:heart-pulse",
  default: "lucide:file-text",
};

const briefingIcon = computed(() => {
  const icon = props.briefing.icon || iconMap[props.briefing.slug] || iconMap.default;
  return icon as string;
});

// Target audience display
const audienceDisplay = computed(() => {
  const roles = props.briefing.target_roles;
  if (!roles || roles.length === 0) return "Everyone";

  const roleLabels: Record<string, string> = {
    engineer: "Engineers",
    lead: "Leads",
    manager: "Managers",
    executive: "Executives",
    developer: "Developers",
    engineering_manager: "Engineering Managers",
    tech_lead: "Tech Leads",
  };

  return roles
    .slice(0, 2)
    .map((r) => roleLabels[r] || r.charAt(0).toUpperCase() + r.slice(1))
    .join(", ");
});

// Subscription status
const hasSubscription = computed(() => !!props.subscription?.is_active);
const nextDelivery = computed(() => {
  if (!props.subscription?.next_scheduled_at) return null;
  return new Date(props.subscription.next_scheduled_at);
});

// Output format display
const formatDisplay = computed(() => {
  const formats = props.briefing.output_formats;
  if (!formats || formats.length === 0) return "";
  return formats.slice(0, 2).join(", ").toUpperCase();
});

function handleTitleClick() {
  emit("info", props.briefing);
}

function handleGenerate() {
  emit("generate", props.briefing);
}

function handleSubscribe() {
  emit("subscribe", props.briefing);
}

function handleManage() {
  if (props.subscription) {
    emit("manage", props.subscription);
  }
}
</script>

<template>
  <div
    class="group relative h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    :class="[!isEligible && 'opacity-60 pointer-events-none']"
  >
    <!-- Card content - grows to fill space -->
    <div class="flex-1 p-5 flex flex-col">
      <!-- Header -->
      <div class="flex items-start gap-4 mb-3">
        <!-- Icon -->
        <div class="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center bg-gray-100">
          <Icon
            :name="briefingIcon"
            class="w-5 h-5 text-gray-600"
          />
        </div>

        <!-- Title & Meta -->
        <div class="flex-1 min-w-0">
          <button
            type="button"
            class="text-left w-full group/title"
            @click="handleTitleClick"
          >
            <h3 class="font-semibold text-gray-900 text-base leading-tight mb-1 truncate group-hover/title:text-blue-600 transition-colors">
              {{ briefing.title }}
            </h3>
          </button>
          <p class="text-xs text-gray-500">
            {{ audienceDisplay }}
          </p>
        </div>

        <!-- Subscription badge -->
        <div
          v-if="hasSubscription"
          class="shrink-0"
        >
          <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md">
            <Icon
              name="lucide:bell"
              class="w-3 h-3"
            />
            Active
          </span>
        </div>
      </div>

      <!-- Description - fixed height with 3 line clamp -->
      <p class="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
        {{ briefing.description }}
      </p>

      <!-- Tags - grows to push actions down -->
      <div class="flex-1 flex flex-wrap content-start items-start gap-2">
        <!-- AI Badge -->
        <span
          v-if="briefing.requires_ai"
          class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md"
        >
          <Icon
            name="lucide:sparkles"
            class="w-3 h-3"
          />
          AI-Powered
        </span>

        <!-- Format badge -->
        <span
          v-if="formatDisplay"
          class="inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md"
        >
          {{ formatDisplay }}
        </span>

        <!-- Schedulable badge -->
        <span
          v-if="briefing.is_schedulable"
          class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md"
        >
          <Icon
            name="lucide:calendar"
            class="w-3 h-3"
          />
          Schedulable
        </span>
      </div>

      <!-- Next delivery info -->
      <div
        v-if="hasSubscription && nextDelivery"
        class="mt-4 flex items-center gap-2 text-xs text-gray-500"
      >
        <Icon
          name="lucide:clock"
          class="w-3.5 h-3.5"
        />
        <span>
          Next:
          <time
            :datetime="nextDelivery.toISOString()"
            class="font-medium text-gray-700"
          >
            {{ nextDelivery.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) }}
          </time>
        </span>
      </div>
    </div>

    <!-- Actions - always at bottom -->
    <div
      v-if="showActions"
      class="shrink-0 px-5 pb-5"
    >
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <BaseButton
          variant="primary"
          size="sm"
          @click="handleGenerate"
        >
          <Icon
            name="lucide:play"
            class="w-4 h-4 mr-1.5"
          />
          Generate
        </BaseButton>

        <BaseButton
          v-if="briefing.is_schedulable"
          variant="ghost"
          size="sm"
          @click="hasSubscription ? handleManage() : handleSubscribe()"
        >
          <Icon
            :name="hasSubscription ? 'lucide:settings' : 'lucide:bell-plus'"
            class="w-4 h-4"
          />
        </BaseButton>
      </div>
    </div>

    <!-- Ineligible overlay -->
    <div
      v-if="!isEligible"
      class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl"
    >
      <div class="text-center px-4">
        <Icon
          name="lucide:lock"
          class="w-6 h-6 text-gray-400 mx-auto mb-2"
        />
        <p class="text-sm font-medium text-gray-600">
          Upgrade to access
        </p>
      </div>
    </div>
  </div>
</template>

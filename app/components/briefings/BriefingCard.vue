<script setup lang="ts">
/**
 * BriefingCard - Template card for briefing types
 * Modern design with visual hierarchy and subtle interactions
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

const colorMap: Record<string, { bg: string; icon: string; accent: string }> = {
  standup: { bg: "bg-amber-100", icon: "text-amber-600", accent: "from-amber-500/10" },
  "standup-update": { bg: "bg-amber-100", icon: "text-amber-600", accent: "from-amber-500/10" },
  "weekly-team-summary": { bg: "bg-blue-100", icon: "text-blue-600", accent: "from-blue-500/10" },
  "delivery-velocity": { bg: "bg-rose-100", icon: "text-rose-600", accent: "from-rose-500/10" },
  "engineer-spotlight": { bg: "bg-violet-100", icon: "text-violet-600", accent: "from-violet-500/10" },
  "company-update": { bg: "bg-emerald-100", icon: "text-emerald-600", accent: "from-emerald-500/10" },
  "sprint-retrospective": { bg: "bg-cyan-100", icon: "text-cyan-600", accent: "from-cyan-500/10" },
  "code-health": { bg: "bg-pink-100", icon: "text-pink-600", accent: "from-pink-500/10" },
  default: { bg: "bg-slate-100", icon: "text-slate-600", accent: "from-slate-500/10" },
};

const briefingIcon = computed(() => {
  return props.briefing.icon || iconMap[props.briefing.slug] || iconMap.default;
});

const briefingColors = computed(() => {
  return colorMap[props.briefing.slug] || colorMap.default;
});

const audienceDisplay = computed(() => {
  const roles = props.briefing.target_roles;
  if (!roles || roles.length === 0) return "Everyone";

  const roleLabels: Record<string, string> = {
    engineer: "Engineers",
    lead: "Leads",
    manager: "Managers",
    executive: "Executives",
    developer: "Developers",
    engineering_manager: "Eng. Managers",
    tech_lead: "Tech Leads",
  };

  return roles
    .slice(0, 2)
    .map((r) => roleLabels[r] || r.charAt(0).toUpperCase() + r.slice(1))
    .join(" · ");
});

const hasSubscription = computed(() => !!props.subscription?.is_active);
const nextDelivery = computed(() => {
  if (!props.subscription?.next_scheduled_at) return null;
  return new Date(props.subscription.next_scheduled_at);
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
  <article
    class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
    :class="[!isEligible && 'opacity-60']"
  >
    <!-- Subtle gradient accent on hover -->
    <div
      class="pointer-events-none absolute -right-20 -top-20 size-40 rounded-full bg-gradient-to-br to-transparent opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
      :class="briefingColors.accent"
    />

    <!-- Header -->
    <div class="relative flex items-start justify-between p-4 pb-0">
      <!-- Icon -->
      <div
        class="flex size-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
        :class="briefingColors.bg"
      >
        <Icon
          :name="briefingIcon"
          class="size-5"
          :class="briefingColors.icon"
        />
      </div>

      <!-- Active indicator -->
      <div v-if="hasSubscription" class="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 ring-1 ring-emerald-100">
        <span class="relative flex size-1.5">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span class="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
        </span>
        <span class="text-[11px] font-medium text-emerald-700">Active</span>
      </div>
    </div>

    <!-- Content -->
    <div class="relative flex flex-1 flex-col p-4">
      <!-- Title -->
      <button
        type="button"
        class="text-left"
        @click="handleTitleClick"
      >
        <h3 class="text-[15px] font-semibold text-slate-900 transition-colors group-hover:text-slate-700">
          {{ briefing.title }}
        </h3>
      </button>

      <!-- Audience -->
      <p class="mt-1 text-xs text-slate-500">
        {{ audienceDisplay }}
      </p>

      <!-- Description -->
      <p class="mt-2.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-slate-600">
        {{ briefing.description }}
      </p>

      <!-- Tags -->
      <div class="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          v-if="briefing.requires_ai"
          class="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-100"
        >
          <Icon name="lucide:sparkles" class="size-3" />
          AI
        </span>
        <span
          v-if="briefing.is_schedulable"
          class="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200"
        >
          <Icon name="lucide:calendar" class="size-3" />
          Schedulable
        </span>
      </div>

      <!-- Next delivery -->
      <p
        v-if="hasSubscription && nextDelivery"
        class="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500"
      >
        <Icon name="lucide:clock" class="size-3.5" />
        Next: {{ nextDelivery.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
      </p>
    </div>

    <!-- Actions -->
    <div
      v-if="showActions"
      class="relative flex items-center gap-2 border-t border-slate-100 p-3"
    >
      <button
        type="button"
        class="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-[13px] font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white/80"
        :disabled="!isEligible"
        @click="handleGenerate"
      >
        Generate
      </button>

      <button
        v-if="briefing.is_schedulable"
        type="button"
        class="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300"
        :disabled="!isEligible"
        :title="hasSubscription ? 'Manage subscription' : 'Subscribe'"
        @click="hasSubscription ? handleManage() : handleSubscribe()"
      >
        <Icon
          :name="hasSubscription ? 'lucide:settings' : 'lucide:bell'"
          class="size-4"
        />
      </button>
    </div>
  </article>
</template>

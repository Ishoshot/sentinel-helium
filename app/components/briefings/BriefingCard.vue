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
  standup: { bg: "bg-amber-500/10", icon: "text-amber-400", accent: "from-amber-500/10" },
  "standup-update": { bg: "bg-amber-500/10", icon: "text-amber-400", accent: "from-amber-500/10" },
  "weekly-team-summary": { bg: "bg-blue-500/10", icon: "text-blue-400", accent: "from-blue-500/10" },
  "delivery-velocity": { bg: "bg-rose-500/10", icon: "text-rose-400", accent: "from-rose-500/10" },
  "engineer-spotlight": { bg: "bg-violet-500/10", icon: "text-violet-400", accent: "from-violet-500/10" },
  "company-update": { bg: "bg-emerald-500/10", icon: "text-emerald-400", accent: "from-emerald-500/10" },
  "sprint-retrospective": { bg: "bg-cyan-500/10", icon: "text-cyan-400", accent: "from-cyan-500/10" },
  "code-health": { bg: "bg-pink-500/10", icon: "text-pink-400", accent: "from-pink-500/10" },
  default: { bg: "bg-bg-surface", icon: "text-text-secondary", accent: "from-bg-hover/50" },
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
    class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated transition-all duration-200 hover:border-border-muted"
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
      <div
        v-if="hasSubscription"
        class="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 ring-1 ring-emerald-500/20"
      >
        <span class="relative flex size-1.5">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span class="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
        </span>
        <span class="text-[11px] font-medium text-emerald-400">Active</span>
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
        <h3 class="text-[15px] font-semibold text-text-primary transition-colors group-hover:text-text-secondary">
          {{ briefing.title }}
        </h3>
      </button>

      <!-- Audience -->
      <p class="mt-1 text-xs text-text-muted">
        {{ audienceDisplay }}
      </p>

      <!-- Description -->
      <p class="mt-2.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-text-secondary">
        {{ briefing.description }}
      </p>

      <!-- Tags -->
      <div class="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          v-if="briefing.requires_ai"
          class="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-400 ring-1 ring-indigo-500/20"
        >
          <Icon
            name="lucide:sparkles"
            class="size-3"
          />
          AI
        </span>
        <span
          v-if="briefing.is_schedulable"
          class="inline-flex items-center gap-1 rounded-md bg-bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary ring-1 ring-border-subtle"
        >
          <Icon
            name="lucide:calendar"
            class="size-3"
          />
          Schedulable
        </span>
      </div>

      <!-- Next delivery -->
      <p
        v-if="hasSubscription && nextDelivery"
        class="mt-2.5 flex items-center gap-1.5 text-xs text-text-muted"
      >
        <Icon
          name="lucide:clock"
          class="size-3.5"
        />
        Next: {{ nextDelivery.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
      </p>
    </div>

    <!-- Actions -->
    <div
      v-if="showActions"
      class="relative flex items-center gap-2 border-t border-border-subtle p-3"
    >
      <button
        type="button"
        class="flex-1 rounded-lg bg-gradient-to-r from-accent to-teal-600 px-3 py-2 text-[13px] font-medium text-white transition-all hover:shadow-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!isEligible"
        @click="handleGenerate"
      >
        Generate
      </button>

      <button
        v-if="briefing.is_schedulable"
        type="button"
        class="flex size-9 items-center justify-center rounded-lg border border-border-subtle text-text-muted transition-all hover:border-border-muted hover:bg-bg-hover hover:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
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

<style scoped>
.hover\:shadow-glow:hover {
  box-shadow: 0 0 20px -5px rgba(20, 184, 166, 0.4);
}
</style>

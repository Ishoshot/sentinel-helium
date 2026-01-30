<script setup lang="ts">
import type { BillingInterval, Plan, PlanFeatureKey } from "~/types";

/**
 * PlanCard - Sleek plan display card
 * Refined design with clean hierarchy and elegant interactions
 */

interface Props {
  plan: Plan;
  isCurrent?: boolean;
  highlight?: boolean;
  canManage?: boolean;
  billingInterval?: BillingInterval;
  actionLabel?: string;
  actionDisabled?: boolean;
  actionLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCurrent: false,
  highlight: false,
  canManage: true,
  billingInterval: "monthly",
  actionLabel: "Select plan",
  actionDisabled: false,
  actionLoading: false,
});

const emit = defineEmits<{
  action: [plan: Plan];
}>();

const tierConfig: Record<Plan["tier"], { label: string; icon: string; gradient: string }> = {
  foundation: {
    label: "Foundation",
    icon: "lucide:layers",
    gradient: "from-slate-600 to-slate-700",
  },
  illuminate: {
    label: "Illuminate",
    icon: "lucide:sparkles",
    gradient: "from-blue-500 to-indigo-600",
  },
  orchestrate: {
    label: "Orchestrate",
    icon: "lucide:zap",
    gradient: "from-violet-500 to-purple-600",
  },
  sanctum: {
    label: "Sanctum",
    icon: "lucide:shield-check",
    gradient: "from-amber-500 to-orange-600",
  },
};

const featureLabels: Record<PlanFeatureKey, string> = {
  byok_enabled: "BYOK",
  custom_guidelines: "Custom guidelines",
  priority_queue: "Priority queue",
  api_access: "API access",
  sso_enabled: "SSO",
  audit_logs: "Audit logs",
};

const tierInfo = computed(() => tierConfig[props.plan.tier]);
const isMonthly = computed(() => props.billingInterval === "monthly");

const selectedPriceLabel = computed(() => {
  if (!props.plan.currency) return "Custom";
  if (isMonthly.value) {
    return props.plan.price_monthly ? `$${props.plan.price_monthly}` : "Custom";
  }
  return props.plan.price_yearly ? `$${props.plan.price_yearly}` : "Custom";
});

const currencyCaption = computed(() => {
  if (!props.plan.currency) return "Contact us";
  return isMonthly.value ? "/mo" : "/year";
});

const yearlySavingsLabel = computed(() => {
  if (props.plan.yearly_savings_percent <= 0) return null;
  return `Save ${props.plan.yearly_savings_percent}%`;
});

const limitItems = computed(() => [
  {
    label: "Reviews",
    value:
      props.plan.monthly_runs_limit === null
        ? "Unlimited"
        : props.plan.monthly_runs_limit.toLocaleString(),
  },
  {
    label: "Commands",
    value:
      props.plan.monthly_commands_limit == null
        ? "Unlimited"
        : props.plan.monthly_commands_limit.toLocaleString(),
  },
  {
    label: "Team size",
    value:
      props.plan.team_size_limit === null
        ? "Unlimited"
        : props.plan.team_size_limit.toLocaleString(),
  },
]);

const featureItems = computed(() =>
  (Object.keys(featureLabels) as PlanFeatureKey[]).map((key) => ({
    key,
    label: featureLabels[key],
    enabled: props.plan.features[key],
  }))
);

function handleAction() {
  if (props.actionDisabled || props.isCurrent || props.actionLoading) return;
  emit("action", props.plan);
}
</script>

<template>
  <div
    class="group relative flex h-full flex-col rounded-2xl border bg-white p-6 transition-all duration-300"
    :class="[
      highlight
        ? 'border-accent shadow-lg shadow-accent/10 ring-1 ring-accent/20'
        : 'border-border-subtle hover:border-border-muted hover:shadow-md',
      isCurrent ? 'ring-2 ring-accent/30' : '',
    ]"
  >
    <!-- Popular Badge -->
    <div
      v-if="highlight"
      class="absolute -top-3 left-6"
    >
      <span class="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-sm">
        Most popular
      </span>
    </div>

    <!-- Header -->
    <div class="mb-6">
      <div class="mb-4 flex items-center gap-3">
        <div
          class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br"
          :class="tierInfo.gradient"
        >
          <Icon
            :name="tierInfo.icon"
            class="size-5 text-white"
          />
        </div>
        <div>
          <h3 class="font-semibold text-text-primary">
            {{ tierInfo.label }}
          </h3>
          <span
            v-if="isCurrent"
            class="text-xs text-accent"
          >
            Current plan
          </span>
        </div>
      </div>

      <p
        v-if="plan.description"
        class="text-sm leading-relaxed text-text-muted"
      >
        {{ plan.description }}
      </p>
    </div>

    <!-- Price -->
    <div class="mb-6">
      <div class="flex items-baseline gap-1">
        <span class="text-4xl font-bold tracking-tight text-text-primary">
          {{ selectedPriceLabel }}
        </span>
        <span class="text-sm text-text-muted">
          {{ currencyCaption }}
        </span>
      </div>
      <div
        v-if="yearlySavingsLabel && !isMonthly"
        class="mt-2"
      >
        <span class="text-xs font-medium text-emerald-600">
          {{ yearlySavingsLabel }} annually
        </span>
      </div>
    </div>

    <!-- Limits -->
    <div class="mb-6 space-y-3 border-t border-border-subtle pt-6">
      <div
        v-for="item in limitItems"
        :key="item.label"
        class="flex items-center justify-between text-sm"
      >
        <span class="text-text-muted">{{ item.label }}</span>
        <span class="font-medium text-text-primary">
          {{ item.value }}
        </span>
      </div>
    </div>

    <!-- Features -->
    <div class="mb-6 flex-1 space-y-2">
      <div
        v-for="feature in featureItems"
        :key="feature.key"
        class="flex items-center gap-2"
      >
        <Icon
          :name="feature.enabled ? 'lucide:check' : 'lucide:minus'"
          class="size-4"
          :class="feature.enabled ? 'text-emerald-500' : 'text-text-muted/30'"
        />
        <span
          class="text-sm"
          :class="feature.enabled ? 'text-text-secondary' : 'text-text-muted/50'"
        >
          {{ feature.label }}
        </span>
      </div>
    </div>

    <!-- CTA -->
    <button
      type="button"
      class="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200"
      :class="[
        isCurrent
          ? 'cursor-default bg-bg-surface text-text-muted'
          : highlight
            ? 'bg-accent text-white shadow-md shadow-accent/25 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98]'
            : 'bg-text-primary text-white hover:bg-text-secondary active:scale-[0.98]',
        (!canManage || actionDisabled) && !isCurrent ? 'cursor-not-allowed opacity-50' : '',
      ]"
      :disabled="!canManage || actionDisabled || isCurrent || actionLoading"
      @click="handleAction"
    >
      <span
        v-if="actionLoading"
        class="flex items-center justify-center gap-2"
      >
        <Icon
          name="lucide:loader-2"
          class="size-4 animate-spin"
        />
        Processing
      </span>
      <span v-else>
        {{ canManage ? actionLabel : "Contact owner" }}
      </span>
    </button>
  </div>
</template>

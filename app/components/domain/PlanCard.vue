<script setup lang="ts">
import type { BillingInterval, Plan, PlanFeatureKey } from "~/types";

/**
 * PlanCard - Premium plan display card
 * Presentational component for plan comparison
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

const tierLabels: Record<Plan["tier"], string> = {
  foundation: "Foundation",
  illuminate: "Illuminate",
  orchestrate: "Orchestrate",
  sanctum: "Sanctum",
};

const featureLabels: Record<PlanFeatureKey, string> = {
  byok_enabled: "Provider keys",
  custom_guidelines: "Custom guidelines",
  priority_queue: "Priority queue",
  api_access: "API access",
  sso_enabled: "Single sign-on",
  audit_logs: "Audit logs",
};

const isMonthly = computed(() => props.billingInterval === "monthly");

const selectedPriceLabel = computed(() => {
  if (!props.plan.currency) return "Custom";
  if (isMonthly.value) {
    return props.plan.price_monthly ? `$${props.plan.price_monthly}` : "Custom";
  }
  return props.plan.price_yearly ? `$${props.plan.price_yearly}` : "Custom";
});

const currencyCaption = computed(() => {
  if (!props.plan.currency) return "Custom";
  return isMonthly.value
    ? `${props.plan.currency} / month`
    : `${props.plan.currency} / year`;
});

const monthlyPricingLine = computed(() => {
  if (!props.plan.price_monthly || !props.plan.currency) {
    return "Contact sales";
  }
  return `$${props.plan.price_monthly}/mo billed monthly`;
});

const yearlyPricingLine = computed(() => {
  if (!props.plan.price_yearly || !props.plan.currency) {
    return "Contact sales";
  }
  return `$${props.plan.price_yearly}/yr billed yearly`;
});

const yearlySavingsLabel = computed(() => {
  if (props.plan.yearly_savings_percent <= 0) return null;
  return `Save ${props.plan.yearly_savings_percent}%`;
});

const limitItems = computed(() => [
  {
    label: "Reviews per month",
    value:
      props.plan.monthly_runs_limit === null
        ? "Unlimited"
        : props.plan.monthly_runs_limit.toLocaleString(),
  },
  {
    label: "Team members",
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
    class="relative h-full rounded-2xl border bg-bg-elevated transition-all duration-200"
    :class="[
      highlight
        ? 'border-accent/30 shadow-elevated'
        : 'border-border-subtle hover:border-border-muted hover:shadow-subtle',
      isCurrent ? 'ring-1 ring-accent/30' : '',
    ]"
  >
    <div class="p-6 flex flex-col h-full">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-semibold text-text-primary">
              {{ tierLabels[plan.tier] }}
            </h3>
            <BaseBadge
              v-if="isCurrent"
              variant="primary"
              size="sm"
            >
              Current plan
            </BaseBadge>
          </div>
        </div>
        <div class="text-right">
          <p class="text-2xl font-semibold text-text-primary">
            {{ selectedPriceLabel }}
          </p>
          <p class="text-xs text-text-muted">
            {{ currencyCaption }}
          </p>
        </div>
      </div>

      <p
        v-if="plan.description"
        class="mt-3 text-sm text-text-muted"
      >
        {{ plan.description }}
      </p>

      <div class="mt-4 space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-text-muted">Monthly</span>
          <span
            class="text-right"
            :class="isMonthly ? 'text-text-primary font-medium' : 'text-text-muted'"
          >
            {{ monthlyPricingLine }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-text-muted">Yearly</span>
            <BaseBadge
              v-if="yearlySavingsLabel"
              variant="primary"
              size="sm"
            >
              {{ yearlySavingsLabel }}
            </BaseBadge>
          </div>
          <span
            class="text-right"
            :class="isMonthly ? 'text-text-muted' : 'text-text-primary font-medium'"
          >
            {{ yearlyPricingLine }}
          </span>
        </div>
      </div>

      <div class="mt-5 space-y-3">
        <div
          v-for="item in limitItems"
          :key="item.label"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-text-muted">{{ item.label }}</span>
          <span class="text-text-primary font-medium">{{ item.value }}</span>
        </div>
      </div>

      <div class="mt-6 border-t border-border-subtle pt-4 space-y-3">
        <div
          v-for="feature in featureItems"
          :key="feature.key"
          class="flex items-center gap-2 text-sm"
          :class="feature.enabled ? 'text-text-secondary' : 'text-text-muted'"
        >
          <Icon
            :name="feature.enabled ? 'lucide:check-circle' : 'lucide:minus-circle'"
            class="w-4 h-4"
            :class="feature.enabled ? 'text-accent' : 'text-text-muted/60'"
          />
          <span>{{ feature.label }}</span>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-border-subtle">
        <BaseButton
          class="w-full"
          :variant="isCurrent ? 'secondary' : 'primary'"
          :disabled="!canManage || actionDisabled || isCurrent"
          :loading="actionLoading"
          @click="handleAction"
        >
          {{ canManage ? actionLabel : "Contact owner" }}
        </BaseButton>
      </div>
    </div>

    <div
      v-if="highlight"
      class="absolute inset-x-6 -bottom-3 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent"
    />
  </div>
</template>

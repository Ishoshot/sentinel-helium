<script setup lang="ts">
import type { BillingInterval, Plan, PlanFeatureKey } from "~/types";

/**
 * PlanCard - Premium plan display card
 * State-of-the-art design with gradients and refined visual hierarchy
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
    gradient: "from-slate-500 to-slate-600",
  },
  illuminate: {
    label: "Illuminate",
    icon: "lucide:sparkles",
    gradient: "from-accent to-blue-500",
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

const featureLabels: Record<PlanFeatureKey, { label: string; icon: string }> = {
  byok_enabled: { label: "Provider keys (BYOK)", icon: "lucide:key" },
  custom_guidelines: { label: "Custom guidelines", icon: "lucide:file-text" },
  priority_queue: { label: "Priority queue", icon: "lucide:rocket" },
  api_access: { label: "API access", icon: "lucide:code" },
  sso_enabled: { label: "Single sign-on", icon: "lucide:fingerprint" },
  audit_logs: { label: "Audit logs", icon: "lucide:scroll-text" },
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
  if (!props.plan.currency) return "Contact sales";
  return isMonthly.value ? "per month" : "per year";
});

const yearlySavingsLabel = computed(() => {
  if (props.plan.yearly_savings_percent <= 0) return null;
  return `Save ${props.plan.yearly_savings_percent}%`;
});

const limitItems = computed(() => [
  {
    label: "Reviews / month",
    value:
      props.plan.monthly_runs_limit === null
        ? "Unlimited"
        : props.plan.monthly_runs_limit.toLocaleString(),
    icon: "lucide:git-pull-request",
  },
  {
    label: "Commands / month",
    value:
      props.plan.monthly_commands_limit == null
        ? "Unlimited"
        : props.plan.monthly_commands_limit.toLocaleString(),
    icon: "lucide:terminal",
  },
  {
    label: "Team members",
    value:
      props.plan.team_size_limit === null
        ? "Unlimited"
        : props.plan.team_size_limit.toLocaleString(),
    icon: "lucide:users",
  },
]);

const featureItems = computed(() =>
  (Object.keys(featureLabels) as PlanFeatureKey[]).map((key) => ({
    key,
    ...featureLabels[key],
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
    class="group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300"
    :class="[
      highlight
        ? 'border-accent/40 bg-gradient-to-b from-accent/[0.03] to-transparent shadow-[0_0_0_1px_rgba(37,99,235,0.1),0_8px_40px_-12px_rgba(37,99,235,0.25)]'
        : 'border-border-subtle bg-bg-elevated hover:border-border-muted hover:shadow-elevated',
      isCurrent && !highlight ? 'ring-2 ring-accent/20 ring-offset-2 ring-offset-bg-app' : '',
    ]"
  >
    <!-- Popular Badge -->
    <div
      v-if="highlight"
      class="absolute -right-12 top-6 z-10 rotate-45 bg-gradient-to-r from-accent to-blue-500 px-12 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg"
    >
      Popular
    </div>

    <!-- Card Content -->
    <div class="flex flex-1 flex-col p-6">
      <!-- Header -->
      <div class="mb-6">
        <div class="mb-4 flex items-center gap-3">
          <div
            class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm"
            :class="tierInfo.gradient"
          >
            <Icon
              :name="tierInfo.icon"
              class="size-5 text-white"
            />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-text-primary">
              {{ tierInfo.label }}
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

        <p
          v-if="plan.description"
          class="text-sm leading-relaxed text-text-muted"
        >
          {{ plan.description }}
        </p>
      </div>

      <!-- Pricing -->
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
          <span class="inline-flex items-center gap-1 rounded-full bg-success-light px-2.5 py-1 text-xs font-medium text-success">
            <Icon
              name="lucide:badge-percent"
              class="size-3"
            />
            {{ yearlySavingsLabel }}
          </span>
        </div>
      </div>

      <!-- Limits -->
      <div class="mb-6 space-y-3 rounded-xl bg-bg-surface/50 p-4">
        <div
          v-for="item in limitItems"
          :key="item.label"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2 text-sm text-text-muted">
            <Icon
              :name="item.icon"
              class="size-4"
            />
            <span>{{ item.label }}</span>
          </div>
          <span class="text-sm font-semibold text-text-primary">
            {{ item.value }}
          </span>
        </div>
      </div>

      <!-- Features -->
      <div class="flex-1 space-y-2.5">
        <p class="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
          Features
        </p>
        <div
          v-for="feature in featureItems"
          :key="feature.key"
          class="flex items-center gap-2.5"
        >
          <div
            class="flex size-5 items-center justify-center rounded-full"
            :class="feature.enabled ? 'bg-success-light' : 'bg-bg-surface'"
          >
            <Icon
              :name="feature.enabled ? 'lucide:check' : 'lucide:minus'"
              class="size-3"
              :class="feature.enabled ? 'text-success' : 'text-text-muted/50'"
            />
          </div>
          <span
            class="text-sm"
            :class="feature.enabled ? 'text-text-secondary' : 'text-text-muted/60'"
          >
            {{ feature.label }}
          </span>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-6 pt-4">
        <button
          type="button"
          class="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200"
          :class="[
            isCurrent
              ? 'cursor-default bg-bg-surface text-text-muted'
              : highlight
                ? 'bg-gradient-to-r from-accent to-blue-500 text-white shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98]'
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
            Processing...
          </span>
          <span v-else>
            {{ canManage ? actionLabel : "Contact owner" }}
          </span>
        </button>
      </div>
    </div>

    <!-- Highlight glow effect -->
    <div
      v-if="highlight"
      class="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent to-transparent"
    />
  </div>
</template>

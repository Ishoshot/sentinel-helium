<script setup lang="ts">
import { MemberRole } from "~/types";
import type { BillingInterval, Plan, PlanTier, Promotion } from "~/types";
import { useUserStore } from "~/stores/useUserStore";
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";
import { useAppToast } from "~/composables/shared/useAppToast";
import { useMembers } from "~/composables/members/useMembers";
import { useBilling } from "~/composables/billing/useBilling";
import DomainBillingPlanCard from "~/components/domain/billing/PlanCard.vue";

/**
 * Billing page - Premium plan management and usage visibility
 * State-of-the-art design with visual hierarchy and polish
 */

definePageMeta({
  middleware: ["auth", "workspace"],
});

const toast = useAppToast();
const userStore = useUserStore();
const workspaceStore = useWorkspaceStore();
const workspaceId = computed(() => workspaceStore.currentWorkspaceId);

const { members, fetchMembers } = useMembers(workspaceId);
const {
  plans,
  subscription,
  usage,
  isLoadingPlans,
  isLoadingSubscription,
  isLoadingUsage,
  isProcessing,
  error,
  fetchPlans,
  fetchSubscription,
  fetchUsage,
  changePlan,
  openBillingPortal,
} = useBilling(workspaceId);

const showCancelModal = ref(false);
const pendingPlanId = ref<number | null>(null);
const isPortalLoading = ref(false);
const isCanceling = ref(false);
const promoCode = ref("");
const promoCodeError = ref<string | null>(null);
const promotionNotice = ref<Promotion | null>(null);
const pendingCheckoutUrl = ref<string | null>(null);
const showPromotionModal = ref(false);
const billingInterval = ref<BillingInterval>("monthly");

const currentMember = computed(() =>
  members.value.find((m) => m.user_id === userStore.user?.id)
);

const isOwner = computed(() => currentMember.value?.role === MemberRole.Owner);
const canManage = computed(() => isOwner.value);

const currentPlan = computed(() => subscription.value?.plan ?? null);
const currentStatus = computed(() => subscription.value?.status ?? null);

const planOrder: Record<PlanTier, number> = {
  foundation: 0,
  illuminate: 1,
  orchestrate: 2,
  sanctum: 3,
};

const tierConfig: Record<PlanTier, { icon: string; gradient: string; bgGradient: string }> = {
  foundation: {
    icon: "lucide:layers",
    gradient: "from-slate-500 to-slate-600",
    bgGradient: "from-slate-500/10 via-slate-500/5 to-transparent",
  },
  illuminate: {
    icon: "lucide:sparkles",
    gradient: "from-accent to-blue-500",
    bgGradient: "from-accent/10 via-accent/5 to-transparent",
  },
  orchestrate: {
    icon: "lucide:zap",
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-500/10 via-violet-500/5 to-transparent",
  },
  sanctum: {
    icon: "lucide:shield-check",
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
};

const currentTierConfig = computed(() =>
  currentPlan.value ? tierConfig[currentPlan.value.tier] : tierConfig.foundation
);

const sortedPlans = computed(() =>
  [...plans.value].sort(
    (a, b) => (planOrder[a.tier] ?? 0) - (planOrder[b.tier] ?? 0)
  )
);

const highlightedTier: PlanTier = "illuminate";

const isLoading = computed(
  () =>
    isLoadingPlans.value || isLoadingSubscription.value || isLoadingUsage.value
);

const usageProgress = computed(() => {
  if (!usage.value || !currentPlan.value) return null;
  if (currentPlan.value.monthly_runs_limit === null) return null;
  const limit = currentPlan.value.monthly_runs_limit;
  if (!limit) return null;
  return Math.min((usage.value.runs_count / limit) * 100, 100);
});

const usageLimitLabel = computed(() => {
  if (!currentPlan.value) return "—";
  if (currentPlan.value.monthly_runs_limit === null) return "Unlimited";
  return currentPlan.value.monthly_runs_limit.toLocaleString();
});

const isLimitReached = computed(() => {
  if (!usage.value || !currentPlan.value) return false;
  if (currentPlan.value.monthly_runs_limit === null) return false;
  return usage.value.runs_count >= currentPlan.value.monthly_runs_limit;
});

const isApproachingLimit = computed(() => {
  if (!usage.value || !currentPlan.value) return false;
  if (currentPlan.value.monthly_runs_limit === null) return false;
  return usage.value.runs_count / currentPlan.value.monthly_runs_limit >= 0.8;
});

const usagePeriodLabel = computed(() => {
  if (!usage.value) return "";
  return `${formatDate(usage.value.period_start)} – ${formatDate(usage.value.period_end)}`;
});

const daysRemaining = computed(() => {
  if (!usage.value) return null;
  const end = new Date(usage.value.period_end);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
});

const statusConfig = computed(() => {
  const configs = {
    active: {
      label: "Active",
      variant: "success" as const,
      icon: "lucide:check-circle",
      pulse: false,
    },
    trialing: {
      label: "Trial",
      variant: "warning" as const,
      icon: "lucide:clock",
      pulse: true,
    },
    past_due: {
      label: "Past due",
      variant: "warning" as const,
      icon: "lucide:alert-circle",
      pulse: true,
    },
    canceled: {
      label: "Canceled",
      variant: "error" as const,
      icon: "lucide:x-circle",
      pulse: false,
    },
  };
  return configs[currentStatus.value as keyof typeof configs] ?? configs.active;
});

const trialEndsLabel = computed(() => {
  if (!subscription.value?.trial_ends_at) return null;
  return formatDate(subscription.value.trial_ends_at);
});

const planActionLabel = (plan: Plan) => {
  if (currentPlan.value?.id === plan.id) return "Current plan";
  if (!hasPricingForInterval(plan, billingInterval.value)) {
    return "Contact sales";
  }
  if (!canManage.value) return "Contact owner";
  if (plan.tier === "foundation") return "Downgrade";

  if (currentPlan.value?.tier && planOrder[plan.tier] < planOrder[currentPlan.value.tier]) {
    return "Downgrade";
  }
  return "Upgrade";
};

const planActionDisabled = (plan: Plan) => {
  if (currentPlan.value?.id === plan.id) return true;
  if (!canManage.value) return true;
  // Foundation is free, no pricing check needed
  if (plan.tier === "foundation") {
    // Only enable downgrade to foundation if currently on a paid plan
    return currentPlan.value?.tier === "foundation";
  }
  if (!hasPricingForInterval(plan, billingInterval.value)) return true;
  return false;
};

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTierLabel(tier: string) {
  if (!tier) return "Plan";
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function hasPricingForInterval(plan: Plan, interval: BillingInterval) {
  if (!plan.currency) return false;
  if (interval === "yearly") {
    return !!plan.price_yearly;
  }
  return !!plan.price_monthly;
}

const yearlySavingsLabel = computed(() => {
  const highlightedSavings =
    plans.value.find((plan) => plan.tier === highlightedTier)
      ?.yearly_savings_percent ?? 0;
  const fallbackSavings = Math.max(
    ...plans.value.map((plan) => plan.yearly_savings_percent ?? 0),
    0
  );
  const savings = highlightedSavings > 0 ? highlightedSavings : fallbackSavings;
  if (savings <= 0) return null;
  return savings;
});

// Circular progress computations
const circleRadius = 54;
const circleCircumference = 2 * Math.PI * circleRadius;
const circleStrokeDashoffset = computed(() => {
  if (usageProgress.value === null) return circleCircumference;
  return circleCircumference - (usageProgress.value / 100) * circleCircumference;
});

async function handlePlanAction(plan: Plan) {
  if (planActionDisabled(plan)) return;
  promoCodeError.value = null;
  pendingPlanId.value = plan.id;

  // Capture original plan tier before change for toast message
  const originalTier = currentPlan.value?.tier;

  // For foundation (cancel/downgrade), no promo code
  const promoCodeToSend = plan.tier === "foundation" ? null : promoCode.value;

  const result = await changePlan(
    plan.tier,
    billingInterval.value,
    promoCodeToSend
  );
  pendingPlanId.value = null;

  if (result.promoCodeError) {
    promoCodeError.value = result.promoCodeError;
    return;
  }

  // Direct change (no checkout needed)
  if (result.directChange) {
    await fetchSubscription();
    if (plan.tier === "foundation") {
      toast.success("Subscription cancelled");
    } else if (originalTier && planOrder[plan.tier] < planOrder[originalTier]) {
      toast.success("Subscription downgraded");
    } else {
      toast.success("Subscription upgraded");
    }
    return;
  }

  // Checkout flow
  if (result.checkoutUrl) {
    if (result.promotion) {
      promotionNotice.value = result.promotion;
      pendingCheckoutUrl.value = result.checkoutUrl;
      showPromotionModal.value = true;
      return;
    }
    window.open(result.checkoutUrl, '_blank');
  }
}

function handlePromotionCheckout() {
  if (!pendingCheckoutUrl.value) return;
  window.location.href = pendingCheckoutUrl.value;
}

function handlePromotionDismiss() {
  showPromotionModal.value = false;
}

async function handleOpenPortal() {
  if (!canManage.value) return;
  isPortalLoading.value = true;
  const portalUrl = await openBillingPortal();
  isPortalLoading.value = false;
  if (portalUrl) {
    window.open(portalUrl, "_blank", "noopener");
  }
}

async function handleCancelSubscription() {
  if (!canManage.value) return;
  isCanceling.value = true;
  const result = await changePlan("foundation", "monthly", null);
  isCanceling.value = false;
  // Foundation is free, so it's always a direct change (no checkout)
  if (result.directChange) {
    showCancelModal.value = false;
    await fetchSubscription();
    toast.success("Subscription cancelled");
  }
}

onMounted(async () => {
  await Promise.all([fetchMembers(), fetchPlans(), fetchSubscription(), fetchUsage()]);
});

watch(error, (newError) => {
  if (newError) {
    toast.error(newError);
  }
});

watch(promoCode, () => {
  if (promoCodeError.value) {
    promoCodeError.value = null;
  }
});

watch(showPromotionModal, (isOpen) => {
  if (!isOpen) {
    promotionNotice.value = null;
    pendingCheckoutUrl.value = null;
  }
});
</script>

<template>
  <div class="space-y-10">
    <!-- Hero Section: Current Plan & Usage -->
    <section>
      <!-- Loading State -->
      <div
        v-if="isLoading && !subscription"
        class="grid gap-6 lg:grid-cols-5"
      >
        <div class="lg:col-span-3">
          <BaseSkeleton class="h-72 w-full rounded-2xl" />
        </div>
        <div class="lg:col-span-2">
          <BaseSkeleton class="h-72 w-full rounded-2xl" />
        </div>
      </div>

      <!-- Content -->
      <div
        v-else
        class="grid gap-6 lg:grid-cols-5"
      >
        <!-- Current Plan Card -->
        <div class="lg:col-span-3">
          <div
            v-if="!currentPlan"
            class="rounded-2xl border border-border-subtle bg-bg-elevated p-8"
          >
            <BaseEmptyState
              icon="lucide:credit-card"
              title="No plan assigned"
              description="This workspace does not have a plan yet."
              compact
            />
          </div>

          <div
            v-else
            class="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated"
          >
            <!-- Background gradient -->
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60"
              :class="currentTierConfig.bgGradient"
            />

            <!-- Decorative elements -->
            <div
              class="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-gradient-to-br opacity-20 blur-3xl"
              :class="currentTierConfig.gradient"
            />
            <div
              class="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-gradient-to-br opacity-10 blur-2xl"
              :class="currentTierConfig.gradient"
            />

            <div class="relative p-8">
              <!-- Header -->
              <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div class="flex items-start gap-4">
                  <div
                    class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg"
                    :class="currentTierConfig.gradient"
                  >
                    <Icon
                      :name="currentTierConfig.icon"
                      class="size-7 text-white"
                    />
                  </div>
                  <div>
                    <div class="mb-1 flex flex-wrap items-center gap-2">
                      <h2 class="text-2xl font-bold text-text-primary">
                        {{ formatTierLabel(currentPlan.tier) }}
                      </h2>
                      <div
                        class="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                        :class="{
                          'bg-success-light text-success': statusConfig.variant === 'success',
                          'bg-warning-light text-warning': statusConfig.variant === 'warning',
                          'bg-error-light text-error': statusConfig.variant === 'error',
                        }"
                      >
                        <span
                          v-if="statusConfig.pulse"
                          class="relative flex size-2"
                        >
                          <span
                            class="absolute inline-flex size-full animate-ping rounded-full opacity-75"
                            :class="{
                              'bg-warning': statusConfig.variant === 'warning',
                              'bg-error': statusConfig.variant === 'error',
                            }"
                          />
                          <span
                            class="relative inline-flex size-2 rounded-full"
                            :class="{
                              'bg-warning': statusConfig.variant === 'warning',
                              'bg-error': statusConfig.variant === 'error',
                            }"
                          />
                        </span>
                        <Icon
                          v-else
                          :name="statusConfig.icon"
                          class="size-3.5"
                        />
                        <span class="text-xs font-semibold">{{ statusConfig.label }}</span>
                      </div>
                    </div>
                    <p class="text-sm text-text-muted">
                      Your workspace subscription
                    </p>
                  </div>
                </div>

                <div class="text-left sm:text-right">
                  <div class="flex items-baseline gap-1 sm:justify-end">
                    <span class="text-4xl font-bold tracking-tight text-text-primary">
                      {{ currentPlan.price_monthly ? `$${currentPlan.price_monthly}` : "Custom" }}
                    </span>
                    <span class="text-sm text-text-muted">/mo</span>
                  </div>
                  <p class="mt-1 text-xs text-text-muted">
                    {{ currentPlan.currency ? "Billed monthly" : "Contact sales" }}
                  </p>
                </div>
              </div>

              <!-- Stats Grid -->
              <div class="mb-8 grid gap-4 sm:grid-cols-3">
                <div class="rounded-xl border border-border-subtle/50 bg-bg-elevated/80 p-4 backdrop-blur-sm">
                  <div class="mb-2 flex items-center gap-2 text-text-muted">
                    <Icon
                      name="lucide:git-pull-request"
                      class="size-4"
                    />
                    <span class="text-xs font-medium">Reviews / month</span>
                  </div>
                  <p class="text-2xl font-bold text-text-primary">
                    {{ currentPlan.monthly_runs_limit === null ? "Unlimited" : currentPlan.monthly_runs_limit.toLocaleString() }}
                  </p>
                </div>
                <div class="rounded-xl border border-border-subtle/50 bg-bg-elevated/80 p-4 backdrop-blur-sm">
                  <div class="mb-2 flex items-center gap-2 text-text-muted">
                    <Icon
                      name="lucide:users"
                      class="size-4"
                    />
                    <span class="text-xs font-medium">Team members</span>
                  </div>
                  <p class="text-2xl font-bold text-text-primary">
                    {{ currentPlan.team_size_limit === null ? "Unlimited" : currentPlan.team_size_limit.toLocaleString() }}
                  </p>
                </div>
                <div class="rounded-xl border border-border-subtle/50 bg-bg-elevated/80 p-4 backdrop-blur-sm">
                  <div class="mb-2 flex items-center gap-2 text-text-muted">
                    <Icon
                      name="lucide:terminal"
                      class="size-4"
                    />
                    <span class="text-xs font-medium">Commands / month</span>
                  </div>
                  <p class="text-2xl font-bold text-text-primary">
                    {{ currentPlan.monthly_commands_limit == null ? "Unlimited" : currentPlan.monthly_commands_limit.toLocaleString() }}
                  </p>
                </div>
                <div class="rounded-xl border border-border-subtle/50 bg-bg-elevated/80 p-4 backdrop-blur-sm">
                  <div class="mb-2 flex items-center gap-2 text-text-muted">
                    <Icon
                      name="lucide:calendar"
                      class="size-4"
                    />
                    <span class="text-xs font-medium">Billing cycle</span>
                  </div>
                  <p class="text-2xl font-bold text-text-primary">
                    Monthly
                  </p>
                </div>
              </div>

              <!-- Trial Notice -->
              <div
                v-if="trialEndsLabel"
                class="mb-6 flex items-center gap-3 rounded-xl border border-warning/20 bg-warning-light/50 p-4"
              >
                <Icon
                  name="lucide:hourglass"
                  class="size-5 text-warning"
                />
                <div>
                  <p class="text-sm font-medium text-warning">
                    Trial period active
                  </p>
                  <p class="text-xs text-warning/80">
                    Ends on {{ trialEndsLabel }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <BaseButton
                  variant="primary"
                  :disabled="!canManage || currentPlan.tier === 'foundation'"
                  :loading="isPortalLoading"
                  @click="handleOpenPortal"
                >
                  <Icon
                    name="lucide:credit-card"
                    class="size-4"
                  />
                  Manage billing
                </BaseButton>
                <BaseButton
                  v-if="currentPlan.tier !== 'foundation'"
                  variant="ghost"
                  :disabled="!canManage"
                  @click="showCancelModal = true"
                >
                  Cancel subscription
                </BaseButton>
                <p
                  v-if="!canManage"
                  class="text-xs text-text-muted"
                >
                  Only workspace owners can manage billing.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Card -->
        <div class="lg:col-span-2">
          <div class="h-full rounded-2xl border border-border-subtle bg-bg-elevated p-6">
            <div
              v-if="isLoadingUsage && !usage"
              class="flex h-full items-center justify-center"
            >
              <Icon
                name="lucide:loader-2"
                class="size-8 animate-spin text-text-muted"
              />
            </div>

            <div
              v-else-if="usage"
              class="flex h-full flex-col"
            >
              <!-- Header -->
              <div class="mb-6 flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-text-primary">
                    Usage
                  </h3>
                  <p class="text-xs text-text-muted">
                    {{ usagePeriodLabel }}
                  </p>
                </div>
                <div
                  v-if="daysRemaining !== null"
                  class="rounded-full bg-bg-surface px-2.5 py-1 text-xs font-medium text-text-muted"
                >
                  {{ daysRemaining }} days left
                </div>
              </div>

              <!-- Circular Progress -->
              <div class="mb-6 flex justify-center">
                <div class="relative">
                  <svg class="size-36 -rotate-90 transform">
                    <!-- Background circle -->
                    <circle
                      cx="72"
                      cy="72"
                      :r="circleRadius"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="12"
                      class="text-bg-surface"
                    />
                    <!-- Progress circle -->
                    <circle
                      v-if="usageProgress !== null"
                      cx="72"
                      cy="72"
                      :r="circleRadius"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="12"
                      stroke-linecap="round"
                      :stroke-dasharray="circleCircumference"
                      :stroke-dashoffset="circleStrokeDashoffset"
                      class="transition-all duration-700 ease-out"
                      :class="isLimitReached ? 'text-error' : isApproachingLimit ? 'text-warning' : 'text-accent'"
                    />
                  </svg>
                  <!-- Center content -->
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-3xl font-bold text-text-primary">
                      {{ usage.runs_count.toLocaleString() }}
                    </span>
                    <span class="text-xs text-text-muted">
                      of {{ usageLimitLabel }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Stats Row -->
              <div class="grid grid-cols-3 gap-3">
                <div class="rounded-lg bg-bg-surface p-3 text-center">
                  <Icon
                    name="lucide:git-pull-request"
                    class="mx-auto mb-1 size-4 text-text-muted"
                  />
                  <p class="text-lg font-semibold text-text-primary">
                    {{ usage.runs_count }}
                  </p>
                  <p class="text-[10px] text-text-muted">
                    Reviews
                  </p>
                </div>
                <div class="rounded-lg bg-bg-surface p-3 text-center">
                  <Icon
                    name="lucide:search"
                    class="mx-auto mb-1 size-4 text-text-muted"
                  />
                  <p class="text-lg font-semibold text-text-primary">
                    {{ usage.findings_count }}
                  </p>
                  <p class="text-[10px] text-text-muted">
                    Findings
                  </p>
                </div>
                <div class="rounded-lg bg-bg-surface p-3 text-center">
                  <Icon
                    name="lucide:message-square"
                    class="mx-auto mb-1 size-4 text-text-muted"
                  />
                  <p class="text-lg font-semibold text-text-primary">
                    {{ usage.annotations_count }}
                  </p>
                  <p class="text-[10px] text-text-muted">
                    Annotations
                  </p>
                </div>
              </div>

              <!-- Warning/Limit banners -->
              <div class="mt-auto pt-4">
                <div
                  v-if="isLimitReached"
                  class="flex items-start gap-3 rounded-xl border border-error/20 bg-error-light p-4"
                >
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-error/10">
                    <Icon
                      name="lucide:alert-triangle"
                      class="size-4 text-error"
                    />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-error">
                      Limit reached
                    </p>
                    <p class="text-xs text-error/80">
                      Upgrade to continue reviewing
                    </p>
                  </div>
                </div>

                <div
                  v-else-if="isApproachingLimit"
                  class="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning-light p-4"
                >
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning/10">
                    <Icon
                      name="lucide:alert-circle"
                      class="size-4 text-warning"
                    />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-warning">
                      Approaching limit
                    </p>
                    <p class="text-xs text-warning/80">
                      Consider upgrading soon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <BaseEmptyState
              v-else
              icon="lucide:bar-chart-3"
              title="No usage data"
              description="Usage will appear after reviews."
              compact
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Plans Section -->
    <section>
      <!-- Section Header -->
      <div class="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-text-primary">
            Choose your plan
          </h2>
          <p class="mt-1 text-sm text-text-muted">
            Compare plans and find the perfect fit for your team.
          </p>
        </div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
          <!-- Billing Toggle -->
          <div class="inline-flex items-center gap-1 rounded-xl border border-border-subtle bg-bg-surface p-1">
            <button
              type="button"
              class="relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
              :class="billingInterval === 'monthly'
                ? 'bg-bg-elevated text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'"
              @click="billingInterval = 'monthly'"
            >
              Monthly
            </button>
            <button
              type="button"
              class="relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
              :class="billingInterval === 'yearly'
                ? 'bg-bg-elevated text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'"
              @click="billingInterval = 'yearly'"
            >
              Yearly
              <span
                v-if="yearlySavingsLabel"
                class="rounded-full bg-success-light px-1.5 py-0.5 text-[10px] font-bold text-success"
              >
                -{{ yearlySavingsLabel }}%
              </span>
            </button>
          </div>

          <!-- Promo Code -->
          <div class="w-full sm:w-64">
            <div class="relative">
              <Icon
                name="lucide:tag"
                class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
              />
              <input
                v-model="promoCode"
                type="text"
                placeholder="Promo code"
                class="w-full rounded-xl border bg-bg-elevated py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                :class="promoCodeError ? 'border-error' : 'border-border-subtle'"
                :disabled="!canManage || isProcessing"
              >
            </div>
            <p
              v-if="promoCodeError"
              class="mt-1.5 text-xs text-error"
            >
              {{ promoCodeError }}
            </p>
          </div>
        </div>
      </div>

      <!-- Plans Grid -->
      <div
        v-if="sortedPlans.length === 0 && !isLoadingPlans"
        class="rounded-2xl border border-border-subtle bg-bg-elevated p-12"
      >
        <BaseEmptyState
          icon="lucide:layers"
          title="Plans unavailable"
          description="We could not load plans. Please try again later."
        />
      </div>

      <div
        v-else
        class="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        <DomainBillingPlanCard
          v-for="plan in sortedPlans"
          :key="plan.id"
          :plan="plan"
          :is-current="currentPlan?.id === plan.id"
          :highlight="plan.tier === highlightedTier"
          :can-manage="canManage"
          :billing-interval="billingInterval"
          :action-label="planActionLabel(plan)"
          :action-disabled="planActionDisabled(plan)"
          :action-loading="pendingPlanId === plan.id && isProcessing"
          @action="handlePlanAction"
        />
      </div>
    </section>

    <!-- Cancel Subscription Modal -->
    <BaseModal
      v-model="showCancelModal"
      title="Cancel subscription"
      size="sm"
    >
      <div class="space-y-4">
        <!-- Illustration -->
        <div class="flex justify-center">
          <div class="flex size-16 items-center justify-center rounded-full bg-error-light">
            <Icon
              name="lucide:heart-crack"
              class="size-8 text-error"
            />
          </div>
        </div>

        <div class="text-center">
          <h3 class="text-lg font-semibold text-text-primary">
            We're sad to see you go
          </h3>
          <p class="mt-2 text-sm text-text-muted">
            Your subscription will remain active until the end of your billing period.
          </p>
        </div>

        <div class="space-y-3">
          <div class="flex items-start gap-3 rounded-xl bg-bg-surface p-4">
            <Icon
              name="lucide:check-circle"
              class="mt-0.5 size-4 text-success"
            />
            <p class="text-sm text-text-secondary">
              Keep access until period ends
            </p>
          </div>
          <div class="flex items-start gap-3 rounded-xl bg-bg-surface p-4">
            <Icon
              name="lucide:arrow-down-circle"
              class="mt-0.5 size-4 text-warning"
            />
            <p class="text-sm text-text-secondary">
              Downgrade to Foundation plan after
            </p>
          </div>
          <div class="flex items-start gap-3 rounded-xl border border-error/20 bg-error-light p-4">
            <Icon
              name="lucide:alert-triangle"
              class="mt-0.5 size-4 text-error"
            />
            <p class="text-sm text-error">
              Active repos and reviews will be limited
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton
            variant="secondary"
            @click="showCancelModal = false"
          >
            Keep subscription
          </BaseButton>
          <BaseButton
            variant="danger"
            :loading="isCanceling"
            @click="handleCancelSubscription"
          >
            <Icon
              name="lucide:x"
              class="size-4"
            />
            Confirm cancellation
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Promotion Checkout Modal -->
    <BaseModal
      v-model="showPromotionModal"
      title="Promo code applied"
      size="sm"
    >
      <div class="space-y-4">
        <!-- Success Illustration -->
        <div class="flex justify-center">
          <div class="relative">
            <div class="flex size-16 items-center justify-center rounded-full bg-success-light">
              <Icon
                name="lucide:ticket"
                class="size-8 text-success"
              />
            </div>
            <div class="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-success text-white">
              <Icon
                name="lucide:check"
                class="size-3.5"
              />
            </div>
          </div>
        </div>

        <div class="text-center">
          <h3 class="text-lg font-semibold text-text-primary">
            Great news!
          </h3>
          <p class="mt-1 text-sm text-text-muted">
            Your promo code has been applied successfully.
          </p>
        </div>

        <div class="rounded-xl border border-success/20 bg-success-light/50 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-text-muted">
                Promo code
              </p>
              <p class="font-mono text-sm font-bold text-text-primary">
                {{ promotionNotice?.code }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-text-muted">
                Discount
              </p>
              <p class="text-lg font-bold text-success">
                {{ promotionNotice?.discount }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton
            variant="ghost"
            @click="handlePromotionDismiss"
          >
            Not now
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="handlePromotionCheckout"
          >
            <Icon
              name="lucide:external-link"
              class="size-4"
            />
            Continue to checkout
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

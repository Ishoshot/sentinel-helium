<script setup lang="ts">
import { MemberRole } from "~/types";
import type { BillingInterval, Plan, PlanTier, Promotion } from "~/types";
import { useUserStore } from "~/stores/useUserStore";
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";
import { useAppToast } from "~/composables/shared/useAppToast";
import { useMembers } from "~/composables/members/useMembers";
import { useBilling } from "~/composables/billing/useBilling";

/**
 * Billing page - Premium subscription management
 * Sophisticated depth design with rich layering and elegant interactions
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

const route = useRoute();
const router = useRouter();

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
const showPaymentProcessingAlert = ref(false);
const isInitializing = ref(true);
const isPageReady = ref(false);

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

const tierConfig: Record<PlanTier, { icon: string; gradient: string; glowColor: string }> = {
  foundation: {
    icon: "lucide:layers",
    gradient: "from-slate-500 to-slate-600",
    glowColor: "rgba(100, 116, 139, 0.3)",
  },
  illuminate: {
    icon: "lucide:sparkles",
    gradient: "from-blue-500 to-indigo-600",
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  orchestrate: {
    icon: "lucide:zap",
    gradient: "from-violet-500 to-purple-600",
    glowColor: "rgba(139, 92, 246, 0.4)",
  },
  sanctum: {
    icon: "lucide:shield-check",
    gradient: "from-amber-500 to-orange-600",
    glowColor: "rgba(245, 158, 11, 0.4)",
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
type ViewPlan = Readonly<(typeof plans.value)[number]>;

const usageProgress = computed(() => {
  if (!usage.value || !currentPlan.value) return null;
  if (currentPlan.value.monthly_runs_limit === null) return null;
  const limit = currentPlan.value.monthly_runs_limit;
  if (!limit) return null;
  return Math.min((usage.value.runs_count / limit) * 100, 100);
});

const usageLimitLabel = computed(() => {
  if (!currentPlan.value) return "—";
  if (currentPlan.value.monthly_runs_limit === null) return "∞";
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
      bgClass: "bg-emerald-400/20",
      textClass: "text-emerald-400",
      dotClass: "bg-emerald-400",
    },
    trialing: {
      label: "Trial",
      bgClass: "bg-amber-400/20",
      textClass: "text-amber-400",
      dotClass: "bg-amber-400",
    },
    past_due: {
      label: "Past due",
      bgClass: "bg-amber-400/20",
      textClass: "text-amber-400",
      dotClass: "bg-amber-400",
    },
    canceled: {
      label: "Canceled",
      bgClass: "bg-red-400/20",
      textClass: "text-red-400",
      dotClass: "bg-red-400",
    },
  };
  return configs[currentStatus.value as keyof typeof configs] ?? configs.active;
});

const trialEndsLabel = computed(() => {
  if (!subscription.value?.trial_ends_at) return null;
  return formatDate(subscription.value.trial_ends_at);
});

const planActionLabel = (plan: ViewPlan) => {
  if (currentPlan.value?.id === plan.id) return "Current";
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

const planActionDisabled = (plan: ViewPlan) => {
  if (currentPlan.value?.id === plan.id) return true;
  if (!canManage.value) return true;
  if (plan.tier === "foundation") {
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

function hasPricingForInterval(plan: ViewPlan, interval: BillingInterval) {
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

function getPlanPrice(plan: ViewPlan) {
  if (!plan.currency) return "Custom";
  if (billingInterval.value === "yearly") {
    return plan.price_yearly ? `$${plan.price_yearly}` : "Custom";
  }
  return plan.price_monthly ? `$${plan.price_monthly}` : "Custom";
}

function getPlanPeriod(plan: ViewPlan) {
  if (!plan.currency) return "";
  return billingInterval.value === "yearly" ? "/yr" : "/mo";
}

const featureLabels: Record<string, string> = {
  byok_enabled: "BYOK",
  custom_guidelines: "Custom guidelines",
  priority_queue: "Priority queue",
  api_access: "API access",
  sso_enabled: "SSO",
  audit_logs: "Audit logs",
};

// Sort features: enabled first, then disabled
function getSortedFeatures(features: Record<string, boolean>) {
  const entries = Object.entries(features);
  return entries.sort(([, a], [, b]) => {
    if (a === b) return 0;
    return a ? -1 : 1;
  });
}

async function handlePlanAction(plan: ViewPlan) {
  if (planActionDisabled(plan)) return;
  promoCodeError.value = null;
  pendingPlanId.value = plan.id;

  const originalTier = currentPlan.value?.tier;
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
  if (result.directChange) {
    showCancelModal.value = false;
    await fetchSubscription();
    toast.success("Subscription cancelled");
  }
}

onMounted(async () => {
  const checkoutId = route.query.checkout_id as string | undefined;
  if (checkoutId) {
    toast.success("Payment received! Your subscription is being processed.");
    showPaymentProcessingAlert.value = true;
    router.replace({ query: {} });
  }

  try {
    await Promise.all([fetchMembers(), fetchPlans(), fetchSubscription(), fetchUsage()]);
  } finally {
    isInitializing.value = false;
    setTimeout(() => {
      isPageReady.value = true;
    }, 50);
  }
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
  <div class="billing-page min-h-screen">
    <!-- Loading State -->
    <div
      v-if="isInitializing"
      class="space-y-8"
    >
      <BaseSkeleton class="h-64 w-full rounded-3xl" />
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <BaseSkeleton
          v-for="i in 4"
          :key="i"
          class="h-96 rounded-2xl"
        />
      </div>
    </div>

    <!-- Content -->
    <div
      v-else
      class="space-y-12"
    >
      <!-- Payment Processing Alert -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div
          v-if="showPaymentProcessingAlert"
          class="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-5"
        >
          <div class="flex items-center gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
              <Icon
                name="lucide:check-circle"
                class="size-6 text-emerald-500"
              />
            </div>
            <div class="flex-1">
              <p class="font-semibold text-text-primary">
                Payment successful
              </p>
              <p class="text-sm text-text-muted">
                Your subscription is being activated. This usually takes a moment.
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
              @click="showPaymentProcessingAlert = false"
            >
              <Icon
                name="lucide:x"
                class="size-4"
              />
            </button>
          </div>
          <div class="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </Transition>

      <!-- Hero: Current Plan Card -->
      <section
        class="transition-all duration-700 ease-out"
        :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <div
          v-if="!currentPlan"
          class="rounded-3xl border border-border-subtle bg-bg-elevated p-12 text-center"
        >
          <div class="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-bg-surface">
            <Icon
              name="lucide:credit-card"
              class="size-10 text-text-muted"
            />
          </div>
          <h2 class="text-2xl font-bold text-text-primary">
            No active subscription
          </h2>
          <p class="mt-2 text-text-muted">
            Choose a plan below to unlock powerful code review features.
          </p>
        </div>

        <div
          v-else
          class="hero-card relative overflow-hidden rounded-3xl"
        >
          <!-- Dark gradient background -->
          <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

          <!-- Subtle pattern overlay -->
          <div
            class="hero-pattern-overlay absolute inset-0 opacity-[0.03]"
          />

          <!-- Glow effects -->
          <div
            class="absolute -right-32 -top-32 size-96 rounded-full blur-3xl"
            :style="{ background: `radial-gradient(circle, ${currentTierConfig.glowColor} 0%, transparent 70%)` }"
          />
          <div class="absolute -bottom-24 -left-24 size-64 rounded-full bg-blue-500/10 blur-3xl" />

          <!-- Content -->
          <div class="relative z-10 p-8 lg:p-10">
            <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <!-- Left: Plan info -->
              <div class="flex-1">
                <!-- Status badge -->
                <div class="mb-6 flex flex-wrap items-center gap-3">
                  <div
                    class="flex items-center gap-2 rounded-full px-3 py-1.5"
                    :class="statusConfig.bgClass"
                  >
                    <span
                      class="size-2 rounded-full animate-pulse"
                      :class="statusConfig.dotClass"
                    />
                    <span
                      class="text-xs font-semibold uppercase tracking-wider"
                      :class="statusConfig.textClass"
                    >
                      {{ statusConfig.label }}
                    </span>
                  </div>
                  <div
                    v-if="trialEndsLabel"
                    class="flex items-center gap-2 rounded-full bg-amber-400/20 px-3 py-1.5"
                  >
                    <Icon
                      name="lucide:clock"
                      class="size-3.5 text-amber-400"
                    />
                    <span class="text-xs font-medium text-amber-400">
                      Trial ends {{ trialEndsLabel }}
                    </span>
                  </div>
                </div>

                <!-- Plan name & icon -->
                <div class="mb-6 flex items-center gap-5">
                  <div
                    class="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg"
                    :class="currentTierConfig.gradient"
                  >
                    <Icon
                      :name="currentTierConfig.icon"
                      class="size-8 text-white"
                    />
                  </div>
                  <div>
                    <h1 class="text-4xl font-bold tracking-tight text-white lg:text-5xl">
                      {{ formatTierLabel(currentPlan.tier) }}
                    </h1>
                    <div class="mt-1 flex items-baseline gap-2">
                      <span class="text-2xl font-semibold text-white/90">
                        {{ currentPlan.price_monthly ? `$${currentPlan.price_monthly}` : "Custom" }}
                      </span>
                      <span class="text-sm text-white/50">/month</span>
                    </div>
                  </div>
                </div>

                <!-- Limits row -->
                <div class="mb-8 flex flex-wrap gap-6">
                  <div class="min-w-[100px]">
                    <p class="text-xs font-medium uppercase tracking-wider text-white/40">
                      Reviews
                    </p>
                    <p class="mt-1 text-xl font-bold text-white">
                      {{ currentPlan.monthly_runs_limit === null ? "Unlimited" : currentPlan.monthly_runs_limit.toLocaleString() }}
                    </p>
                  </div>
                  <div class="min-w-[100px]">
                    <p class="text-xs font-medium uppercase tracking-wider text-white/40">
                      Team
                    </p>
                    <p class="mt-1 text-xl font-bold text-white">
                      {{ currentPlan.team_size_limit === null ? "Unlimited" : currentPlan.team_size_limit }}
                    </p>
                  </div>
                  <div class="min-w-[100px]">
                    <p class="text-xs font-medium uppercase tracking-wider text-white/40">
                      Commands
                    </p>
                    <p class="mt-1 text-xl font-bold text-white">
                      {{ currentPlan.monthly_commands_limit == null ? "Unlimited" : currentPlan.monthly_commands_limit.toLocaleString() }}
                    </p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-lg transition-all hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!canManage || currentPlan.tier === 'foundation' || isPortalLoading"
                    @click="handleOpenPortal"
                  >
                    <Icon
                      v-if="isPortalLoading"
                      name="lucide:loader-2"
                      class="size-4 animate-spin"
                    />
                    <Icon
                      v-else
                      name="lucide:settings"
                      class="size-4"
                    />
                    Manage billing
                  </button>
                  <button
                    v-if="currentPlan.tier !== 'foundation'"
                    type="button"
                    class="text-sm text-white/50 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
                    :disabled="!canManage"
                    @click="showCancelModal = true"
                  >
                    Cancel subscription
                  </button>
                </div>
              </div>

              <!-- Right: Usage widget -->
              <div
                v-if="usage"
                class="w-full lg:w-80"
              >
                <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div class="mb-4 flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-white/70">
                        This period
                      </p>
                      <p class="text-xs text-white/40">
                        {{ usagePeriodLabel }}
                      </p>
                    </div>
                    <span
                      v-if="daysRemaining !== null"
                      class="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/60"
                    >
                      {{ daysRemaining }}d left
                    </span>
                  </div>

                  <!-- Circular progress -->
                  <div class="mb-6 flex justify-center">
                    <div class="relative size-32">
                      <svg class="size-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="8"
                          class="text-white/10"
                        />
                        <circle
                          v-if="usageProgress !== null"
                          cx="64"
                          cy="64"
                          r="56"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="8"
                          stroke-linecap="round"
                          :stroke-dasharray="351.86"
                          :stroke-dashoffset="351.86 - (usageProgress / 100) * 351.86"
                          class="transition-all duration-1000 ease-out"
                          :class="isLimitReached ? 'text-red-400' : isApproachingLimit ? 'text-amber-400' : 'text-emerald-400'"
                        />
                      </svg>
                      <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-3xl font-bold text-white">
                          {{ usage.runs_count }}
                        </span>
                        <span class="text-xs text-white/50">
                          / {{ usageLimitLabel }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Mini stats -->
                  <div class="grid grid-cols-2 gap-3">
                    <div class="rounded-xl bg-white/5 p-3 text-center">
                      <p class="text-lg font-bold text-white">
                        {{ usage.findings_count }}
                      </p>
                      <p class="text-[10px] uppercase tracking-wider text-white/40">
                        Findings
                      </p>
                    </div>
                    <div class="rounded-xl bg-white/5 p-3 text-center">
                      <p class="text-lg font-bold text-white">
                        {{ usage.annotations_count }}
                      </p>
                      <p class="text-[10px] uppercase tracking-wider text-white/40">
                        Annotations
                      </p>
                    </div>
                  </div>

                  <!-- Warning -->
                  <div
                    v-if="isLimitReached"
                    class="mt-4 flex items-center gap-2 rounded-lg bg-red-500/20 p-3"
                  >
                    <Icon
                      name="lucide:alert-triangle"
                      class="size-4 text-red-400"
                    />
                    <span class="text-xs font-medium text-red-300">
                      Limit reached — upgrade to continue
                    </span>
                  </div>
                  <div
                    v-else-if="isApproachingLimit"
                    class="mt-4 flex items-center gap-2 rounded-lg bg-amber-500/20 p-3"
                  >
                    <Icon
                      name="lucide:alert-circle"
                      class="size-4 text-amber-400"
                    />
                    <span class="text-xs font-medium text-amber-300">
                      Approaching limit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Plans Section -->
      <section
        class="transition-all delay-100 duration-700 ease-out pt-10"
        :class="isPageReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <!-- Header -->
        <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 class="text-2xl font-bold text-text-primary">
              Available plans
            </h2>
            <p class="mt-1 text-text-muted">
              Scale your code review as your team grows.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <!-- Billing Toggle -->
            <div class="relative grid grid-cols-2 rounded-xl bg-bg-surface p-1">
              <button
                type="button"
                class="relative z-10 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
                :class="billingInterval === 'monthly' ? 'text-zinc-900' : 'text-text-muted'"
                @click="billingInterval = 'monthly'"
              >
                Monthly
              </button>
              <button
                type="button"
                class="relative z-10 flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
                :class="billingInterval === 'yearly' ? 'text-zinc-900' : 'text-text-muted'"
                @click="billingInterval = 'yearly'"
              >
                Yearly
                <span
                  v-if="yearlySavingsLabel"
                  class="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
                >
                  -{{ yearlySavingsLabel }}%
                </span>
              </button>
              <!-- Sliding indicator -->
              <div
                class="absolute inset-y-1 w-[calc(50%-2px)] rounded-lg bg-white shadow-sm transition-all duration-300 ease-out"
                :class="billingInterval === 'monthly' ? 'left-1' : 'left-[calc(50%+1px)]'"
              />
            </div>

            <!-- Promo Code -->
            <div class="relative">
              <input
                v-model="promoCode"
                type="text"
                placeholder="Promo code"
                class="w-54 rounded-xl border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none"
                :class="promoCodeError
                  ? 'border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.1)]'
                  : 'border-border-subtle hover:border-border-muted focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]'"
                :disabled="!canManage || isProcessing"
              >
              <p
                v-if="promoCodeError"
                class="absolute -bottom-5 left-0 text-xs text-red-500"
              >
                {{ promoCodeError }}
              </p>
            </div>
          </div>
        </div>

        <!-- Plans Grid -->
        <div
          v-if="isLoadingPlans"
          class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <BaseSkeleton
            v-for="i in 4"
            :key="i"
            class="h-[480px] rounded-2xl"
          />
        </div>

        <div
          v-else-if="sortedPlans.length === 0"
          class="rounded-2xl border border-border-subtle bg-bg-elevated p-12 text-center"
        >
          <Icon
            name="lucide:alert-circle"
            class="mx-auto mb-4 size-12 text-text-muted"
          />
          <p class="text-text-muted">
            Unable to load plans. Please try again.
          </p>
        </div>

        <div
          v-else
          class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div
            v-for="(plan, index) in sortedPlans"
            :key="plan.id"
            class="plan-card group relative flex flex-col rounded-2xl border bg-bg-elevated transition-all duration-300"
            :class="[
              plan.tier === highlightedTier
                ? 'border-accent shadow-xl shadow-accent/20 ring-1 ring-accent'
                : 'border-border-subtle hover:border-border-muted hover:shadow-lg',
              currentPlan?.id === plan.id && plan.tier !== highlightedTier ? 'ring-2 ring-accent/40' : ''
            ]"
            :style="{
              animationDelay: `${index * 75}ms`,
            }"
          >
            <div class="flex flex-1 flex-col p-6">
              <!-- Header -->
              <div class="mb-5">
                <div class="mb-3 flex items-center justify-between">
                  <div
                    class="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-md"
                    :class="tierConfig[plan.tier].gradient"
                  >
                    <Icon
                      :name="tierConfig[plan.tier].icon"
                      class="size-5 text-white"
                    />
                  </div>
                  <span
                    v-if="plan.tier === highlightedTier"
                    class="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent"
                  >
                    Popular
                  </span>
                  <span
                    v-else-if="currentPlan?.id === plan.id"
                    class="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400"
                  >
                    Current
                  </span>
                </div>
                <h3 class="text-lg font-bold text-text-primary">
                  {{ formatTierLabel(plan.tier) }}
                </h3>
                <p
                  v-if="plan.description"
                  class="mt-1 text-sm leading-relaxed text-text-muted"
                >
                  {{ plan.description }}
                </p>
              </div>

              <!-- Price -->
              <div class="mb-6">
                <div class="flex items-baseline">
                  <span class="text-4xl font-bold tracking-tight text-text-primary">
                    {{ getPlanPrice(plan) }}
                  </span>
                  <span class="ml-1 text-sm text-text-muted">
                    {{ getPlanPeriod(plan) }}
                  </span>
                </div>
                <p
                  v-if="plan.yearly_savings_percent > 0 && billingInterval === 'yearly'"
                  class="mt-1.5 text-xs font-semibold text-emerald-400"
                >
                  Save {{ plan.yearly_savings_percent }}% vs monthly
                </p>
              </div>

              <!-- Limits -->
              <div class="mb-6 space-y-2.5 border-t border-border-subtle pt-5">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-text-muted">Reviews</span>
                  <span class="text-sm font-semibold text-text-primary">
                    {{ plan.monthly_runs_limit === null ? "Unlimited" : plan.monthly_runs_limit.toLocaleString() }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-text-muted">Team</span>
                  <span class="text-sm font-semibold text-text-primary">
                    {{ plan.team_size_limit === null ? "Unlimited" : plan.team_size_limit }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-text-muted">Commands</span>
                  <span class="text-sm font-semibold text-text-primary">
                    {{ plan.monthly_commands_limit == null ? "Unlimited" : plan.monthly_commands_limit.toLocaleString() }}
                  </span>
                </div>
              </div>

              <!-- Features -->
              <div class="mb-6 flex-1 space-y-2">
                <div
                  v-for="[key, enabled] in getSortedFeatures(plan.features)"
                  :key="key"
                  class="flex items-center gap-2.5"
                >
                  <div
                    class="flex size-5 items-center justify-center rounded-full"
                    :class="enabled ? 'bg-emerald-500/10' : 'bg-bg-surface'"
                  >
                    <Icon
                      :name="enabled ? 'lucide:check' : 'lucide:minus'"
                      class="size-3"
                      :class="enabled ? 'text-emerald-400' : 'text-text-muted'"
                    />
                  </div>
                  <span
                    class="text-sm"
                    :class="enabled ? 'text-text-secondary' : 'text-text-muted/60 line-through'"
                  >
                    {{ featureLabels[key] }}
                  </span>
                </div>
              </div>

              <!-- CTA -->
              <button
                type="button"
                class="w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200"
                :class="[
                  currentPlan?.id === plan.id
                    ? 'cursor-default bg-emerald-500/10 text-emerald-400'
                    : plan.tier === highlightedTier
                      ? 'bg-gradient-to-r from-accent to-teal-600 text-white shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 active:scale-[0.98]'
                      : 'bg-text-primary text-bg-app hover:bg-text-secondary active:scale-[0.98]',
                  (!canManage || planActionDisabled(plan)) && currentPlan?.id !== plan.id ? 'cursor-not-allowed opacity-50' : ''
                ]"
                :disabled="!canManage || planActionDisabled(plan) || pendingPlanId === plan.id"
                @click="handlePlanAction(plan)"
              >
                <span
                  v-if="pendingPlanId === plan.id && isProcessing"
                  class="flex items-center justify-center gap-2"
                >
                  <Icon
                    name="lucide:loader-2"
                    class="size-4 animate-spin"
                  />
                  Processing
                </span>
                <span
                  v-else-if="currentPlan?.id === plan.id"
                  class="flex items-center justify-center gap-2"
                >
                  <Icon
                    name="lucide:check"
                    class="size-4"
                  />
                  Current plan
                </span>
                <span v-else>
                  {{ planActionLabel(plan) }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Help text -->
        <p
          v-if="!canManage"
          class="mt-4 text-center text-sm text-text-muted"
        >
          Only workspace owners can manage billing.
        </p>
      </section>
    </div>

    <!-- Cancel Subscription Modal -->
    <BaseModal
      v-model="showCancelModal"
      title="Cancel subscription"
      size="sm"
    >
      <div class="space-y-6">
        <div class="flex justify-center">
          <div class="relative">
            <div class="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-50">
              <Icon
                name="lucide:heart-crack"
                class="size-10 text-red-500"
              />
            </div>
          </div>
        </div>

        <div class="text-center">
          <h3 class="text-xl font-bold text-text-primary">
            We'll miss you
          </h3>
          <p class="mt-2 text-sm text-text-muted">
            Your subscription will remain active until the end of the current billing period.
          </p>
        </div>

        <div class="space-y-2 rounded-xl bg-bg-surface p-4">
          <div class="flex items-center gap-3">
            <div class="flex size-6 items-center justify-center rounded-full bg-emerald-100">
              <Icon
                name="lucide:check"
                class="size-3.5 text-emerald-600"
              />
            </div>
            <span class="text-sm text-text-secondary">Keep access until period ends</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex size-6 items-center justify-center rounded-full bg-amber-100">
              <Icon
                name="lucide:arrow-down"
                class="size-3.5 text-amber-600"
              />
            </div>
            <span class="text-sm text-text-secondary">Switch to Foundation (free) after</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex size-6 items-center justify-center rounded-full bg-red-100">
              <Icon
                name="lucide:alert-triangle"
                class="size-3.5 text-red-600"
              />
            </div>
            <span class="text-sm text-text-secondary">Limits will apply to reviews &amp; team</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="secondary"
            class="flex-1"
            @click="showCancelModal = false"
          >
            Keep subscription
          </BaseButton>
          <BaseButton
            variant="danger"
            class="flex-1"
            :loading="isCanceling"
            @click="handleCancelSubscription"
          >
            Cancel
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- Promotion Checkout Modal -->
    <BaseModal
      v-model="showPromotionModal"
      title="Discount applied"
      size="sm"
    >
      <div class="space-y-6">
        <div class="flex justify-center">
          <div class="relative">
            <div class="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50">
              <Icon
                name="lucide:ticket"
                class="size-10 text-emerald-500"
              />
            </div>
            <div class="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
              <Icon
                name="lucide:check"
                class="size-4 text-white"
              />
            </div>
          </div>
        </div>

        <div class="text-center">
          <h3 class="text-xl font-bold text-text-primary">
            Promo code applied!
          </h3>
          <p class="mt-2 text-sm text-text-muted">
            Your discount will be applied at checkout.
          </p>
        </div>

        <div class="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-emerald-600/70">
                Code
              </p>
              <p class="mt-0.5 font-mono text-lg font-bold text-text-primary">
                {{ promotionNotice?.code }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs font-medium uppercase tracking-wider text-emerald-600/70">
                Discount
              </p>
              <p class="mt-0.5 text-2xl font-bold text-emerald-600">
                {{ promotionNotice?.discount }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <BaseButton
            variant="ghost"
            class="flex-1"
            @click="handlePromotionDismiss"
          >
            Not now
          </BaseButton>
          <BaseButton
            variant="primary"
            class="flex-1"
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

<style scoped>
.hero-pattern-overlay {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.plan-card {
  animation: card-enter 0.5s ease-out both;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

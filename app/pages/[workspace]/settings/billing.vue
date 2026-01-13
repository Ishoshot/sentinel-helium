<script setup lang="ts">
import { MemberRole } from "~/types";
import type { BillingInterval, PaidPlanTier, Plan, PlanTier, Promotion } from "~/types";
import { useUserStore } from "~/stores/useUserStore";
import { useWorkspaceStore } from "~/stores/useWorkspaceStore";
import { useMembers } from "~/composables/useMembers";
import { useBilling } from "~/composables/useBilling";

/**
 * Billing page - plan management and usage visibility
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
  upgradePlan,
  cancelSubscription,
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
  return `${formatDate(usage.value.period_start)}–${formatDate(
    usage.value.period_end
  )}`;
});

const statusLabel = computed(() => {
  switch (currentStatus.value) {
    case "active":
      return "Active";
    case "trialing":
      return "Trial";
    case "past_due":
      return "Past due";
    case "canceled":
      return "Canceled";
    default:
      return "Unknown";
  }
});

const statusVariant = computed(() => {
  switch (currentStatus.value) {
    case "active":
      return "success";
    case "trialing":
      return "warning";
    case "past_due":
      return "warning";
    case "canceled":
      return "error";
    default:
      return "default";
  }
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
  if (!hasPricingForInterval(plan, billingInterval.value)) return true;
  if (!canManage.value) return true;
  if (plan.tier === "foundation") return true;
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

function isPaidPlanTier(tier: PlanTier): tier is PaidPlanTier {
  return tier !== "foundation";
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
  if (savings <= 0) return "Yearly";
  return `Yearly - Save ${savings}%`;
});

async function handlePlanAction(plan: Plan) {
  if (planActionDisabled(plan)) return;
  promoCodeError.value = null;
  pendingPlanId.value = plan.id;
  if (!isPaidPlanTier(plan.tier)) {
    pendingPlanId.value = null;
    return;
  }
  const result = await upgradePlan(
    plan.tier,
    billingInterval.value,
    promoCode.value
  );
  pendingPlanId.value = null;
  if (result.promoCodeError) {
    promoCodeError.value = result.promoCodeError;
    return;
  }
  if (result.checkoutUrl) {
    if (result.promotion) {
      promotionNotice.value = result.promotion;
      pendingCheckoutUrl.value = result.checkoutUrl;
      showPromotionModal.value = true;
      return;
    }
    window.location.href = result.checkoutUrl;
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
  const success = await cancelSubscription();
  isCanceling.value = false;
  if (success) {
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
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-text-primary">
        Billing
      </h1>
      <p class="mt-1 text-text-secondary">
        Review your plan, subscription status, and usage.
      </p>
    </div>

    <div
      v-if="isLoading && !subscription"
      class="grid lg:grid-cols-2 gap-6 mb-10"
    >
      <BaseSkeleton class="h-64 w-full rounded-2xl" />
      <BaseSkeleton class="h-64 w-full rounded-2xl" />
    </div>

    <div
      v-else
      class="grid lg:grid-cols-2 gap-6 mb-10"
    >
      <BaseCard>
        <div v-if="!currentPlan">
          <BaseEmptyState
            icon="lucide:credit-card"
            title="No plan assigned"
            description="This workspace does not have a plan yet."
            compact
          />
        </div>

        <div v-else>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-lg font-semibold text-text-primary">
                  {{ formatTierLabel(currentPlan.tier) }} Plan
                </h2>
                <BaseBadge
                  :variant="statusVariant"
                  size="sm"
                >
                  {{ statusLabel }}
                </BaseBadge>
              </div>
              <p class="mt-1 text-sm text-text-muted">
                Plan limits and features for this workspace.
              </p>
            </div>

            <div class="text-right">
              <p class="text-2xl font-semibold text-text-primary">
                {{
                  currentPlan.price_monthly
                    ? `$${currentPlan.price_monthly}`
                    : "Custom"
                }}
              </p>
              <p class="text-xs text-text-muted">
                {{ currentPlan.currency ? "USD per month" : "Contact sales" }}
              </p>
            </div>
          </div>

          <div class="mt-6 grid sm:grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-bg-surface border border-border-subtle">
              <p class="text-xs text-text-muted">Reviews per month</p>
              <p class="mt-2 text-lg font-semibold text-text-primary">
                {{
                  currentPlan.monthly_runs_limit === null
                    ? "Unlimited"
                    : currentPlan.monthly_runs_limit.toLocaleString()
                }}
              </p>
            </div>
            <div class="p-4 rounded-xl bg-bg-surface border border-border-subtle">
              <p class="text-xs text-text-muted">Team members</p>
              <p class="mt-2 text-lg font-semibold text-text-primary">
                {{
                  currentPlan.team_size_limit === null
                    ? "Unlimited"
                    : currentPlan.team_size_limit.toLocaleString()
                }}
              </p>
            </div>
          </div>

          <div
            v-if="trialEndsLabel"
            class="mt-5 text-sm text-text-muted"
          >
            Trial ends on {{ trialEndsLabel }}.
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <BaseButton
              variant="secondary"
              :disabled="!canManage || currentPlan.tier === 'foundation'"
              :loading="isPortalLoading"
              @click="handleOpenPortal"
            >
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
      </BaseCard>

      <BaseCard>
        <div v-if="isLoadingUsage" class="space-y-4">
          <BaseSkeleton class="h-5 w-24" />
          <BaseSkeleton class="h-3 w-32" />
          <BaseSkeleton class="h-2 w-full" />
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <BaseSkeleton class="h-16 w-full rounded-lg" />
            <BaseSkeleton class="h-16 w-full rounded-lg" />
            <BaseSkeleton class="h-16 w-full rounded-lg" />
          </div>
        </div>

        <div v-else-if="usage">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-lg font-semibold text-text-primary">
                Usage
              </h2>
              <p class="mt-1 text-sm text-text-muted">
                Current billing period
              </p>
            </div>
            <p class="text-xs text-text-muted">
              {{ usagePeriodLabel }}
            </p>
          </div>

          <div class="mt-6">
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-muted">Reviews used</span>
              <span class="text-text-primary font-medium">
                {{ usage.runs_count.toLocaleString() }} / {{ usageLimitLabel }}
              </span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-bg-surface overflow-hidden">
              <div
                v-if="usageProgress !== null"
                class="h-full rounded-full transition-all duration-300"
                :class="isLimitReached ? 'bg-error' : 'bg-accent'"
                :style="{ width: `${usageProgress}%` }"
              />
              <div
                v-else
                class="h-full rounded-full bg-accent/20"
                style="width: 100%"
              />
            </div>
            <p class="mt-2 text-xs text-text-muted">
              Usage resets at the end of the billing period.
            </p>
          </div>

          <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3 rounded-lg bg-bg-surface border border-border-subtle">
              <p class="text-xs text-text-muted">Reviews</p>
              <p class="mt-1 text-sm font-semibold text-text-primary">
                {{ usage.runs_count.toLocaleString() }}
              </p>
            </div>
            <div class="p-3 rounded-lg bg-bg-surface border border-border-subtle">
              <p class="text-xs text-text-muted">Findings</p>
              <p class="mt-1 text-sm font-semibold text-text-primary">
                {{ usage.findings_count.toLocaleString() }}
              </p>
            </div>
            <div class="p-3 rounded-lg bg-bg-surface border border-border-subtle">
              <p class="text-xs text-text-muted">Annotations</p>
              <p class="mt-1 text-sm font-semibold text-text-primary">
                {{ usage.annotations_count.toLocaleString() }}
              </p>
            </div>
          </div>

          <div
            v-if="isLimitReached"
            class="mt-5 p-4 rounded-xl bg-error-light border border-error/20"
          >
            <div class="flex items-start gap-3">
              <Icon
                name="lucide:alert-triangle"
                class="w-4 h-4 text-error mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-error">
                  Review limit reached
                </p>
                <p class="text-xs text-error/80 mt-1">
                  Upgrade your plan to continue running reviews this month.
                </p>
              </div>
            </div>
          </div>

          <div
            v-else-if="isApproachingLimit"
            class="mt-5 p-4 rounded-xl bg-warning-light border border-warning/20"
          >
            <div class="flex items-start gap-3">
              <Icon
                name="lucide:alert-circle"
                class="w-4 h-4 text-warning mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-warning">
                  Approaching your monthly review limit
                </p>
                <p class="text-xs text-warning/80 mt-1">
                  Consider upgrading to avoid interruptions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <BaseEmptyState
          v-else
          icon="lucide:bar-chart-3"
          title="Usage unavailable"
          description="Usage data will appear once reviews are recorded."
          compact
        />
      </BaseCard>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
      <div>
        <h2 class="text-lg font-semibold text-text-primary">
          Plans
        </h2>
        <p class="mt-1 text-sm text-text-muted">
          Compare plans and choose the best fit.
        </p>
      </div>

      <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
        <div class="inline-flex rounded-lg border border-border-subtle bg-bg-surface p-1">
          <button
            type="button"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-default"
            :class="billingInterval === 'monthly'
              ? 'bg-bg-elevated text-text-primary shadow-subtle'
              : 'text-text-muted hover:text-text-primary'"
            @click="billingInterval = 'monthly'"
          >
            Monthly
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-default"
            :class="billingInterval === 'yearly'
              ? 'bg-bg-elevated text-text-primary shadow-subtle'
              : 'text-text-muted hover:text-text-primary'"
            @click="billingInterval = 'yearly'"
          >
            {{ yearlySavingsLabel }}
          </button>
        </div>

        <div class="w-full sm:w-72">
          <BaseInput
            v-model="promoCode"
            label="Promo code"
            placeholder="Enter promo code"
            :disabled="!canManage || isProcessing"
            :error="promoCodeError ?? ''"
          />
          <p class="mt-2 text-xs text-text-muted">
            Optional. Applied when you upgrade.
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="sortedPlans.length === 0 && !isLoadingPlans"
      class="mb-10"
    >
      <BaseCard>
        <BaseEmptyState
          icon="lucide:layers"
          title="Plans unavailable"
          description="We could not load plans. Please try again later."
          compact
        />
      </BaseCard>
    </div>

    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <DomainPlanCard
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

    <BaseModal
      v-model="showCancelModal"
      title="Cancel subscription"
      size="sm"
    >
      <div class="space-y-4">
        <div class="p-3 rounded-lg bg-bg-surface border border-border-subtle">
          <p class="text-sm text-text-secondary">
            You will keep access to your current plan until the end of the
            billing period. After that, the workspace will move to the Foundation
            plan.
          </p>
        </div>
        <div class="p-3 rounded-lg bg-error-light border border-error/20">
          <div class="flex items-start gap-2">
            <Icon
              name="lucide:alert-triangle"
              class="w-4 h-4 text-error mt-0.5"
            />
            <p class="text-sm text-error">
              Active repositories and reviews will be limited after the downgrade.
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
            Confirm cancellation
          </BaseButton>
        </div>
      </template>
    </BaseModal>
    <BaseModal
      v-model="showPromotionModal"
      title="Promo code applied"
      size="sm"
    >
      <div class="space-y-3">
        <p class="text-sm text-text-secondary">
          Your promo code is applied. Continue to checkout to confirm the discount.
        </p>
        <div class="p-3 rounded-lg bg-bg-surface border border-border-subtle">
          <p class="text-sm font-semibold text-text-primary">
            {{ promotionNotice?.code }}
          </p>
          <p class="text-sm text-text-muted">
            {{ promotionNotice?.discount }}
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <BaseButton
            variant="secondary"
            @click="handlePromotionDismiss"
          >
            Not now
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="handlePromotionCheckout"
          >
            Continue to checkout
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

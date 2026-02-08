import type {
  BillingInterval,
  PlanTier,
  Plan,
  Promotion,
  Subscription,
  Usage,
} from "~/types";
import { isCheckoutResponse } from "~/types";
import { useBillingService } from "~/services/billing/billingService";
import { ApiError } from "~/services/core/api";

/**
 * Billing composable - orchestrates plans, subscription, and usage state
 */
export function useBilling(workspaceId: Ref<number | null>) {
  const billingService = useBillingService();

  const plans = ref<Plan[]>([]);
  const subscription = ref<Subscription | null>(null);
  const usage = ref<Usage | null>(null);
  const isLoadingPlans = ref(false);
  const isLoadingSubscription = ref(false);
  const isLoadingUsage = ref(false);
  const isProcessing = ref(false);
  const error = ref<string | null>(null);

  interface ChangePlanResult {
    checkoutUrl: string | null;
    billingInterval: BillingInterval | null;
    promotion: Promotion | null;
    promoCodeError: string | null;
    directChange: boolean;
    newPlan: Plan | null;
  }

  async function fetchPlans() {
    isLoadingPlans.value = true;
    error.value = null;

    try {
      const data = await billingService.listPlans();
      plans.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to fetch plans";
      return [];
    } finally {
      isLoadingPlans.value = false;
    }
  }

  async function fetchSubscription() {
    if (!workspaceId.value) return null;
    isLoadingSubscription.value = true;
    error.value = null;

    try {
      const data = await billingService.getSubscription(workspaceId.value);
      subscription.value = data;
      return data;
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        error.value = "You do not have access to this subscription";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to fetch subscription";
      }
      return null;
    } finally {
      isLoadingSubscription.value = false;
    }
  }

  async function fetchUsage() {
    if (!workspaceId.value) return null;
    isLoadingUsage.value = true;
    error.value = null;

    try {
      const data = await billingService.getUsage(workspaceId.value);
      usage.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to fetch usage";
      return null;
    } finally {
      isLoadingUsage.value = false;
    }
  }

  async function changePlan(
    planTier: PlanTier,
    billingInterval: BillingInterval,
    promoCode?: string | null,
  ): Promise<ChangePlanResult> {
    if (!workspaceId.value) {
      return {
        checkoutUrl: null,
        billingInterval: null,
        promotion: null,
        promoCodeError: null,
        directChange: false,
        newPlan: null,
      };
    }
    isProcessing.value = true;
    error.value = null;

    try {
      const trimmedPromoCode = promoCode?.trim() ?? "";
      const data = await billingService.changeSubscription(workspaceId.value, {
        plan_tier: planTier,
        billing_interval: billingInterval,
        promo_code: trimmedPromoCode.length > 0 ? trimmedPromoCode : null,
      });

      if (isCheckoutResponse(data)) {
        return {
          checkoutUrl: data.checkout_url,
          billingInterval: data.billing_interval,
          promotion: data.promotion ?? null,
          promoCodeError: null,
          directChange: false,
          newPlan: null,
        };
      }

      // Direct change (upgrade/downgrade/cancel applied locally)
      return {
        checkoutUrl: null,
        billingInterval: data.billing_interval ?? null,
        promotion: null,
        promoCodeError: null,
        directChange: true,
        newPlan: data.plan,
      };
    } catch (e) {
      let promoCodeError: string | null = null;
      if (e instanceof ApiError && e.errors) {
        if (e.errors.promo_code?.length) {
          promoCodeError = e.errors.promo_code[0] ?? null;
          const otherErrors = Object.entries(e.errors)
            .filter(([key]) => key !== "promo_code")
            .flatMap(([, value]) => value);
          if (otherErrors.length > 0) {
            error.value = otherErrors.join(", ");
          }
        } else {
          error.value =
            e.allErrors.length > 0 ? e.allErrors.join(", ") : e.message;
        }
      } else if (e instanceof ApiError && e.status === 403) {
        error.value = "Only workspace owners can manage subscriptions";
      } else {
        error.value =
          e instanceof Error ? e.message : "Failed to change subscription";
      }
      return {
        checkoutUrl: null,
        billingInterval: null,
        promotion: null,
        promoCodeError,
        directChange: false,
        newPlan: null,
      };
    } finally {
      isProcessing.value = false;
    }
  }

  async function openBillingPortal() {
    if (!workspaceId.value) return null;
    isProcessing.value = true;
    error.value = null;

    try {
      const data = await billingService.createBillingPortal(workspaceId.value);
      return data.portal_url;
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Billing portal is not available";
      return null;
    } finally {
      isProcessing.value = false;
    }
  }

  watch(workspaceId, (newId) => {
    if (!newId) {
      subscription.value = null;
      usage.value = null;
    }
  });

  return {
    plans: readonly(plans),
    subscription: readonly(subscription),
    usage: readonly(usage),
    isLoadingPlans: readonly(isLoadingPlans),
    isLoadingSubscription: readonly(isLoadingSubscription),
    isLoadingUsage: readonly(isLoadingUsage),
    isProcessing: readonly(isProcessing),
    error: readonly(error),
    fetchPlans,
    fetchSubscription,
    fetchUsage,
    changePlan,
    openBillingPortal,
  };
}

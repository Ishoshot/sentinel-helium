import { useBriefingsService } from '~/services/briefings/briefingsService'
import { useAppToast } from '~/composables/shared/useAppToast'
import { useBriefingsCatalog } from '~/composables/briefings/useBriefingsCatalog'
import { useBriefingsGenerations } from '~/composables/briefings/useBriefingsGenerations'
import { useBriefingsSubscriptions } from '~/composables/briefings/useBriefingsSubscriptions'

/**
 * Briefings facade composable.
 *
 * Keeps the existing public API stable while delegating responsibilities
 * to focused domain composables (catalog, generations, subscriptions).
 */
export function useBriefings(workspaceId: Ref<number | null>) {
  const briefingsService = useBriefingsService()
  const toast = useAppToast()
  const error = ref<string | null>(null)

  const catalog = useBriefingsCatalog({
    workspaceId,
    briefingsService,
    toast,
    error,
  })

  const generations = useBriefingsGenerations({
    workspaceId,
    briefings: catalog.briefings,
    briefingsService,
    toast,
    error,
  })

  const subscriptions = useBriefingsSubscriptions({
    workspaceId,
    briefingsService,
    toast,
    error,
  })

  const isWorkspaceEligible = computed(
    () => catalog.workspaceEligibility.value?.can_generate !== false
  )

  const workspaceRestrictionReason = computed(
    () => catalog.workspaceEligibility.value?.restriction_reason ?? null
  )

  const workspaceReasonCode = computed(
    () => catalog.workspaceEligibility.value?.reason_code ?? null
  )

  watch(workspaceId, (newId) => {
    if (!newId) {
      catalog.resetCatalogState()
      generations.resetGenerationState()
      subscriptions.resetSubscriptionsState()
      error.value = null
    }
  })

  return {
    // State
    briefings: readonly(catalog.briefings),
    currentBriefing: readonly(catalog.currentBriefing),
    generations: readonly(generations.generations),
    currentGeneration: readonly(generations.currentGeneration),
    subscriptions: readonly(subscriptions.subscriptions),
    workspaceEligibility: readonly(catalog.workspaceEligibility),
    pagination: readonly(generations.pagination),

    // Loading states
    isLoadingBriefings: readonly(catalog.isLoadingBriefings),
    isLoadingGenerations: readonly(generations.isLoadingGenerations),
    isLoadingSubscriptions: readonly(subscriptions.isLoadingSubscriptions),
    isLoadingWorkspaceEligibility: readonly(catalog.isLoadingWorkspaceEligibility),
    isGenerating: readonly(generations.isGenerating),
    isProcessing: readonly(subscriptions.isProcessing),
    isSubmittingFeedback: readonly(subscriptions.isSubmittingFeedback),
    error: readonly(error),

    // Briefings
    fetchBriefings: catalog.fetchBriefings,
    fetchWorkspaceEligibility: catalog.fetchWorkspaceEligibility,
    fetchBriefing: catalog.fetchBriefing,

    // Generations
    generateBriefing: generations.generateBriefing,
    fetchGenerations: generations.fetchGenerations,
    fetchRecentGenerations: generations.fetchRecentGenerations,
    fetchGeneration: generations.fetchGeneration,
    getDownloadUrl: generations.getDownloadUrl,
    downloadBriefing: generations.downloadBriefing,
    updateGenerationState: generations.updateGenerationState,

    // Subscriptions
    fetchSubscriptions: subscriptions.fetchSubscriptions,
    createSubscription: subscriptions.createSubscription,
    updateSubscription: subscriptions.updateSubscription,
    cancelSubscription: subscriptions.cancelSubscription,
    getSubscriptionForBriefing: subscriptions.getSubscriptionForBriefing,
    hasActiveSubscription: subscriptions.hasActiveSubscription,

    // Shares
    createShare: subscriptions.createShare,
    revokeShare: subscriptions.revokeShare,

    // Feedback
    submitFeedback: subscriptions.submitFeedback,

    // Eligibility
    isWorkspaceEligible,
    workspaceRestrictionReason,
    workspaceReasonCode,
  }
}

import type {
  BriefingShare,
  BriefingSubscription,
  CreateShareRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from '~/types'
import { ApiError } from '~/services/core/api'

interface BriefingsSubscriptionsService {
  listSubscriptions(workspaceId: number): Promise<BriefingSubscription[]>
  createSubscription(
    workspaceId: number,
    data: CreateSubscriptionRequest
  ): Promise<BriefingSubscription>
  updateSubscription(
    workspaceId: number,
    subscriptionId: number,
    data: UpdateSubscriptionRequest
  ): Promise<BriefingSubscription>
  cancelSubscription(workspaceId: number, subscriptionId: number): Promise<void>
  createShare(
    workspaceId: number,
    generationId: number,
    data?: CreateShareRequest
  ): Promise<BriefingShare>
  revokeShare(workspaceId: number, shareId: number): Promise<void>
  submitFeedback(
    workspaceId: number,
    generationId: number,
    payload: { rating: number; comment?: string; tags?: string[] }
  ): Promise<void>
}

interface ToastApi {
  error(message: string): void
  success(message: string): void
}

interface UseBriefingsSubscriptionsOptions {
  workspaceId: Ref<number | null>
  briefingsService: BriefingsSubscriptionsService
  toast: ToastApi
  error: Ref<string | null>
}

export function useBriefingsSubscriptions({
  workspaceId,
  briefingsService,
  toast,
  error,
}: UseBriefingsSubscriptionsOptions) {
  const subscriptions = ref<BriefingSubscription[]>([])
  const isLoadingSubscriptions = ref(false)
  const isProcessing = ref(false)
  const isSubmittingFeedback = ref(false)

  async function fetchSubscriptions(): Promise<BriefingSubscription[]> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return []
    }
    isLoadingSubscriptions.value = true
    error.value = null

    try {
      const data = await briefingsService.listSubscriptions(workspaceId.value)
      subscriptions.value = data
      return data
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch subscriptions'
      error.value = message
      toast.error(message)
      return []
    } finally {
      isLoadingSubscriptions.value = false
    }
  }

  async function createSubscription(
    data: CreateSubscriptionRequest
  ): Promise<BriefingSubscription | null> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return null
    }
    isProcessing.value = true
    error.value = null

    try {
      const subscription = await briefingsService.createSubscription(
        workspaceId.value,
        data
      )
      subscriptions.value = [...subscriptions.value, subscription]
      return subscription
    } catch (e) {
      let message: string
      if (e instanceof ApiError) {
        if (e.status === 403) {
          message = 'Scheduling is not available on your plan'
        } else if (e.isValidationError && e.firstError) {
          message = e.firstError
        } else {
          message = e.message
        }
      } else {
        message = e instanceof Error ? e.message : 'Failed to create subscription'
      }
      error.value = message
      toast.error(message)
      return null
    } finally {
      isProcessing.value = false
    }
  }

  async function updateSubscription(
    subscriptionId: number,
    data: UpdateSubscriptionRequest
  ): Promise<BriefingSubscription | null> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return null
    }
    isProcessing.value = true
    error.value = null

    try {
      const subscription = await briefingsService.updateSubscription(
        workspaceId.value,
        subscriptionId,
        data
      )
      const index = subscriptions.value.findIndex((item) => item.id === subscriptionId)
      if (index !== -1) {
        subscriptions.value[index] = subscription
      }
      return subscription
    } catch (e) {
      let message: string
      if (e instanceof ApiError && e.isValidationError && e.firstError) {
        message = e.firstError
      } else {
        message = e instanceof Error ? e.message : 'Failed to update subscription'
      }
      error.value = message
      toast.error(message)
      return null
    } finally {
      isProcessing.value = false
    }
  }

  async function cancelSubscription(subscriptionId: number): Promise<boolean> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return false
    }
    isProcessing.value = true
    error.value = null

    try {
      await briefingsService.cancelSubscription(workspaceId.value, subscriptionId)
      subscriptions.value = subscriptions.value.filter((item) => item.id !== subscriptionId)
      return true
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to cancel subscription'
      error.value = message
      toast.error(message)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  async function createShare(
    generationId: number,
    data?: CreateShareRequest
  ): Promise<BriefingShare | null> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return null
    }
    isProcessing.value = true
    error.value = null

    try {
      const share = await briefingsService.createShare(
        workspaceId.value,
        generationId,
        data
      )
      return share
    } catch (e) {
      let message: string
      if (e instanceof ApiError && e.status === 403) {
        message = 'External sharing is not available on your plan'
      } else {
        message = e instanceof Error ? e.message : 'Failed to create share link'
      }
      error.value = message
      toast.error(message)
      return null
    } finally {
      isProcessing.value = false
    }
  }

  async function revokeShare(shareId: number): Promise<boolean> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return false
    }
    isProcessing.value = true
    error.value = null

    try {
      await briefingsService.revokeShare(workspaceId.value, shareId)
      return true
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to revoke share'
      error.value = message
      toast.error(message)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  async function submitFeedback(
    generationId: number,
    payload: { rating: number; comment?: string; tags?: string[] }
  ): Promise<boolean> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return false
    }

    isSubmittingFeedback.value = true
    error.value = null

    try {
      await briefingsService.submitFeedback(workspaceId.value, generationId, payload)
      toast.success('Feedback received. Thank you!')
      return true
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to submit feedback'
      error.value = message
      toast.error(message)
      return false
    } finally {
      isSubmittingFeedback.value = false
    }
  }

  function getSubscriptionForBriefing(briefingId: number): BriefingSubscription | undefined {
    return subscriptions.value.find(
      (subscription) => subscription.briefing_id === briefingId && subscription.is_active
    )
  }

  function hasActiveSubscription(briefingId: number): boolean {
    return !!getSubscriptionForBriefing(briefingId)
  }

  function resetSubscriptionsState(): void {
    subscriptions.value = []
  }

  return {
    subscriptions,
    isLoadingSubscriptions,
    isProcessing,
    isSubmittingFeedback,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    getSubscriptionForBriefing,
    hasActiveSubscription,
    createShare,
    revokeShare,
    submitFeedback,
    resetSubscriptionsState,
  }
}

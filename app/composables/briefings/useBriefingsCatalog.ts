import type {
  Briefing,
  BriefingWorkspaceEligibility,
} from '~/types'
import { ApiError } from '~/services/core/api'

interface BriefingsCatalogService {
  listBriefings(workspaceId: number): Promise<Briefing[]>
  getWorkspaceEligibility(workspaceId: number): Promise<BriefingWorkspaceEligibility>
  getBriefing(workspaceId: number, slug: string): Promise<Briefing>
}

interface ToastApi {
  error(message: string): void
}

interface UseBriefingsCatalogOptions {
  workspaceId: Ref<number | null>
  briefingsService: BriefingsCatalogService
  toast: ToastApi
  error: Ref<string | null>
}

export function useBriefingsCatalog({
  workspaceId,
  briefingsService,
  toast,
  error,
}: UseBriefingsCatalogOptions) {
  const briefings = ref<Briefing[]>([])
  const currentBriefing = ref<Briefing | null>(null)
  const workspaceEligibility = ref<BriefingWorkspaceEligibility | null>(null)
  const isLoadingBriefings = ref(false)
  const isLoadingWorkspaceEligibility = ref(false)

  async function fetchBriefings(): Promise<Briefing[]> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return []
    }
    isLoadingBriefings.value = true
    error.value = null

    try {
      const data = await briefingsService.listBriefings(workspaceId.value)
      briefings.value = data
      return data
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch briefings'
      error.value = message
      toast.error(message)
      return []
    } finally {
      isLoadingBriefings.value = false
    }
  }

  async function fetchWorkspaceEligibility(): Promise<BriefingWorkspaceEligibility | null> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return null
    }

    isLoadingWorkspaceEligibility.value = true
    error.value = null

    try {
      const data = await briefingsService.getWorkspaceEligibility(workspaceId.value)
      workspaceEligibility.value = data
      return data
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to check briefing eligibility'
      error.value = message
      toast.error(message)
      return null
    } finally {
      isLoadingWorkspaceEligibility.value = false
    }
  }

  async function fetchBriefing(slug: string): Promise<Briefing | null> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return null
    }
    isLoadingBriefings.value = true
    error.value = null

    try {
      const data = await briefingsService.getBriefing(workspaceId.value, slug)
      currentBriefing.value = data
      return data
    } catch (e) {
      let message: string
      if (e instanceof ApiError && e.status === 404) {
        message = 'Briefing not found'
      } else {
        message = e instanceof Error ? e.message : 'Failed to fetch briefing'
      }
      error.value = message
      toast.error(message)
      currentBriefing.value = null
      return null
    } finally {
      isLoadingBriefings.value = false
    }
  }

  function resetCatalogState(): void {
    briefings.value = []
    currentBriefing.value = null
    workspaceEligibility.value = null
  }

  return {
    briefings,
    currentBriefing,
    workspaceEligibility,
    isLoadingBriefings,
    isLoadingWorkspaceEligibility,
    fetchBriefings,
    fetchWorkspaceEligibility,
    fetchBriefing,
    resetCatalogState,
  }
}

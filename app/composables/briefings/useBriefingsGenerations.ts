import type {
  Briefing,
  BriefingGeneration,
  GenerateBriefingRequest,
  BriefingOutputFormat,
} from '~/types'
import { ApiError } from '~/services/core/api'

interface PaginatedGenerationsResponse {
  data: BriefingGeneration[]
  meta?: {
    current_page: number
    last_page: number
    total: number
    per_page: number
    from: number | null
    to: number | null
  }
  current_page?: number
  last_page?: number
  total?: number
  per_page?: number
  from?: number | null
  to?: number | null
}

interface BriefingsGenerationsService {
  generateBriefing(
    workspaceId: number,
    slug: string,
    data?: GenerateBriefingRequest
  ): Promise<BriefingGeneration>
  listGenerations(
    workspaceId: number,
    params?: {
      page?: number
      perPage?: number
      search?: string
      status?: string[]
      briefingId?: number
      dateFrom?: string
      dateTo?: string
      sort?: string
      direction?: 'asc' | 'desc'
    }
  ): Promise<PaginatedGenerationsResponse>
  getGeneration(workspaceId: number, generationId: number): Promise<BriefingGeneration>
  getDownloadUrl(
    workspaceId: number,
    generationId: number,
    format: BriefingOutputFormat
  ): Promise<string>
}

interface ToastApi {
  error(message: string): void
}

interface UseBriefingsGenerationsOptions {
  workspaceId: Ref<number | null>
  briefings: Ref<Briefing[]>
  briefingsService: BriefingsGenerationsService
  toast: ToastApi
  error: Ref<string | null>
}

interface GenerationsPagination {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
  from: number
  to: number
}

export function useBriefingsGenerations({
  workspaceId,
  briefings,
  briefingsService,
  toast,
  error,
}: UseBriefingsGenerationsOptions) {
  const generations = ref<BriefingGeneration[]>([])
  const currentGeneration = ref<BriefingGeneration | null>(null)
  const isLoadingGenerations = ref(false)
  const isGenerating = ref(false)

  const pagination = ref<GenerationsPagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
    from: 0,
    to: 0,
  })

  async function generateBriefing(
    briefingIdOrSlug: number | string,
    data?: GenerateBriefingRequest
  ): Promise<BriefingGeneration | null> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return null
    }
    isGenerating.value = true
    error.value = null

    let slug: string
    if (typeof briefingIdOrSlug === 'number') {
      const briefing = briefings.value.find((item) => item.id === briefingIdOrSlug)
      if (!briefing) {
        error.value = 'Briefing not found'
        toast.error('Briefing not found')
        isGenerating.value = false
        return null
      }
      slug = briefing.slug
    } else {
      slug = briefingIdOrSlug
    }

    try {
      const generation = await briefingsService.generateBriefing(
        workspaceId.value,
        slug,
        data
      )
      generations.value = [generation, ...generations.value]
      currentGeneration.value = generation
      return generation
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to generate briefing'
      error.value = message
      toast.error(message)
      return null
    } finally {
      isGenerating.value = false
    }
  }

  async function fetchRecentGenerations(params?: {
    limit?: number
    briefingId?: number
  }): Promise<void> {
    await fetchGenerations({
      page: 1,
      perPage: params?.limit ?? 10,
      briefingId: params?.briefingId,
    })
  }

  async function downloadBriefing(
    generationId: number,
    format: BriefingOutputFormat
  ): Promise<string | null> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return null
    }
    try {
      return await briefingsService.getDownloadUrl(workspaceId.value, generationId, format)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to get download URL'
      error.value = message
      toast.error(message)
      return null
    }
  }

  async function fetchGenerations(params?: {
    page?: number
    perPage?: number
    search?: string
    status?: string[]
    briefingId?: number
    dateFrom?: string
    dateTo?: string
    sort?: string
    direction?: 'asc' | 'desc'
  }): Promise<void> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return
    }
    isLoadingGenerations.value = true
    error.value = null

    try {
      const response = await briefingsService.listGenerations(workspaceId.value, {
        page: params?.page ?? 1,
        perPage: params?.perPage ?? pagination.value.perPage,
        search: params?.search,
        status: params?.status,
        briefingId: params?.briefingId,
        dateFrom: params?.dateFrom,
        dateTo: params?.dateTo,
        sort: params?.sort,
        direction: params?.direction,
      })

      generations.value = response.data

      const meta = response.meta ?? response
      pagination.value = {
        currentPage: meta.current_page ?? 1,
        lastPage: meta.last_page ?? 1,
        total: meta.total ?? 0,
        perPage: meta.per_page ?? pagination.value.perPage,
        from: meta.from ?? 0,
        to: meta.to ?? 0,
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch generations'
      error.value = message
      toast.error(message)
      generations.value = []
    } finally {
      isLoadingGenerations.value = false
    }
  }

  async function fetchGeneration(generationId: number): Promise<BriefingGeneration | null> {
    if (!workspaceId.value) {
      toast.error('No workspace selected')
      return null
    }
    isLoadingGenerations.value = true
    error.value = null

    try {
      const data = await briefingsService.getGeneration(workspaceId.value, generationId)
      currentGeneration.value = data

      const index = generations.value.findIndex((generation) => generation.id === generationId)
      if (index !== -1) {
        generations.value[index] = data
      }

      return data
    } catch (e) {
      let message: string
      if (e instanceof ApiError && e.status === 404) {
        message = 'Briefing generation not found'
      } else {
        message = e instanceof Error ? e.message : 'Failed to fetch generation'
      }
      error.value = message
      toast.error(message)
      currentGeneration.value = null
      return null
    } finally {
      isLoadingGenerations.value = false
    }
  }

  async function getDownloadUrl(
    generationId: number,
    format: BriefingOutputFormat
  ): Promise<string> {
    if (!workspaceId.value) {
      return ''
    }
    return await briefingsService.getDownloadUrl(workspaceId.value, generationId, format)
  }

  function updateGenerationState(updated: Partial<BriefingGeneration> & { id: number }): void {
    const index = generations.value.findIndex((generation) => generation.id === updated.id)
    if (index !== -1) {
      generations.value[index] = {
        ...generations.value[index],
        ...updated,
      } as BriefingGeneration
    }

    if (currentGeneration.value?.id === updated.id) {
      currentGeneration.value = {
        ...currentGeneration.value,
        ...updated,
      } as BriefingGeneration
    }
  }

  function resetGenerationState(): void {
    generations.value = []
    currentGeneration.value = null
    pagination.value = {
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 20,
      from: 0,
      to: 0,
    }
  }

  return {
    generations,
    currentGeneration,
    pagination,
    isLoadingGenerations,
    isGenerating,
    generateBriefing,
    fetchGenerations,
    fetchRecentGenerations,
    fetchGeneration,
    getDownloadUrl,
    downloadBriefing,
    updateGenerationState,
    resetGenerationState,
  }
}

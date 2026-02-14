import type { Plan, PlanTier } from '~/types'
import { logError } from '~/utils/logger'

/**
 * Composable for fetching and working with plans
 *
 * This composable fetches plans from the API and provides utility
 * functions for working with plan data. It works for both authenticated
 * and unauthenticated users (landing page).
 */
export function usePlans() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  const plans = useState<Plan[]>('plans', () => [])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Fetch plans from the API
   * Uses direct fetch without auth for public access
   */
  async function fetchPlans(): Promise<Plan[]> {
    // Return cached plans if available
    if (plans.value.length > 0) {
      return plans.value
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ data: Plan[] }>(`${baseURL}/plans`, {
        headers: {
          Accept: 'application/json',
        },
      })

      plans.value = response.data
      return plans.value
    }
    catch (err) {
      const normalizedError = err instanceof Error ? err : new Error('Failed to fetch plans')
      error.value = normalizedError
      logError(`Failed to fetch plans: ${normalizedError.message}`)
      return []
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Get a plan by tier
   */
  function getPlanByTier(tier: PlanTier): Plan | undefined {
    return plans.value.find(p => p.tier === tier)
  }

  /**
   * Get the highlighted/popular plan
   */
  function getHighlightedPlan(): Plan | undefined {
    return plans.value.find(p => p.highlighted)
  }

  /**
   * Comparison features for plan comparison tables
   */
  const comparisonFeatures = computed(() => {
    if (plans.value.length === 0) return []

    return [
      {
        name: 'Reviews per month',
        foundation: getPlanByTier('foundation')?.runs_label ?? '20',
        illuminate: getPlanByTier('illuminate')?.runs_label ?? '500',
        orchestrate: getPlanByTier('orchestrate')?.runs_label ?? '2,000',
        sanctum: getPlanByTier('sanctum')?.runs_label ?? 'Unlimited',
      },
      {
        name: 'Commands per month',
        foundation: getPlanByTier('foundation')?.commands_label ?? '50',
        illuminate: getPlanByTier('illuminate')?.commands_label ?? '200',
        orchestrate: getPlanByTier('orchestrate')?.commands_label ?? '1,000',
        sanctum: getPlanByTier('sanctum')?.commands_label ?? 'Unlimited',
      },
      {
        name: 'Team members',
        foundation: getPlanByTier('foundation')?.team_size_label ?? '2',
        illuminate: getPlanByTier('illuminate')?.team_size_label ?? '5',
        orchestrate: getPlanByTier('orchestrate')?.team_size_label ?? 'Unlimited',
        sanctum: getPlanByTier('sanctum')?.team_size_label ?? 'Unlimited',
      },
      {
        name: 'GitHub integration',
        foundation: true,
        illuminate: true,
        orchestrate: true,
        sanctum: true,
      },
      {
        name: 'Provider keys (BYOK)',
        foundation: true,
        illuminate: true,
        orchestrate: true,
        sanctum: true,
      },
      {
        name: 'Custom guidelines',
        foundation: false,
        illuminate: true,
        orchestrate: true,
        sanctum: true,
      },
      {
        name: 'Priority queue',
        foundation: false,
        illuminate: true,
        orchestrate: true,
        sanctum: true,
      },
      {
        name: 'API access',
        foundation: false,
        illuminate: false,
        orchestrate: true,
        sanctum: true,
      },
      {
        name: 'SSO / SAML',
        foundation: false,
        illuminate: false,
        orchestrate: false,
        sanctum: true,
      },
      {
        name: 'Audit logs',
        foundation: false,
        illuminate: false,
        orchestrate: false,
        sanctum: true,
      },
      {
        name: 'Dedicated support',
        foundation: false,
        illuminate: false,
        orchestrate: false,
        sanctum: true,
      },
    ]
  })

  return {
    plans,
    isLoading,
    error,
    fetchPlans,
    getPlanByTier,
    getHighlightedPlan,
    comparisonFeatures,
  }
}

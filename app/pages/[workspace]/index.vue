<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { formatRelativeTime } from '~/utils/date'
import { useAuth } from '~/composables/auth/useAuth'
import { useMembers } from '~/composables/members/useMembers'
import { useActivity } from '~/composables/workspace/useActivity'
import { useGitHub } from '~/composables/integrations/useGitHub'
import { useRuns } from '~/composables/reviews/useRuns'
import { useInvitations } from '~/composables/members/useInvitations'
import { useAnalytics } from '~/composables/analytics/useAnalytics'
import DomainAnalyticsAnalyticsOverview from '~/components/domain/analytics/AnalyticsOverview.vue'
import DomainAnalyticsTimelineChart from '~/components/domain/analytics/TimelineChart.vue'
import DomainAnalyticsFindingsDistributionChart from '~/components/domain/analytics/FindingsDistributionChart.vue'
import DomainAnalyticsTopCategoriesChart from '~/components/domain/analytics/TopCategoriesChart.vue'
import DomainAnalyticsTokenUsageChart from '~/components/domain/analytics/TokenUsageChart.vue'
import DomainAnalyticsSuccessRateChart from '~/components/domain/analytics/SuccessRateChart.vue'
import DomainAnalyticsQualityScoreChart from '~/components/domain/analytics/QualityScoreChart.vue'
import DomainAnalyticsDeveloperLeaderboardTable from '~/components/domain/analytics/DeveloperLeaderboardTable.vue'
import DomainAnalyticsRepositoryActivityTable from '~/components/domain/analytics/RepositoryActivityTable.vue'
import DomainAnalyticsDurationTrendsChart from '~/components/domain/analytics/DurationTrendsChart.vue'
import DomainAnalyticsResolutionRateChart from '~/components/domain/analytics/ResolutionRateChart.vue'
import DomainAnalyticsVelocityChart from '~/components/domain/analytics/VelocityChart.vue'
import DomainWorkspaceGettingStartedCard from '~/components/domain/workspace/GettingStartedCard.vue'
import DomainWorkspaceActivityItem from '~/components/domain/workspace/ActivityItem.vue'
import DomainMembersMemberPreview from '~/components/domain/members/MemberPreview.vue'

/**
 * Workspace dashboard page - overview of the workspace
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const workspaceStore = useWorkspaceStore()
const { user } = useAuth()
const workspace = computed(() => workspaceStore.currentWorkspace)
const workspaceSlug = computed(() => workspace.value?.slug ?? '')
const workspaceId = computed(() => workspace.value?.id ?? null)

// Composables
const { members, fetchMembers } = useMembers(workspaceId)
const { activities, fetchActivities } = useActivity(workspaceId)
const { isConnected: isGitHubConnected, repositoriesCount, fetchConnection } = useGitHub(workspaceId)
const { pagination: runsPagination, fetchWorkspaceRuns } = useRuns(workspaceId)
const { invitations, fetchInvitations } = useInvitations(workspaceId)

// Analytics composable
const {
  overviewMetrics,
  timeline,
  findingsDistribution,
  topCategories,
  developerLeaderboard,
  repositoryActivity,
  tokenUsage,
  successRate,
  qualityScore,
  durationTrends,
  resolutionRate,
  velocity,
  isLoadingOverview,
  isLoadingTimeline,
  isLoadingDistribution,
  isLoadingCategories,
  isLoadingLeaderboard,
  isLoadingRepositories,
  isLoadingTokens,
  isLoadingSuccess,
  isLoadingQuality,
  isLoadingDuration,
  isLoadingResolution,
  isLoadingVelocity,
  fetchOverviewMetrics,
  fetchTimeline,
  fetchFindingsDistribution,
  fetchTopCategories,
  fetchDeveloperLeaderboard,
  fetchRepositoryActivity,
  fetchTokenUsage,
  fetchSuccessRate,
  fetchQualityScore,
  fetchDurationTrends,
  fetchResolutionRate,
  fetchVelocity,
} = useAnalytics(workspaceId)

// Getting Started visibility (persist in localStorage)
const isGettingStartedDismissed = ref(false)

// Check if user has dismissed getting started before
onMounted(() => {
  const dismissed = localStorage.getItem(`sentinel:${workspaceId.value}:getting-started-dismissed`)
  isGettingStartedDismissed.value = dismissed === 'true'

  if (workspaceId.value) {
    fetchMembers()
    fetchActivities()
    fetchConnection()
    fetchWorkspaceRuns({ perPage: 1 }) // Fetch just enough to get the total count
    fetchInvitations()

    // Fetch analytics data
    fetchOverviewMetrics()
    fetchTimeline({ days: 30 })
    fetchFindingsDistribution()
    fetchTopCategories({ limit: 10 })
    fetchDeveloperLeaderboard({ days: 30, limit: 5 })
    fetchRepositoryActivity({ days: 30, limit: 10 })
    fetchTokenUsage({ days: 30 })
    fetchSuccessRate({ days: 30 })
    fetchQualityScore({ days: 30 })
    fetchDurationTrends({ days: 30 })
    fetchResolutionRate({ days: 30 })
    fetchVelocity({ days: 30 })
  }
})

function handleDismissGettingStarted() {
  isGettingStartedDismissed.value = true
  localStorage.setItem(`sentinel:${workspaceId.value}:getting-started-dismissed`, 'true')
}

// Show getting started if not all setup and not dismissed
const showGettingStarted = computed(() => {
  // Currently, I always show the getting started card
  if (isGettingStartedDismissed.value) return false
  // const hasTeam = members.value.length > 1 || invitations.value.length > 0
  // const isFullySetup = isGitHubConnected.value && hasTeam && runsPagination.value.total > 0
  // return !isFullySetup
  return true
})

// Stats data
const stats = computed(() => [
  {
    label: 'Code Reviews',
    value: runsPagination.value.total,
    description: runsPagination.value.total === 0 ? 'No reviews yet' : 'Total reviews ran',
    icon: 'lucide:git-pull-request',
  },
  {
    label: 'Repositories',
    value: repositoriesCount.value,
    description: repositoriesCount.value === 0 ? 'No repositories connected' : 'Connected to GitHub',
    icon: 'lucide:folder-git-2',
  },
  {
    label: 'Findings',
    value: 0,
    description: 'No findings recorded',
    icon: 'lucide:search-check',
  },
  {
    label: 'Members',
    value: members.value.length || workspace.value?.members_count || 1,
    description: 'Active in workspace',
    icon: 'lucide:users',
  },
])

// Activity icon fallbacks for types missing icons
const activityIconFallback: Record<string, string> = {
  repositories_synced: 'refresh-cw',
  repository_connected: 'folder-git-2',
  github_connected: 'github',
  member_invited: 'user-plus',
  member_joined: 'user-check',
  member_removed: 'user-minus',
  workspace_created: 'plus-circle',
  'provider_key.updated': 'key',
  'provider_key.deleted': 'trash-2',
}

// Recent activity
const recentActivity = computed(() => {
  return activities.value.slice(0, 5).map(activity => {
    const icon = activity.type_icon || activityIconFallback[activity.type] || 'activity'
    return {
      id: activity.id,
      type: activity.type, // Pass type for badge color derivation
      title: activity.type_label,
      actorName: activity.actor?.name || 'System',
      description: activity.description,
      timestamp: formatRelativeTime(activity.created_at),
      icon: `lucide:${icon}`,
      avatarUrl: activity.actor?.avatar_url,
    }
  })
})

// Activity count for header
const activityCount = computed(() => recentActivity.value.length)

// Team members preview (limit to 5)
const teamMembers = computed(() => {
  return members.value.slice(0, 5).map(member => ({
    id: member.id,
    name: member.user.name,
    role: member.role_label || member.role,
    avatarUrl: member.user.avatar_url,
    status: undefined as 'online' | 'away' | 'offline' | undefined,
    isMe: member.user.id === user.value?.id,
  }))
})
</script>

<template>
  <BaseContainer>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-text-primary">
        Overview
      </h1>
      <p class="mt-1 text-text-secondary">
        Welcome to {{ workspace?.name }}
      </p>
    </div>

    <!-- Analytics Overview - full width, breathable cards -->
    <DomainAnalyticsAnalyticsOverview
      :metrics="overviewMetrics"
      :is-loading="isLoadingOverview"
    />

    <!-- Getting Started Card -->
    <DomainWorkspaceGettingStartedCard
      v-if="showGettingStarted"
      class="mt-8"
      :workspace-slug="workspaceSlug"
      :is-git-hub-connected="isGitHubConnected"
      :members-count="members.length"
      :repositories-count="repositoriesCount"
      :has-runs="runsPagination.total > 0"
      :has-invitations="invitations.length > 0"
      @dismiss="handleDismissGettingStarted"
    />

    <!-- Analytics Charts Section -->
    <div class="mt-8 space-y-6">
      <!-- Section Header -->
      <div>
        <h2 class="text-lg font-semibold text-text-primary">
          Analytics
        </h2>
        <p class="mt-1 text-sm text-text-muted">
          Insights and metrics from your code reviews
        </p>
      </div>

      <!-- Charts Grid -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Timeline Chart -->
        <DomainAnalyticsTimelineChart
          :data="timeline"
          :is-loading="isLoadingTimeline"
        />

        <!-- Findings Distribution Chart -->
        <DomainAnalyticsFindingsDistributionChart
          :data="findingsDistribution"
          :is-loading="isLoadingDistribution"
        />

        <!-- Top Categories Chart -->
        <DomainAnalyticsTopCategoriesChart
          :data="topCategories"
          :is-loading="isLoadingCategories"
        />

        <!-- Token Usage Chart -->
        <DomainAnalyticsTokenUsageChart
          :data="tokenUsage"
          :is-loading="isLoadingTokens"
        />

        <!-- Success Rate Chart -->
        <DomainAnalyticsSuccessRateChart
          :data="successRate"
          :is-loading="isLoadingSuccess"
        />

        <!-- Quality Score Chart -->
        <DomainAnalyticsQualityScoreChart
          :data="qualityScore"
          :is-loading="isLoadingQuality"
        />

        <!-- Duration Trends Chart -->
        <DomainAnalyticsDurationTrendsChart
          :data="durationTrends"
          :is-loading="isLoadingDuration"
        />

        <!-- Resolution Rate Chart -->
        <DomainAnalyticsResolutionRateChart
          :data="resolutionRate"
          :is-loading="isLoadingResolution"
        />

        <!-- Velocity Chart -->
        <DomainAnalyticsVelocityChart
          :data="velocity"
          :is-loading="isLoadingVelocity"
        />
      </div>

      <!-- Full Width Tables Section -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Developer Leaderboard -->
        <DomainAnalyticsDeveloperLeaderboardTable
          :data="developerLeaderboard"
          :is-loading="isLoadingLeaderboard"
        />

        <!-- Repository Activity -->
        <DomainAnalyticsRepositoryActivityTable
          :data="repositoryActivity"
          :is-loading="isLoadingRepositories"
        />
      </div>
    </div>

    <!-- Two Column Layout - responsive grid -->
    <div class="mt-8 grid gap-6 xl:grid-cols-3">
      <!-- Left Column - Recent Activity (takes more space) -->
      <div class="xl:col-span-2">
        <BaseCard class="h-full">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-base font-semibold text-text-primary">
              Recent Activity
            </h2>
            <span
              v-if="activityCount > 0"
              class="text-sm text-text-muted"
            >
              {{ activityCount }} {{ activityCount === 1 ? 'event' : 'events' }}
            </span>
          </div>

          <div
            v-if="recentActivity.length > 0"
            class="mt-4"
          >
            <DomainWorkspaceActivityItem
              v-for="(activity, index) in recentActivity"
              :key="activity.id"
              :avatar-name="activity.actorName"
              :avatar-url="activity.avatarUrl"
              :title="activity.title"
              :actor-name="activity.actorName"
              :description="activity.description"
              :timestamp="activity.timestamp"
              :icon="activity.icon"
              :type="activity.type"
              :is-first="index === 0"
              :is-last="index === recentActivity.length - 1"
            />
          </div>
          <div
            v-else
            class="py-12 text-center"
          >
            <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-bg-surface flex items-center justify-center">
              <Icon
                name="lucide:activity"
                class="w-6 h-6 text-text-muted"
              />
            </div>
            <p class="text-sm text-text-muted">
              No recent activity
            </p>
            <p class="text-xs text-text-muted mt-1">
              Activity will appear here as your team uses Sentinel
            </p>
          </div>
        </BaseCard>
      </div>

      <!-- Right Column - Team Members -->
      <div>
        <BaseCard class="h-full">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-semibold text-text-primary">
              Team
            </h2>
            <NuxtLink
              :to="`/${workspace?.slug}/members`"
              class="text-sm text-accent hover:text-accent-hover transition-default"
            >
              View all
            </NuxtLink>
          </div>

          <div class="divide-y divide-border-subtle -mx-1">
            <DomainMembersMemberPreview
              v-for="member in teamMembers"
              :key="member.id"
              :name="member.name"
              :role="member.role"
              :status="member.status"
              :avatar-url="member.avatarUrl"
              :is-me="member.isMe"
            />
          </div>

          <div
            v-if="teamMembers.length === 1"
            class="mt-5 pt-5 border-t border-border-subtle"
          >
            <NuxtLink
              :to="`/${workspace?.slug}/members`"
              class="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-accent bg-accent/5 hover:bg-accent/10 rounded-xl transition-default"
            >
              <Icon
                name="lucide:user-plus"
                class="w-4 h-4"
              />
              Invite team members
            </NuxtLink>
          </div>
        </BaseCard>
      </div>
    </div>
  </BaseContainer>
</template>

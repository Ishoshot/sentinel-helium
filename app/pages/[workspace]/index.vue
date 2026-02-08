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
    <div class="mb-8 animate-fade-in-up">
      <h1 class="text-2xl font-semibold text-text-primary">
        Overview
      </h1>
    </div>

    <!-- Analytics Overview - full width, staggered animation -->
    <div
      class="animate-fade-in-up"
      style="animation-delay: 75ms"
    >
      <DomainAnalyticsAnalyticsOverview
        :metrics="overviewMetrics"
        :is-loading="isLoadingOverview"
      />
    </div>

    <!-- Getting Started Card -->
    <DomainWorkspaceGettingStartedCard
      v-if="showGettingStarted"
      class="mt-8 animate-fade-in-up"
      style="animation-delay: 150ms"
      :workspace-slug="workspaceSlug"
      :is-git-hub-connected="isGitHubConnected"
      :members-count="members.length"
      :repositories-count="repositoriesCount"
      :has-runs="runsPagination.total > 0"
      :has-invitations="invitations.length > 0"
      @dismiss="handleDismissGettingStarted"
    />

    <!-- Analytics Charts Section -->
    <div
      class="mt-8 space-y-6 animate-fade-in-up"
      style="animation-delay: 225ms"
    >
      <!-- Section Header -->
      <h2 class="text-sm font-medium text-text-muted uppercase tracking-wide">
        Analytics
      </h2>

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
    <div
      class="mt-8 grid gap-6 xl:grid-cols-3 animate-fade-in-up"
      style="animation-delay: 300ms"
    >
      <!-- Left Column - Recent Activity (takes more space) -->
      <div class="xl:col-span-2">
        <BaseCard class="h-full">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-border-subtle">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                <Icon
                  name="lucide:activity"
                  class="w-4.5 h-4.5 text-accent"
                />
              </div>
              <div>
                <h2 class="text-sm font-semibold text-text-primary">
                  Recent Activity
                </h2>
                <p class="text-xs text-text-muted mt-0.5">
                  Latest updates from your workspace
                </p>
              </div>
            </div>
            <span
              v-if="activityCount > 0"
              class="px-2.5 py-1 rounded-full bg-bg-surface text-xs font-medium text-text-secondary tabular-nums"
            >
              {{ activityCount }} {{ activityCount === 1 ? 'event' : 'events' }}
            </span>
          </div>

          <!-- Activity Feed -->
          <div
            v-if="recentActivity.length > 0"
            class="mt-5"
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

          <!-- Empty State -->
          <div
            v-else
            class="py-16 text-center"
          >
            <div class="relative w-16 h-16 mx-auto mb-4">
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent" />
              <div class="absolute inset-0 flex items-center justify-center">
                <Icon
                  name="lucide:sparkles"
                  class="w-7 h-7 text-accent/60"
                />
              </div>
            </div>
            <p class="text-sm font-medium text-text-primary">
              No activity yet
            </p>
            <p class="text-sm text-text-muted mt-1.5 max-w-[240px] mx-auto">
              Activity will appear here as your team starts using Sentinel
            </p>
          </div>
        </BaseCard>
      </div>

      <!-- Right Column - Team Members -->
      <div>
        <BaseCard class="h-full">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium text-text-primary">
              Team
            </h2>
            <NuxtLink
              :to="`/${workspace?.slug}/members`"
              class="text-sm text-accent hover:text-accent-bright transition-colors"
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
            class="mt-4 pt-4 border-t border-border-subtle"
          >
            <NuxtLink
              :to="`/${workspace?.slug}/members`"
              class="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-[13px] font-medium text-accent bg-accent/10 hover:bg-accent/15 rounded-lg transition-colors"
            >
              <Icon
                name="lucide:user-plus"
                class="size-4"
              />
              Invite team members
            </NuxtLink>
          </div>
        </BaseCard>
      </div>
    </div>
  </BaseContainer>
</template>

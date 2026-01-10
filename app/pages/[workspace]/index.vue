<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useMembers } from '~/composables/useMembers'
import { useActivity } from '~/composables/useActivity'
import { useGitHub } from '~/composables/useGitHub'
import { useAuth } from '~/composables/useAuth'
import { formatRelativeTime } from '~/utils/date'

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
  }
})

function handleDismissGettingStarted() {
  isGettingStartedDismissed.value = true
  localStorage.setItem(`sentinel:${workspaceId.value}:getting-started-dismissed`, 'true')
}

// Show getting started if not all setup and not dismissed
const showGettingStarted = computed(() => {
  if (isGettingStartedDismissed.value) return false
  // Always show until fully setup
  const isFullySetup = isGitHubConnected.value && members.value.length > 1
  return !isFullySetup
})

// Stats data
const stats = computed(() => [
  {
    label: 'Code Reviews',
    value: 0,
    description: 'No reviews yet',
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
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-text-primary">
        Overview
      </h1>
      <p class="mt-1 text-text-secondary">
        Welcome to {{ workspace?.name }}
      </p>
    </div>

    <!-- Stats Grid - full width, breathable cards -->
    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <DomainStatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :description="stat.description"
        :icon="stat.icon"
      />
    </div>

    <!-- Getting Started Card -->
    <DomainGettingStartedCard
      v-if="showGettingStarted"
      class="mt-8"
      :workspace-slug="workspaceSlug"
      :is-git-hub-connected="isGitHubConnected"
      :members-count="members.length"
      :repositories-count="repositoriesCount"
      @dismiss="handleDismissGettingStarted"
    />

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
            <DomainActivityItem
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
            <DomainMemberPreview
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
  </div>
</template>

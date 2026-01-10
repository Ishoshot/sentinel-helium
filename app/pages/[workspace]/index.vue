<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'
import { useMembers } from '~/composables/useMembers'
import { useActivity } from '~/composables/useActivity'
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
const workspaceId = computed(() => workspace.value?.id ?? null)

// specific composables
const { members, fetchMembers, isLoading: isLoadingMembers } = useMembers(workspaceId)
const { activities, fetchActivities, isLoading: isLoadingActivities } = useActivity(workspaceId)

// Fetch data on mount
onMounted(() => {
  if (workspaceId.value) {
    fetchMembers()
    fetchActivities()
  }
})

// Stats data - will be replaced with real data from composables
const stats = computed(() => [
  {
    label: 'Code Reviews',
    value: 0,
    description: 'No reviews yet',
    icon: 'lucide:git-pull-request',
  },
  {
    label: 'Repositories',
    value: 0,
    description: 'No repositories connected',
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

// Recent activity
const recentActivity = computed(() => {
  return activities.value.slice(0, 5).map(activity => ({
    id: activity.id,
    title: activity.type_label,
    actorName: activity.actor?.name || 'System',
    description: activity.description,
    timestamp: formatRelativeTime(activity.created_at),
    icon: `lucide:${activity.type_icon}`,
    avatarUrl: activity.actor?.avatar_url,
  }))
})

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

// Getting started steps
const gettingStartedSteps = [
  {
    number: 1,
    title: 'Connect a Repository',
    description: 'Link your GitHub repositories to start automated code reviews.',
    completed: false,
  },
  {
    number: 2,
    title: 'Invite Your Team',
    description: 'Add team members to collaborate on code reviews together.',
    completed: false,
  },
  {
    number: 3,
    title: 'Configure Review Settings',
    description: 'Customize review policies and thresholds for your team.',
    completed: false,
  },
]
</script>

<template>
  <div class="max-w-7xl">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-text-primary">
        Overview
      </h1>
      <p class="mt-1 text-text-secondary">
        Welcome to {{ workspace?.name }}
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DomainStatCard
        v-for="stat in stats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
        :description="stat.description"
        :icon="stat.icon"
      />
    </div>

    <!-- Two Column Layout -->
    <div class="mt-8 grid gap-6 lg:grid-cols-3">
      <!-- Left Column - Getting Started -->
      <div class="lg:col-span-2">
        <BaseCard>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-base font-semibold text-text-primary">
              Getting Started
            </h2>
          </div>

          <div class="space-y-3">
            <div
              v-for="step in gettingStartedSteps"
              :key="step.number"
              class="flex items-start gap-4 p-4 rounded-lg transition-default"
              :class="step.completed ? 'bg-success-light/50' : 'bg-bg-surface'"
            >
              <div
                class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                :class="step.completed
                  ? 'bg-success text-white'
                  : step.number === 1
                    ? 'bg-accent text-white'
                    : 'bg-bg-elevated border border-border-muted text-text-muted'"
              >
                <Icon
                  v-if="step.completed"
                  name="lucide:check"
                  class="w-4 h-4"
                />
                <span v-else>{{ step.number }}</span>
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-medium text-text-primary">
                  {{ step.title }}
                </h3>
                <p class="text-sm text-text-secondary mt-0.5">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- Recent Activity -->
        <BaseCard class="mt-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-semibold text-text-primary">
              Recent Activity
            </h2>
          </div>

          <div
            v-if="recentActivity.length > 0"
            class="divide-y divide-border-subtle"
          >
            <DomainActivityItem
              v-for="activity in recentActivity"
              :key="activity.id"
              :avatar-name="activity.actorName"
              :avatar-url="activity.avatarUrl"
              :title="activity.title"
              :actor-name="activity.actorName"
              :description="activity.description"
              :timestamp="activity.timestamp"
              :icon="activity.icon"
            />
          </div>
          <div
            v-else
            class="py-8 text-center"
          >
            <Icon
              name="lucide:activity"
              class="w-8 h-8 text-text-muted mx-auto mb-2"
            />
            <p class="text-sm text-text-muted">
              No recent activity
            </p>
          </div>
        </BaseCard>
      </div>

      <!-- Right Column - Team Members -->
      <div>
        <BaseCard>
          <div class="flex items-center justify-between mb-4">
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

          <div class="divide-y divide-border-subtle">
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
            class="mt-4 pt-4 border-t border-border-subtle"
          >
            <NuxtLink
              :to="`/${workspace?.slug}/members`"
              class="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-accent bg-accent/5 hover:bg-accent/10 rounded-lg transition-default"
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

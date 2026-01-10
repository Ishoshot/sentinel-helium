<script setup lang="ts">
import type { Run } from '~/types'
import { formatRelativeTime } from '~/utils/date'

/**
 * RunRow - Displays a single run in a list
 * Matches premium design of RepositoryRow
 */

interface Props {
  run: Run
  workspaceSlug: string
}

const props = defineProps<Props>()

const pullRequestNumber = computed(() => props.run.metadata?.pull_request_number)
const pullRequestTitle = computed(() => props.run.metadata?.pull_request_title)
const senderLogin = computed(() => props.run.metadata?.sender_login)
const headBranch = computed(() => props.run.metadata?.head_branch)
const baseBranch = computed(() => props.run.metadata?.base_branch)

const runUrl = computed(() => `/${props.workspaceSlug}/runs/${props.run.id}`)
</script>

<template>
  <NuxtLink
    :to="runUrl"
    class="group block bg-bg-elevated border border-border-subtle rounded-xl p-5 hover:border-border-muted hover:shadow-sm transition-all duration-200"
  >
    <div class="flex items-start justify-between gap-6">
      <!-- Run info -->
      <div class="flex items-start gap-4 flex-1 min-w-0">
        <!-- Status Icon/Avatar -->
        <div class="w-10 h-10 rounded-full bg-bg-surface ring-1 ring-border-subtle flex items-center justify-center shrink-0">
          <Icon
            name="lucide:play-circle"
            class="w-5 h-5 text-text-muted"
          />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-1.5 min-w-0">
            <!-- PR Number -->
            <span 
              v-if="pullRequestNumber"
              class="text-sm font-mono text-text-muted shrink-0"
            >
              #{{ pullRequestNumber }}
            </span>

            <!-- PR Title -->
            <h3 class="text-sm font-semibold text-text-primary truncate leading-tight">
              {{ pullRequestTitle || 'Run #' + run.id }}
            </h3>

            <!-- Status Badge -->
            <DomainRunStatusBadge :status="run.status" />
          </div>

          <!-- Description / Meta -->
          <div class="flex items-center gap-x-4 gap-y-2 flex-wrap text-sm text-text-secondary mb-2 leading-relaxed">
            <span v-if="senderLogin">
              Triggered by <span class="font-medium text-text-primary">{{ senderLogin }}</span>
            </span>
          </div>

          <!-- Branch & Time info -->
          <div class="flex items-center gap-5 text-xs font-medium text-text-muted">
            <!-- Branches -->
            <span
              v-if="headBranch && baseBranch"
              class="flex items-center gap-1.5"
            >
              <Icon
                name="lucide:git-branch"
                class="w-3.5 h-3.5"
              />
              <span class="font-mono">{{ headBranch }}</span>
              <Icon
                name="lucide:arrow-right"
                class="w-3 h-3"
              />
              <span class="font-mono">{{ baseBranch }}</span>
            </span>

            <!-- Timestamp -->
            <span class="flex items-center gap-1.5">
              <Icon
                name="lucide:clock"
                class="w-3.5 h-3.5"
              />
              {{ formatRelativeTime(run.created_at) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Chevron -->
      <div class="flex items-center justify-center shrink-0 self-center text-text-muted/50 group-hover:text-text-muted transition-colors">
        <Icon
          name="lucide:chevron-right"
          class="w-5 h-5"
        />
      </div>
    </div>
  </NuxtLink>
</template>

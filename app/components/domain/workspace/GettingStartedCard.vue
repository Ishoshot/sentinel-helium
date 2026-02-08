<script setup lang="ts">
/**
 * GettingStartedCard - Premium onboarding experience
 * Tracks user progress through setup steps with intelligent detection
 * Follows Apple-inspired design with purposeful motion and visual hierarchy
 */

interface Step {
  id: string
  title: string
  description: string
  benefit: string
  icon: string
  completed: boolean
  route: string
  cta: string
}

interface Props {
  workspaceSlug: string
  isGitHubConnected: boolean
  membersCount: number
  repositoriesCount: number
  hasRuns: boolean
  hasInvitations: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  dismiss: []
}>()

// Local state
const isDismissed = ref(false)
const isCollapsed = ref(false)
const showCelebration = ref(false)

// Steps with smart completion detection
const steps = computed<Step[]>(() => [
  {
    id: 'connect-github',
    title: 'Connect GitHub',
    description: 'Link your repositories to enable AI-powered code reviews.',
    benefit: 'Unlock automated PR analysis',
    icon: 'lucide:github',
    completed: props.isGitHubConnected,
    route: `/${props.workspaceSlug}/settings/integrations`,
    cta: props.isGitHubConnected ? 'Connected' : 'Connect',
  },
  {
    id: 'invite-team',
    title: 'Invite your team',
    description: 'Collaborate with teammates on code reviews.',
    benefit: 'Enable team collaboration',
    icon: 'lucide:users',
    completed: props.membersCount > 1 || props.hasInvitations,
    route: `/${props.workspaceSlug}/members`,
    cta: props.membersCount > 1 ? 'Team joined' : (props.hasInvitations ? 'Invitation sent' : 'Invite'),
  },
  {
    id: 'first-review',
    title: 'Run your first review',
    description: 'Open a pull request to see Sentinel in action.',
    benefit: 'Experience the magic',
    icon: 'lucide:sparkles',
    completed: props.hasRuns,
    route: `/${props.workspaceSlug}/repositories`,
    cta: props.hasRuns ? 'View reviews' : 'View repositories',
  },
])

// Progress calculations
const completedCount = computed(() => steps.value.filter(s => s.completed).length)
const totalSteps = computed(() => steps.value.length)
const progressPercentage = computed(() => (completedCount.value / totalSteps.value) * 100)
const isAllComplete = computed(() => completedCount.value === totalSteps.value)

// Progress ring calculations (SVG)
const radius = 18
const circumference = 2 * Math.PI * radius
const strokeDashoffset = computed(() =>
  circumference - (progressPercentage.value / 100) * circumference
)

// Watch for completion and trigger celebration
watch(isAllComplete, (complete) => {
  if (complete) {
    showCelebration.value = true
    // Auto-hide celebration after delay
    setTimeout(() => {
      showCelebration.value = false
    }, 3000)
  }
})

// Current step (first incomplete)
const currentStepIndex = computed(() => {
  const idx = steps.value.findIndex(s => !s.completed)
  return idx === -1 ? steps.value.length - 1 : idx
})

function handleDismiss() {
  isDismissed.value = true
  emit('dismiss')
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="!isDismissed"
      class="relative overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 pb-5">
        <div class="flex items-center gap-3">
          <!-- Progress Ring -->
          <div class="relative">
            <svg
              class="w-12 h-12 -rotate-90 transform"
              viewBox="0 0 44 44"
            >
              <!-- Background ring -->
              <circle
                cx="22"
                cy="22"
                :r="radius"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                class="text-bg-surface"
              />
              <!-- Progress ring -->
              <circle
                cx="22"
                cy="22"
                :r="radius"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                class="text-accent transition-all duration-700 ease-out"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
              />
            </svg>
            <!-- Center text -->
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-semibold text-text-primary">
                {{ completedCount }}/{{ totalSteps }}
              </span>
            </div>
          </div>

          <!-- Title section -->
          <div>
            <h2 class="text-base font-semibold text-text-primary">
              {{ isAllComplete ? 'All set!' : 'Get started' }}
            </h2>
            <p class="text-sm text-text-muted mt-0.5">
              {{ isAllComplete
                ? 'Your workspace is ready'
                : `${totalSteps - completedCount} ${totalSteps - completedCount === 1 ? 'step' : 'steps'} remaining`
              }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            class="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-default"
            :title="isCollapsed ? 'Expand' : 'Collapse'"
            @click="toggleCollapse"
          >
            <Icon
              :name="isCollapsed ? 'lucide:chevron-down' : 'lucide:chevron-up'"
              class="w-4 h-4"
            />
          </button>
          <button
            v-if="isAllComplete"
            class="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-default"
            title="Dismiss"
            @click="handleDismiss"
          >
            <Icon
              name="lucide:x"
              class="w-4 h-4"
            />
          </button>
        </div>
      </div>

      <!-- Steps Content -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-show="!isCollapsed"
          class="px-6 pb-6"
        >
          <!-- Celebration banner -->
          <Transition
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-300 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showCelebration && isAllComplete"
              class="mb-5 p-5 rounded-lg bg-gradient-to-r from-success/5 via-accent/5 to-success/5 border border-success/20"
            >
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Icon
                    name="lucide:party-popper"
                    class="w-5 h-5 text-success"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-text-primary">
                    Congratulations!
                  </p>
                  <p class="text-sm text-text-secondary">
                    You're all set to start reviewing code with Sentinel.
                  </p>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Steps list -->
          <div class="space-y-3">
            <NuxtLink
              v-for="(step, index) in steps"
              :key="step.id"
              :to="step.route"
              class="group flex items-center gap-4 p-5 rounded-xl border transition-all duration-150"
              :class="[
                step.completed
                  ? 'bg-success/[0.03] border-success/20 hover:bg-success/[0.06]'
                  : index === currentStepIndex
                    ? 'bg-accent/[0.03] border-accent/20 hover:bg-accent/[0.06] hover:border-accent/30'
                    : 'bg-bg-surface/50 border-transparent hover:bg-bg-surface hover:border-border-subtle'
              ]"
            >
              <!-- Step indicator -->
              <div
                class="relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                :class="[
                  step.completed
                    ? 'bg-emerald-500 text-white'
                    : index === currentStepIndex
                      ? 'bg-accent text-white'
                      : 'bg-bg-elevated border border-border-muted text-text-muted'
                ]"
              >
                <Icon
                  v-if="step.completed"
                  name="lucide:check"
                  class="size-4"
                />
                <Icon
                  v-else
                  :name="step.icon"
                  class="size-4"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3
                    class="text-[13px] font-medium transition-colors"
                    :class="step.completed ? 'text-emerald-400' : 'text-text-primary'"
                  >
                    {{ step.title }}
                  </h3>
                  <span
                    v-if="index === currentStepIndex && !step.completed"
                    class="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded bg-accent/10 text-accent"
                  >
                    Next
                  </span>
                </div>
                <p class="text-xs text-text-muted mt-0.5 line-clamp-1">
                  {{ step.description }}
                </p>
              </div>

              <!-- Action indicator -->
              <div class="shrink-0 flex items-center gap-2">
                <span
                  v-if="!step.completed"
                  class="text-xs text-text-faint group-hover:text-text-muted transition-colors hidden sm:block"
                >
                  {{ step.benefit }}
                </span>
                <div
                  class="size-7 rounded-md flex items-center justify-center transition-colors"
                  :class="[
                    step.completed
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-bg-surface text-text-muted group-hover:bg-accent/10 group-hover:text-accent'
                  ]"
                >
                  <Icon
                    :name="step.completed ? 'lucide:check' : 'lucide:arrow-right'"
                    class="size-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Footer with progress bar -->
          <div class="mt-4 pt-4 border-t border-border-subtle">
            <div class="flex items-center justify-between text-[11px] text-text-muted mb-1.5">
              <span>Setup progress</span>
              <span class="font-medium text-text-secondary">{{ Math.round(progressPercentage) }}%</span>
            </div>
            <div class="h-1 bg-bg-surface rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500 ease-out"
                :class="isAllComplete ? 'bg-emerald-500' : 'bg-accent'"
                :style="{ width: `${progressPercentage}%` }"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

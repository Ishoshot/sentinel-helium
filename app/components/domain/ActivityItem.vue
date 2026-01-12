<script setup lang="ts">
/**
 * ActivityItem - Premium activity log entry with timeline connector
 * Features colored badges, timeline visualization, and rich interactions
 */

interface Props {
  avatarUrl?: string | null
  avatarName: string
  title: string // Badge text (e.g. "Synced", "Created")
  actorName: string
  description: string
  timestamp: string
  icon?: string
  type?: string // Activity type for badge color derivation
  isFirst?: boolean // Hide upper connector line for first item
  isLast?: boolean // Hide lower connector line for last item
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'lucide:activity',
  type: '',
  isFirst: false,
  isLast: false,
})

// Hover state for optional chevron
const isHovered = ref(false)

// Derive badge styling from activity type or title
// Using Design System semantic tokens: accent, success, warning, error
const badgeConfig = computed(() => {
  const type = props.type.toLowerCase()
  const title = props.title.toLowerCase()

  // Sync/Connect - Sentinel Blue (Accent)
  if (type.includes('sync') || title.includes('sync') || type.includes('connect') || title.includes('connect')) {
    return {
      bg: 'bg-accent/10',
      text: 'text-accent',
      icon: type.includes('sync') ? 'lucide:refresh-cw' : 'lucide:link',
    }
  }

  // Commit/Push - Success (Green)
  if (type.includes('commit') || title.includes('commit') || type.includes('push')) {
    return {
      bg: 'bg-success/10',
      text: 'text-success',
      icon: 'lucide:git-commit-horizontal',
    }
  }

  // Create/Add - Accent (Blue) - Primary generative action
  if (type.includes('create') || title.includes('create') || type.includes('add')) {
    return {
      bg: 'bg-accent/10',
      text: 'text-accent',
      icon: 'lucide:plus',
    }
  }

  // Member/Invite - Accent (Blue) - Workspace growth
  if (type.includes('invite') || type.includes('member') || type.includes('join')) {
    return {
      bg: 'bg-accent/10',
      text: 'text-accent',
      icon: 'lucide:user-plus',
    }
  }

  // Remove/Delete - Error (Red)
  if (type.includes('remove') || type.includes('delete') || type.includes('disconnect')) {
    return {
      bg: 'bg-error/10',
      text: 'text-error',
      icon: 'lucide:trash-2',
    }
  }

  // Update - Warning (Amber)
  if (type.includes('update') || title.includes('update')) {
    return {
      bg: 'bg-warning/10',
      text: 'text-warning',
      icon: 'lucide:pencil',
    }
  }

  // Default - Neutral (Gray)
  return {
    bg: 'bg-bg-surface',
    text: 'text-text-secondary',
    icon: props.icon || 'lucide:activity',
  }
})

// Format description to remove actor name prefix if present
const formattedDescription = computed(() => {
  if (props.description.startsWith(props.actorName)) {
    return props.description.substring(props.actorName.length).trim()
  }
  return props.description
})
</script>

<template>
  <div
    class="group relative flex gap-0"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Timeline connector column -->
    <div class="relative flex flex-col items-center flex-shrink-0 w-12 sm:w-16">
      <!-- Upper Line (hidden for first item) -->
      <div
        v-if="!isFirst"
        class="absolute top-0 h-10 left-1/2 w-px -translate-x-1/2 bg-border-subtle"
      />
      <!-- Lower Line (hidden for last item) -->
      <div
        v-if="!isLast"
        class="absolute top-10 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border-subtle"
      />

      <!-- Avatar (positioned to align with content padding) -->
      <div class="relative z-10 mt-5 ring-4 ring-bg-elevated rounded-full bg-bg-elevated">
        <BaseAvatar
          v-if="avatarUrl"
          :src="avatarUrl"
          :name="avatarName"
          size="md"
        />
        <div
          v-else
          class="w-10 h-10 bg-bg-surface rounded-full flex items-center justify-center border border-border-subtle"
        >
          <Icon
            :name="badgeConfig.icon"
            class="w-5 h-5 text-text-muted"
          />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0 py-5 pr-2 sm:pr-4">
      <!-- Actor Name -->
      <h4 class="text-sm font-semibold text-text-primary">
        {{ actorName }}
      </h4>

      <!-- Description -->
      <p class="text-sm text-text-secondary mt-1 leading-normal">
        {{ formattedDescription }}
      </p>

      <!-- Badge and Timestamp row -->
      <div class="flex flex-wrap items-center gap-3 mt-3">
        <!-- Activity Type Badge -->
        <div
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors"
          :class="[badgeConfig.bg, badgeConfig.text]"
        >
          <Icon
            :name="badgeConfig.icon"
            class="w-3.5 h-3.5"
          />
          <span>{{ title }}</span>
        </div>

        <!-- Timestamp -->
        <span class="text-xs text-text-muted font-medium">
          {{ timestamp }}
        </span>
      </div>
    </div>

    <!-- Hover chevron (optional, for clickable items) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-x-2"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 -translate-x-2"
    >
      <div
        v-if="isHovered"
        class="absolute right-0 top-6 text-text-muted/50"
      >
        <Icon
          name="lucide:chevron-right"
          class="w-5 h-5"
        />
      </div>
    </Transition>
  </div>
</template>

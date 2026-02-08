<script setup lang="ts">
/**
 * ActivityItem - Editorial-style activity feed entry
 * Clean, minimal design with colored accent borders and elegant typography
 */

interface Props {
  avatarUrl?: string | null
  avatarName: string
  title: string
  actorName: string
  description: string
  timestamp: string
  icon?: string
  type?: string
  isFirst?: boolean
  isLast?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'lucide:activity',
  type: '',
  isFirst: false,
  isLast: false,
})

// Derive accent color and icon from activity type
const activityStyle = computed(() => {
  const type = props.type.toLowerCase()
  const title = props.title.toLowerCase()

  // Sync/Connect - Teal accent
  if (type.includes('sync') || title.includes('sync') || type.includes('connect') || title.includes('connect')) {
    return {
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      badgeBg: 'bg-accent/10',
      badgeText: 'text-accent',
      icon: type.includes('sync') ? 'lucide:refresh-cw' : 'lucide:link',
    }
  }

  // Commit/Push - Emerald
  if (type.includes('commit') || title.includes('commit') || type.includes('push')) {
    return {
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      icon: 'lucide:git-commit-horizontal',
    }
  }

  // Create/Add - Sky blue
  if (type.includes('create') || title.includes('create') || type.includes('add')) {
    return {
      iconBg: 'bg-sky-500/10',
      iconColor: 'text-sky-500',
      badgeBg: 'bg-sky-500/10',
      badgeText: 'text-sky-600 dark:text-sky-400',
      icon: 'lucide:plus-circle',
    }
  }

  // Member/Invite - Violet
  if (type.includes('invite') || type.includes('member') || type.includes('join')) {
    return {
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-500',
      badgeBg: 'bg-violet-500/10',
      badgeText: 'text-violet-600 dark:text-violet-400',
      icon: 'lucide:user-plus',
    }
  }

  // Remove/Delete - Rose
  if (type.includes('remove') || type.includes('delete') || type.includes('disconnect')) {
    return {
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-500',
      badgeBg: 'bg-rose-500/10',
      badgeText: 'text-rose-600 dark:text-rose-400',
      icon: 'lucide:trash-2',
    }
  }

  // Update - Amber
  if (type.includes('update') || title.includes('update')) {
    return {
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      badgeBg: 'bg-amber-500/10',
      badgeText: 'text-amber-600 dark:text-amber-400',
      icon: 'lucide:pencil',
    }
  }

  // Default - Neutral
  return {
    iconBg: 'bg-bg-surface',
    iconColor: 'text-text-muted',
    badgeBg: 'bg-bg-surface',
    badgeText: 'text-text-secondary',
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
    class="group relative"
    :class="{ 'mt-3': !isFirst }"
  >
    <!-- Activity Card -->
    <div
      class="relative flex gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-bg-hover bg-bg-surface cursor-pointer"
    >
      <!-- Icon -->
      <div
        class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
        :class="activityStyle.iconBg"
      >
        <Icon
          :name="activityStyle.icon"
          class="w-5 h-5"
          :class="activityStyle.iconColor"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Top row: Actor + Timestamp -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <BaseAvatar
              v-if="avatarUrl"
              :src="avatarUrl"
              :name="avatarName"
              size="xs"
            />
            <span class="text-sm font-medium text-text-primary truncate">
              {{ actorName }}
            </span>
          </div>
          <time class="text-xs text-text-muted whitespace-nowrap font-medium tabular-nums">
            {{ timestamp }}
          </time>
        </div>

        <!-- Description -->
        <p class="mt-1.5 text-sm text-text-secondary leading-relaxed">
          {{ formattedDescription }}
        </p>

        <!-- Activity Badge -->
        <div class="mt-3">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
            :class="[activityStyle.badgeBg, activityStyle.badgeText]"
          >
            <Icon
              :name="activityStyle.icon"
              class="w-3 h-3"
            />
            {{ title }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

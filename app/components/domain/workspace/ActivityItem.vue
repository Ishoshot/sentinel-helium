<script setup lang="ts">
/**
 * ActivityItem - Compact two-line activity feed entry
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
      iconColor: 'text-accent',
      badgeBg: 'bg-accent/10',
      badgeText: 'text-accent',
      icon: type.includes('sync') ? 'lucide:refresh-cw' : 'lucide:link',
    }
  }

  // Commit/Push - Emerald
  if (type.includes('commit') || title.includes('commit') || type.includes('push')) {
    return {
      iconColor: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-400',
      icon: 'lucide:git-commit-horizontal',
    }
  }

  // Create/Add - Sky blue
  if (type.includes('create') || title.includes('create') || type.includes('add')) {
    return {
      iconColor: 'text-sky-500',
      badgeBg: 'bg-sky-500/10',
      badgeText: 'text-sky-400',
      icon: 'lucide:plus-circle',
    }
  }

  // Review completed - Emerald
  if (type.includes('completed') || title.includes('completed')) {
    return {
      iconColor: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/10',
      badgeText: 'text-emerald-400',
      icon: 'lucide:check-circle-2',
    }
  }

  // Annotations/Posted - Violet
  if (type.includes('annotation') || title.includes('annotation') || type.includes('posted') || title.includes('posted')) {
    return {
      iconColor: 'text-violet-500',
      badgeBg: 'bg-violet-500/10',
      badgeText: 'text-violet-400',
      icon: 'lucide:message-square',
    }
  }

  // Member/Invite - Violet
  if (type.includes('invite') || type.includes('member') || type.includes('join')) {
    return {
      iconColor: 'text-violet-500',
      badgeBg: 'bg-violet-500/10',
      badgeText: 'text-violet-400',
      icon: 'lucide:user-plus',
    }
  }

  // Remove/Delete - Rose
  if (type.includes('remove') || type.includes('delete') || type.includes('disconnect')) {
    return {
      iconColor: 'text-rose-500',
      badgeBg: 'bg-rose-500/10',
      badgeText: 'text-rose-400',
      icon: 'lucide:trash-2',
    }
  }

  // Update - Amber
  if (type.includes('update') || title.includes('update')) {
    return {
      iconColor: 'text-amber-500',
      badgeBg: 'bg-amber-500/10',
      badgeText: 'text-amber-400',
      icon: 'lucide:pencil',
    }
  }

  // Default - Zinc
  return {
    iconColor: 'text-zinc-400',
    badgeBg: 'bg-zinc-500/10',
    badgeText: 'text-zinc-400',
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
    class="group flex gap-4 p-3 bg-bg-surface rounded-lg border border-border-subtle hover:bg-bg-hover transition-colors cursor-pointer"
  >
    <!-- Icon -->
    <Icon
      :name="activityStyle.icon"
      class="w-4 h-4 flex-shrink-0 mt-0.5"
      :class="activityStyle.iconColor"
    />

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Top row: Actor + Badge + Timestamp -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <BaseAvatar
            v-if="avatarUrl"
            :src="avatarUrl"
            :name="avatarName"
            size="xs"
          />
          <span class="text-sm font-medium text-text-primary truncate">{{ actorName }}</span>
          <span
            class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
            :class="[activityStyle.badgeBg, activityStyle.badgeText]"
          >
            {{ title }}
          </span>
        </div>
        <time class="text-xs text-text-muted whitespace-nowrap tabular-nums">
          {{ timestamp }}
        </time>
      </div>

      <!-- Description -->
      <p class="mt-1 text-sm text-text-secondary truncate">
        {{ formattedDescription }}
      </p>
    </div>
  </div>
</template>

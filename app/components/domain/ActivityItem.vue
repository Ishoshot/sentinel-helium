<script setup lang="ts">
/**
 * ActivityItem - Activity log entry display
 * Domain component for showing workspace activity
 */

interface Props {
  avatarUrl?: string | null
  avatarName: string
  title: string // Action Label (e.g. "Workspace Created")
  actorName: string
  description: string
  timestamp: string
  icon?: string
}

const props = defineProps<Props>()

const formattedDescription = computed(() => {
  if (props.description.startsWith(props.actorName)) {
    return props.description.substring(props.actorName.length).trim()
  }
  return props.description
})
</script>

<template>
  <div class="group flex items-start gap-3 py-3 transition-colors hover:bg-bg-surface/50 -mx-4 px-4">
    <!-- Avatar -->
    <div class="flex-shrink-0 mt-0.5">
      <BaseAvatar
        v-if="avatarUrl"
        :src="avatarUrl"
        :name="avatarName"
        size="sm"
      />
      <div
        v-else
        class="w-8 h-8 bg-bg-surface rounded-full flex items-center justify-center border border-border-subtle"
      >
        <Icon
          :name="icon || 'lucide:activity'"
          class="w-4 h-4 text-text-muted"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Actor Name -->
      <div class="text-sm font-medium text-text-primary">
        {{ actorName }}
      </div>

      <!-- Description -->
      <p class="text-sm text-text-secondary mt-0.5 leading-relaxed">
        {{ formattedDescription }}
      </p>

      <!-- Metadata -->
      <div class="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
        <div class="flex items-center gap-1.5">
          <Icon 
            :name="icon || 'lucide:activity'" 
            class="w-3.5 h-3.5" 
          />
          <span>{{ title }}</span>
        </div>
        <span>&middot;</span>
        <span>{{ timestamp }}</span>
      </div>
    </div>
  </div>
</template>

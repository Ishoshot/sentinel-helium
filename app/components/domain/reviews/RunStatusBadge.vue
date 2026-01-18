<script setup lang="ts">
import { RunStatus } from '~/types'

/**
 * RunStatusBadge - Displays the status of a run with semantic styling
 */

interface Props {
  status: RunStatus | string
  variant?: 'badge' | 'minimal'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'badge',
})

const config = computed(() => {
  switch (props.status) {
    case RunStatus.Completed:
      return {
        bg: 'bg-success/10',
        text: 'text-success',
        icon: 'lucide:check-circle-2', // Minimal variant might ignore this or use a simple dot
        label: 'Completed',
        ring: 'ring-success/20',
        dot: 'bg-success',
      }
    case RunStatus.Failed:
      return {
        bg: 'bg-error/10',
        text: 'text-error',
        icon: 'lucide:x-circle',
        label: 'Failed',
        ring: 'ring-error/20',
        dot: 'bg-error',
      }
    case RunStatus.InProgress:
      return {
        bg: 'bg-accent/10',
        text: 'text-accent',
        icon: 'lucide:loader-2',
        label: 'Running', // "Building" in concept, "Running" or "In Progress" in app
        ring: 'ring-accent/20',
        spin: true,
        dot: 'bg-accent',
      }
    case RunStatus.Queued:
      return {
        bg: 'bg-warning/10',
        text: 'text-warning',
        icon: 'lucide:clock',
        label: 'Queued',
        ring: 'ring-warning/20',
        dot: 'bg-warning',
      }
    case RunStatus.Skipped:
      return {
        bg: 'bg-bg-surface',
        text: 'text-text-muted',
        icon: 'lucide:slash',
        label: 'Skipped',
        ring: 'ring-border-subtle',
        dot: 'bg-text-muted',
      }
    default:
      return {
        bg: 'bg-bg-surface',
        text: 'text-text-muted',
        icon: 'lucide:help-circle',
        label: props.status,
        ring: 'ring-border-subtle',
        dot: 'bg-text-muted',
      }
  }
})
</script>

<template>
  <!-- Minimal Variant (Dot + Text) -->
  <div
    v-if="variant === 'minimal'"
    class="inline-flex items-center gap-2 text-sm font-medium"
    :class="config.text"
  >
    <div
      v-if="config.spin"
      class="relative flex h-2 w-2"
    >
      <span
        class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        :class="config.dot"
      />
      <span
        class="relative inline-flex rounded-full h-2 w-2"
        :class="config.dot"
      />
    </div>
    <div
      v-else
      class="w-2 h-2 rounded-full"
      :class="config.dot"
    />
    <span>{{ config.label }}</span>
  </div>

  <!-- Standard Badge Variant -->
  <div
    v-else
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset"
    :class="[config.bg, config.text, config.ring]"
  >
    <Icon
      :name="config.icon"
      class="w-3.5 h-3.5"
      :class="{ 'animate-spin': config.spin }"
    />
    <span>{{ config.label }}</span>
  </div>
</template>

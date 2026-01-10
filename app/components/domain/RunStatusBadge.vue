<script setup lang="ts">
import { RunStatus } from '~/types'

/**
 * RunStatusBadge - Displays the status of a run with semantic styling
 */

interface Props {
  status: RunStatus | string
}

const props = defineProps<Props>()

const config = computed(() => {
  switch (props.status) {
    case RunStatus.Completed:
      return {
        bg: 'bg-success/10',
        text: 'text-success',
        icon: 'lucide:check-circle-2',
        label: 'Completed',
        ring: 'ring-success/20',
      }
    case RunStatus.Failed:
      return {
        bg: 'bg-error/10',
        text: 'text-error',
        icon: 'lucide:x-circle',
        label: 'Failed',
        ring: 'ring-error/20',
      }
    case RunStatus.InProgress:
      return {
        bg: 'bg-accent/10',
        text: 'text-accent',
        icon: 'lucide:loader-2',
        label: 'In Progress',
        ring: 'ring-accent/20',
        spin: true,
      }
    case RunStatus.Queued:
      return {
        bg: 'bg-warning/10',
        text: 'text-warning',
        icon: 'lucide:clock',
        label: 'Queued',
        ring: 'ring-warning/20',
      }
    case RunStatus.Skipped:
      return {
        bg: 'bg-bg-surface',
        text: 'text-text-muted',
        icon: 'lucide:slash',
        label: 'Skipped',
        ring: 'ring-border-subtle',
      }
    default:
      return {
        bg: 'bg-bg-surface',
        text: 'text-text-muted',
        icon: 'lucide:help-circle',
        label: props.status,
        ring: 'ring-border-subtle',
      }
  }
})
</script>

<template>
  <div
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

<script setup lang="ts">
import { RunStatus } from '~/types'

/**
 * RunStatusBadge - Displays the status of a run with semantic styling
 */

interface Props {
  status: RunStatus | string
  variant?: 'badge' | 'minimal' | 'dot'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'badge',
})

const config = computed(() => {
  switch (props.status) {
    case RunStatus.Completed:
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        icon: 'lucide:check-circle-2',
        label: 'Completed',
        dot: 'bg-emerald-500',
      }
    case RunStatus.Failed:
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        icon: 'lucide:x-circle',
        label: 'Failed',
        dot: 'bg-red-500',
      }
    case RunStatus.InProgress:
      return {
        bg: 'bg-accent/10',
        text: 'text-accent',
        icon: 'lucide:loader-2',
        label: 'Running',
        spin: true,
        dot: 'bg-accent',
      }
    case RunStatus.Queued:
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        icon: 'lucide:clock',
        label: 'Queued',
        dot: 'bg-amber-500',
      }
    case RunStatus.Skipped:
      return {
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-400',
        icon: 'lucide:slash',
        label: 'Skipped',
        dot: 'bg-zinc-400',
      }
    default:
      return {
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-400',
        icon: 'lucide:help-circle',
        label: props.status,
        dot: 'bg-zinc-400',
      }
  }
})
</script>

<template>
  <!-- Dot Variant (Dot only, with tooltip) -->
  <span
    v-if="variant === 'dot'"
    :title="config.label"
    class="inline-flex items-center justify-center"
  >
    <span
      v-if="config.spin"
      class="relative flex size-2.5"
    >
      <span
        class="absolute inline-flex size-full animate-ping rounded-full opacity-75"
        :class="config.dot"
      />
      <span
        class="relative inline-flex size-2.5 rounded-full"
        :class="config.dot"
      />
    </span>
    <span
      v-else
      class="size-2.5 rounded-full"
      :class="config.dot"
    />
  </span>

  <!-- Minimal Variant (Dot + Text) -->
  <div
    v-else-if="variant === 'minimal'"
    class="inline-flex items-center gap-2 text-sm font-medium"
    :class="config.text"
  >
    <div
      v-if="config.spin"
      class="relative flex size-2"
    >
      <span
        class="absolute inline-flex size-full animate-ping rounded-full opacity-75"
        :class="config.dot"
      />
      <span
        class="relative inline-flex size-2 rounded-full"
        :class="config.dot"
      />
    </div>
    <div
      v-else
      class="size-2 rounded-full"
      :class="config.dot"
    />
    <span>{{ config.label }}</span>
  </div>

  <!-- Standard Badge Variant -->
  <div
    v-else
    class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
    :class="[config.bg, config.text]"
  >
    <Icon
      :name="config.icon"
      class="size-3"
      :class="{ 'animate-spin': config.spin }"
    />
    <span>{{ config.label }}</span>
  </div>
</template>

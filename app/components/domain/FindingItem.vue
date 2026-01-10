<script setup lang="ts">
import { FindingSeverity } from '~/types'
import type { Finding } from '~/types'

/**
 * FindingItem - Displays a single finding with severity and location
 */

interface Props {
  finding: Finding
}

const props = defineProps<Props>()

const severityConfig = computed(() => {
  switch (props.finding.severity) {
    case FindingSeverity.Critical:
    case 'critical':
      return {
        bg: 'bg-error/10',
        text: 'text-error',
        border: 'border-error/20',
        icon: 'lucide:alert-octagon',
        label: 'Critical',
      }
    case FindingSeverity.High:
    case 'high':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-500/20',
        icon: 'lucide:alert-triangle',
        label: 'High',
      }
    case FindingSeverity.Medium:
    case 'medium':
      return {
        bg: 'bg-warning/10',
        text: 'text-warning',
        border: 'border-warning/20',
        icon: 'lucide:alert-circle',
        label: 'Medium',
      }
    case FindingSeverity.Low:
    case 'low':
      return {
        bg: 'bg-info/10',
        text: 'text-info',
        border: 'border-info/20',
        icon: 'lucide:info',
        label: 'Low',
      }
    default:
      return {
        bg: 'bg-bg-surface',
        text: 'text-text-muted',
        border: 'border-border-subtle',
        icon: 'lucide:help-circle',
        label: props.finding.severity,
      }
  }
})

const location = computed(() => {
  if (!props.finding.file_path) return null
  if (props.finding.line_start) {
    return `${props.finding.file_path}:${props.finding.line_start}${props.finding.line_end && props.finding.line_end !== props.finding.line_start ? `-${props.finding.line_end}` : ''}`
  }
  return props.finding.file_path
})
</script>

<template>
  <div class="p-4 bg-bg-surface border border-border-subtle rounded-lg hover:border-border-muted transition-colors">
    <div class="flex items-start gap-3">
      <!-- Severity Icon -->
      <div 
        class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        :class="severityConfig.bg"
      >
        <Icon
          :name="severityConfig.icon"
          class="w-4 h-4"
          :class="severityConfig.text"
        />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <!-- Severity Badge -->
          <span 
            class="text-xs font-medium px-2 py-0.5 rounded-full border"
            :class="[severityConfig.bg, severityConfig.text, severityConfig.border]"
          >
            {{ severityConfig.label }}
          </span>

          <!-- Category -->
          <span class="text-xs text-text-muted capitalize">
            {{ finding.category }}
          </span>
        </div>

        <!-- Title -->
        <h4 class="text-sm font-medium text-text-primary mb-1">
          {{ finding.title }}
        </h4>

        <!-- Description -->
        <p class="text-sm text-text-secondary leading-relaxed mb-2">
          {{ finding.description }}
        </p>

        <!-- Location -->
        <div 
          v-if="location"
          class="flex items-center gap-1.5 text-xs text-text-muted font-mono bg-bg-elevated px-2 py-1 rounded w-fit"
        >
          <Icon
            name="lucide:file-code"
            class="w-3 h-3"
          />
          {{ location }}
        </div>
      </div>
    </div>
  </div>
</template>

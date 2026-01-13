<script setup lang="ts">
import { FindingSeverity } from '~/types'
import type { Finding, FindingMetadata } from '~/types'

/**
 * FindingItem - Displays a single finding with severity and location
 */

interface Props {
  finding: Finding
}

const props = defineProps<Props>()

const severityConfig = computed(() => {
  const severity = props.finding.severity?.toString().toLowerCase()

  switch (severity) {
    case FindingSeverity.Critical:
    case 'critical':
      return {
        iconBg: 'bg-error-light',
        iconText: 'text-error',
        badgeVariant: 'error' as const,
        icon: 'lucide:alert-octagon',
        label: 'Critical',
      }
    case FindingSeverity.High:
    case 'high':
      return {
        iconBg: 'bg-error-light',
        iconText: 'text-error',
        badgeVariant: 'error' as const,
        icon: 'lucide:alert-triangle',
        label: 'High',
      }
    case FindingSeverity.Medium:
    case 'medium':
      return {
        iconBg: 'bg-warning-light',
        iconText: 'text-warning',
        badgeVariant: 'warning' as const,
        icon: 'lucide:alert-circle',
        label: 'Medium',
      }
    case FindingSeverity.Low:
    case 'low':
      return {
        iconBg: 'bg-bg-elevated',
        iconText: 'text-text-muted',
        badgeVariant: 'default' as const,
        icon: 'lucide:info',
        label: 'Low',
      }
    case FindingSeverity.Info:
    case 'info':
      return {
        iconBg: 'bg-bg-elevated',
        iconText: 'text-text-muted',
        badgeVariant: 'default' as const,
        icon: 'lucide:info',
        label: 'Info',
      }
    default:
      return {
        iconBg: 'bg-bg-elevated',
        iconText: 'text-text-muted',
        badgeVariant: 'default' as const,
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

const metadata = computed<FindingMetadata | null>(() => props.finding.metadata)

const currentCode = computed(() => {
  const code = metadata.value?.current_code
  if (typeof code !== 'string' || !code.trim()) return null
  return code
})

const suggestedCode = computed(() => {
  const code = metadata.value?.replacement_code
  if (typeof code !== 'string' || !code.trim()) return null
  return code
})

const suggestedCodeLabel = computed(() => {
  return 'Suggested Fix'
})

const explanation = computed(() => {
  const text = metadata.value?.explanation
  if (typeof text !== 'string' || !text.trim()) return null
  return text
})

const impact = computed(() => {
  const text = metadata.value?.impact
  if (typeof text !== 'string' || !text.trim()) return null
  return text
})

const language = computed(() => {
  if (!props.finding.file_path) return ''
  const ext = props.finding.file_path.split('.').pop()?.toLowerCase()
  if (!ext) return ''

  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    vue: 'vue',
    php: 'php',
    py: 'python',
    go: 'go',
    rb: 'ruby',
    java: 'java',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml',
    sh: 'bash',
  }

  return map[ext] ?? ''
})

function getReferenceUrl(ref: string): string | null {
  const trimmed = ref.trim()
  const cwe = /^CWE-(\d+)$/i.exec(trimmed)
  if (cwe?.[1]) return `https://cwe.mitre.org/data/definitions/${cwe[1]}.html`
  if (/^OWASP-/i.test(trimmed)) return 'https://owasp.org/Top10/'
  return null
}

const referenceLinks = computed(() => {
  const refs = metadata.value?.references
  if (!Array.isArray(refs)) return []

  return refs
    .map((ref) => ref.trim())
    .filter((ref) => ref.length > 0)
    .map((ref) => ({
      ref,
      url: getReferenceUrl(ref),
    }))
})
</script>

<template>
  <div class="p-4 bg-bg-surface border border-border-subtle rounded-lg hover:border-border-muted transition-default">
    <div class="flex items-start gap-3">
      <!-- Severity Icon -->
      <div 
        class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        :class="severityConfig.iconBg"
      >
        <Icon
          :name="severityConfig.icon"
          class="w-4 h-4"
          :class="severityConfig.iconText"
        />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <!-- Severity Badge -->
          <BaseBadge
            size="sm"
            :variant="severityConfig.badgeVariant"
          >
            {{ severityConfig.label }}
          </BaseBadge>

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

        <div
          v-if="impact"
          class="mt-3 pt-3 border-t border-border-subtle"
        >
          <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Impact
          </div>
          <p class="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {{ impact }}
          </p>
        </div>

        <div
          v-if="suggestedCode"
          class="mt-3 pt-3 border-t border-border-subtle space-y-3"
        >
          <BaseCodeBlock
            v-if="currentCode"
            :code="currentCode"
            label="Current Code"
            :language="language"
          />

          <BaseCodeBlock
            :code="suggestedCode"
            :label="suggestedCodeLabel"
            :language="language"
          />

          <div
            v-if="explanation"
            class="space-y-1"
          >
            <div class="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Why this fix
            </div>
            <p class="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {{ explanation }}
            </p>
          </div>
        </div>

        <div
          v-if="referenceLinks.length > 0"
          class="mt-3 pt-3 border-t border-border-subtle"
        >
          <div class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            References
          </div>
          <div class="flex flex-wrap gap-2">
            <component
              :is="reference.url ? 'a' : 'span'"
              v-for="reference in referenceLinks"
              :key="reference.ref"
              :href="reference.url || undefined"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center rounded-full bg-bg-elevated border border-border-subtle px-2 py-0.5 text-xs text-text-secondary transition-default hover:bg-bg-app focus-ring"
              :class="reference.url ? '' : 'cursor-default hover:bg-bg-elevated'"
            >
              {{ reference.ref }}
            </component>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

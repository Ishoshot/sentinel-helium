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
        iconBg: 'bg-gradient-to-br from-error/20 to-error/10 border border-error/30',
        iconText: 'text-error',
        badgeVariant: 'error' as const,
        icon: 'lucide:alert-octagon',
        label: 'Critical',
      }
    case FindingSeverity.High:
    case 'high':
      return {
        iconBg: 'bg-gradient-to-br from-error/15 to-error/5 border border-error/20',
        iconText: 'text-error',
        badgeVariant: 'error' as const,
        icon: 'lucide:alert-triangle',
        label: 'High',
      }
    case FindingSeverity.Medium:
    case 'medium':
      return {
        iconBg: 'bg-gradient-to-br from-warning/15 to-warning/5 border border-warning/20',
        iconText: 'text-warning',
        badgeVariant: 'warning' as const,
        icon: 'lucide:alert-circle',
        label: 'Medium',
      }
    case FindingSeverity.Low:
    case 'low':
      return {
        iconBg: 'bg-gradient-to-br from-bg-surface to-bg-elevated border border-border-subtle',
        iconText: 'text-text-muted',
        badgeVariant: 'default' as const,
        icon: 'lucide:info',
        label: 'Low',
      }
    case FindingSeverity.Info:
    case 'info':
      return {
        iconBg: 'bg-gradient-to-br from-bg-surface to-bg-elevated border border-border-subtle',
        iconText: 'text-text-muted',
        badgeVariant: 'default' as const,
        icon: 'lucide:info',
        label: 'Info',
      }
    default:
      return {
        iconBg: 'bg-gradient-to-br from-bg-surface to-bg-elevated border border-border-subtle',
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

function parseMarkdownLink(text: string): { text: string; url: string | null } {
  const trimmed = text.trim()

  // Parse markdown link: [text](url)
  const markdownLinkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(trimmed)
  if (markdownLinkMatch) {
    return {
      text: markdownLinkMatch[1]!,
      url: markdownLinkMatch[2]!,
    }
  }

  // Check for CWE pattern
  const cwe = /^CWE-(\d+)$/i.exec(trimmed)
  if (cwe?.[1]) {
    return {
      text: trimmed,
      url: `https://cwe.mitre.org/data/definitions/${cwe[1]}.html`,
    }
  }

  // Check for OWASP pattern
  if (/^OWASP-/i.test(trimmed)) {
    return {
      text: trimmed,
      url: 'https://owasp.org/Top10/',
    }
  }

  // Plain text without URL
  return {
    text: trimmed,
    url: null,
  }
}

const referenceLinks = computed(() => {
  const refs = metadata.value?.references
  if (!Array.isArray(refs)) return []

  return refs
    .map((ref) => parseMarkdownLink(ref))
    .filter((parsed) => parsed.text.length > 0)
})

// Collapsible state
const isExpanded = ref(true)
</script>

<template>
  <div class="bg-bg-elevated border border-border-subtle rounded-2xl hover:border-border-muted hover:shadow-md transition-all duration-200 overflow-hidden">
    <!-- Header - Always Visible -->
    <button
      class="w-full p-6 flex items-start gap-5 hover:bg-bg-surface/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-inset"
      @click="isExpanded = !isExpanded"
    >
      <!-- Severity Icon -->
      <div
        class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
        :class="severityConfig.iconBg"
      >
        <Icon
          :name="severityConfig.icon"
          class="w-6 h-6"
          :class="severityConfig.iconText"
        />
      </div>

      <div class="flex-1 min-w-0 text-left">
        <div class="flex items-center gap-3 mb-3 flex-wrap">
          <!-- Severity Badge -->
          <BaseBadge
            size="md"
            :variant="severityConfig.badgeVariant"
            class="font-semibold"
          >
            {{ severityConfig.label }}
          </BaseBadge>

          <!-- Category -->
          <span class="text-sm text-text-muted capitalize font-medium">
            {{ finding.category }}
          </span>

          <!-- Location Badge -->
          <div
            v-if="location"
            class="hidden sm:inline-flex items-center gap-2 text-xs text-text-muted font-mono bg-bg-surface px-2.5 py-1 rounded-lg border border-border-subtle"
          >
            <Icon
              name="lucide:file-code"
              class="w-3 h-3"
            />
            <span class="truncate max-w-[200px]">{{ location }}</span>
          </div>
        </div>

        <!-- Title -->
        <h4 class="text-lg font-bold text-text-primary mb-2 leading-snug pr-8">
          {{ finding.title }}
        </h4>

        <!-- Collapsed Preview -->
        <p
          v-if="!isExpanded"
          class="text-sm text-text-secondary line-clamp-2 leading-relaxed"
        >
          {{ finding.description }}
        </p>
      </div>

      <!-- Expand/Collapse Icon -->
      <div class="shrink-0 mt-1">
        <Icon
          name="lucide:chevron-down"
          class="w-5 h-5 text-text-muted transition-transform duration-300"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </button>

    <!-- Expanded Content -->
    <div
      v-show="isExpanded"
      class="px-6 pb-6"
    >
      <!-- Description -->
      <BaseMarkdown
        :content="finding.description"
        class="text-sm leading-relaxed mb-4"
      />

      <!-- Location (Mobile) -->
      <div
        v-if="location"
        class="sm:hidden inline-flex items-center gap-2 text-sm text-text-muted font-mono bg-bg-surface px-3 py-2 rounded-lg border border-border-subtle mb-4"
      >
        <Icon
          name="lucide:file-code"
          class="w-4 h-4"
        />
        {{ location }}
      </div>

      <div
        v-if="impact"
        class="mt-6 pt-6 border-t border-border-subtle"
      >
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <Icon
              name="lucide:zap"
              class="w-4 h-4 text-warning"
            />
          </div>
          <div class="text-sm font-bold text-text-primary uppercase tracking-wide">
            Impact
          </div>
        </div>
        <BaseMarkdown
          :content="impact"
          class="text-sm leading-relaxed pl-10"
        />
      </div>

      <div
        v-if="suggestedCode"
        class="mt-6 pt-6 border-t border-border-subtle space-y-5"
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
          class="space-y-3 p-5 rounded-xl bg-accent/5 border border-accent/20"
        >
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Icon
                name="lucide:lightbulb"
                class="w-4 h-4 text-accent"
              />
            </div>
            <div class="text-sm font-bold text-text-primary uppercase tracking-wide">
              Why this fix
            </div>
          </div>
          <BaseMarkdown
            :content="explanation"
            class="text-sm leading-relaxed pl-10"
          />
        </div>
      </div>

      <div
        v-if="referenceLinks.length > 0"
        class="mt-6 pt-6 border-t border-border-subtle"
      >
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center">
            <Icon
              name="lucide:link"
              class="w-4 h-4 text-text-muted"
            />
          </div>
          <div class="text-sm font-bold text-text-primary uppercase tracking-wide">
            References
          </div>
        </div>
        <div class="flex flex-wrap gap-2.5 pl-10">
          <component
            :is="reference.url ? 'a' : 'span'"
            v-for="(reference, idx) in referenceLinks"
            :key="`${reference.text}-${idx}`"
            :href="reference.url || undefined"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg bg-bg-surface border border-border-subtle px-3.5 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent/30"
            :class="reference.url ? 'text-accent hover:text-accent-hover hover:border-accent/30 hover:bg-accent/5 hover:shadow-sm cursor-pointer' : 'text-text-secondary cursor-default'"
          >
            {{ reference.text }}
            <Icon
              v-if="reference.url"
              name="lucide:external-link"
              class="w-3.5 h-3.5"
            />
          </component>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * BriefingInfoModal - Displays expanded information about a briefing
 * Shows full description, parameters schema, capabilities, and metadata
 */

import type { Briefing, BriefingSubscription } from '~/types/briefings'
import type { SchemaProperty } from '~/types/schema'

interface Props {
  briefing: Briefing
  subscription?: BriefingSubscription | null
  modelValue: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subscription: null,
})

defineEmits<{
  'update:modelValue': [value: boolean]
  'view': [briefing: Briefing]
  'subscribe': [briefing: Briefing]
}>()

// Icon mapping for briefing types
const iconMap: Record<string, string> = {
  standup: 'lucide:coffee',
  'standup-update': 'lucide:coffee',
  'weekly-team-summary': 'lucide:users',
  'delivery-velocity': 'lucide:rocket',
  'engineer-spotlight': 'lucide:star',
  'company-update': 'lucide:building-2',
  'sprint-retrospective': 'lucide:refresh-ccw',
  'code-health': 'lucide:heart-pulse',
  default: 'lucide:file-text',
}

const briefingIcon = computed((): string => {
  const icon = props.briefing.icon || iconMap[props.briefing.slug] || 'lucide:file-text'
  return icon
})

// Target audience display
const audienceDisplay = computed(() => {
  const roles = props.briefing.target_roles
  if (!roles || roles.length === 0) return 'Everyone'

  const roleLabels: Record<string, string> = {
    engineer: 'Engineers',
    lead: 'Leads',
    manager: 'Managers',
    executive: 'Executives',
    developer: 'Developers',
    engineering_manager: 'Engineering Managers',
    tech_lead: 'Tech Leads',
  }

  return roles
    .map((r) => roleLabels[r] || r.charAt(0).toUpperCase() + r.slice(1))
    .join(', ')
})

// Output format badges
const outputFormats = computed(() => {
  return props.briefing.output_formats || []
})

const outputFormatStyles: Record<string, string> = {
  markdown: 'border-indigo-400/25 bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-indigo-200',
  html: 'border-sky-400/25 bg-gradient-to-r from-sky-500/15 to-cyan-500/10 text-sky-200',
  slack: 'border-emerald-400/25 bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-200',
  email: 'border-amber-400/25 bg-gradient-to-r from-amber-500/15 to-orange-500/10 text-amber-200',
}

function getOutputFormatStyle(format: string): string {
  return outputFormatStyles[format.toLowerCase()] || 'border-border-subtle bg-gradient-to-r from-bg-surface to-bg-elevated text-text-secondary'
}

// Check if has parameters
const hasParameters = computed(() => {
  const schema = props.briefing.parameter_schema
  return schema && Object.keys(schema.properties || {}).length > 0
})

// Get parameter entries for display
const parameterEntries = computed(() => {
  const schema = props.briefing.parameter_schema
  if (!schema?.properties) return []

  return Object.entries(schema.properties).map(([key, property]) => ({
    key,
    property: property as SchemaProperty,
    required: schema.required?.includes(key) ?? false,
  }))
})

// Format property type for display
function formatPropertyType(property: SchemaProperty): string {
  if (property.format) {
    return `${property.type} (${property.format})`
  }
  if (property.enum) {
    return `${property.type} [${property.enum.slice(0, 3).join(', ')}${property.enum.length > 3 ? '...' : ''}]`
  }
  if (property.type === 'array' && property.items) {
    return `array of ${property.items.type}s`
  }
  return property.type
}

// Subscription status
const hasSubscription = computed(() => !!props.subscription?.is_active)
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    size="lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex min-w-0 items-center gap-4">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface">
          <Icon
            :name="briefingIcon"
            class="size-5 text-text-secondary"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-semibold tracking-tight text-text-primary">
            {{ briefing.title }}
          </h2>
          <p class="mt-0.5 truncate text-sm text-text-muted">
            For {{ audienceDisplay }}
          </p>
        </div>
      </div>
    </template>

    <div class="max-h-[65vh] space-y-5 overflow-y-auto pr-1 scrollbar-hidden">
      <section class="rounded-2xl border border-border-subtle bg-bg-surface px-4 py-3.5">
        <p class="text-sm text-text-secondary">
          Review what this briefing includes before opening the full generation flow.
        </p>
      </section>

      <div class="flex flex-wrap items-center gap-2">
        <!-- AI Badge -->
        <span
          v-if="briefing.requires_ai"
          class="inline-flex items-center gap-1.5 rounded-md border border-accent/35 bg-gradient-to-r from-accent/20 to-cyan-500/15 px-2.5 py-1 text-xs font-medium text-cyan-100 shadow-sm shadow-accent/10"
        >
          <Icon
            name="lucide:sparkles"
            class="size-3.5 text-accent"
          />
          AI-Powered
        </span>

        <!-- Schedulable badge -->
        <span
          v-if="briefing.is_schedulable"
          class="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/25 bg-gradient-to-r from-emerald-500/15 to-teal-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200 shadow-sm shadow-emerald-500/10"
        >
          <Icon
            name="lucide:calendar"
            class="size-3.5 text-emerald-300"
          />
          Schedulable
        </span>

        <!-- Subscription badge -->
        <span
          v-if="hasSubscription"
          class="inline-flex items-center gap-1.5 rounded-md border border-amber-400/30 bg-gradient-to-r from-amber-500/20 to-orange-500/10 px-2.5 py-1 text-xs font-medium text-amber-100 shadow-sm shadow-amber-500/10"
        >
          <Icon
            name="lucide:bell"
            class="size-3.5 text-amber-300"
          />
          Subscribed
        </span>

        <!-- Output formats -->
        <span
          v-for="format in outputFormats"
          :key="format"
          class="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium"
          :class="getOutputFormatStyle(format)"
        >
          {{ format.toUpperCase() }}
        </span>
      </div>

      <!-- Description -->
      <section class="rounded-2xl border border-border-subtle bg-bg-surface p-4">
        <h3 class="mb-2 text-sm font-semibold text-text-primary">
          About this briefing
        </h3>
        <p class="text-sm leading-relaxed text-text-secondary">
          {{ briefing.description }}
        </p>
      </section>

      <!-- Parameters section -->
      <section
        v-if="hasParameters"
        class="rounded-2xl border border-border-subtle bg-bg-elevated p-5"
      >
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-bg-surface text-text-muted">
            <Icon
              name="lucide:sliders-horizontal"
              class="size-4"
            />
          </div>
          <div class="flex-1 space-y-4">
            <div>
              <h3 class="text-sm font-semibold text-text-primary">
                Configuration Options
              </h3>
              <p class="mt-1 text-sm text-text-muted">
                Customize the inputs used when this briefing runs.
              </p>
            </div>
            <div class="space-y-2">
              <div
                v-for="{ key, property, required } in parameterEntries"
                :key="key"
                class="rounded-xl border border-border-subtle bg-bg-surface p-3.5"
              >
                <div class="flex items-start gap-3">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-bg-hover text-text-muted">
                    <Icon
                      :name="property.type === 'array' ? 'lucide:list' : property.type === 'boolean' ? 'lucide:toggle-left' : property.format === 'date' ? 'lucide:calendar' : 'lucide:type'"
                      class="size-4"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-sm font-medium text-text-primary">
                        {{ key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                      </span>
                      <span
                        v-if="required"
                        class="inline-flex items-center rounded-md border border-error/25 bg-error/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-error"
                      >
                        Required
                      </span>
                    </div>
                    <p
                      v-if="property.description"
                      class="mt-1 text-xs text-text-muted"
                    >
                      {{ property.description }}
                    </p>
                    <p class="mt-1.5 inline-flex items-center rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 font-mono text-[11px] text-text-muted">
                      {{ formatPropertyType(property) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- No parameters -->
      <section
        v-else
        class="rounded-2xl border border-border-subtle bg-bg-surface p-4"
      >
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-bg-elevated text-text-muted">
            <Icon
              name="lucide:zap"
              class="size-4"
            />
          </div>
          <div>
            <p class="text-sm font-semibold text-text-primary">
              No configuration needed
            </p>
            <p class="mt-1 text-sm text-text-muted">
              This briefing runs with optimized defaults and no extra setup.
            </p>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2 text-xs text-text-muted">
          <Icon
            :name="briefing.is_system ? 'lucide:shield-check' : 'lucide:user'"
            class="size-3.5"
          />
          <span>{{ briefing.is_system ? 'System template' : 'Custom template' }}</span>
        </div>
        <div class="flex w-full items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <BaseButton
            v-if="briefing.is_schedulable && !hasSubscription"
            class="flex-1 whitespace-nowrap sm:flex-none"
            variant="secondary"
            @click="$emit('subscribe', briefing)"
          >
            <Icon
              name="lucide:bell-plus"
              class="mr-2 size-4"
            />
            Subscribe
          </BaseButton>
          <BaseButton
            class="flex-1 whitespace-nowrap sm:flex-none"
            variant="primary"
            @click="$emit('view', briefing)"
          >
            <Icon
              name="lucide:arrow-right"
              class="mr-2 size-4"
            />
            View Briefing
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hidden::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>

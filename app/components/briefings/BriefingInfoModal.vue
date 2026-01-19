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
  'generate': [briefing: Briefing]
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
      <div class="flex items-center gap-4">
        <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-bg-surface border border-border-subtle">
          <Icon
            :name="briefingIcon"
            class="w-6 h-6 text-text-secondary"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-text-primary">
            {{ briefing.title }}
          </h2>
          <p class="text-sm text-text-muted">
            {{ audienceDisplay }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Badges row -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- AI Badge -->
        <span
          v-if="briefing.requires_ai"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg"
        >
          <Icon
            name="lucide:sparkles"
            class="w-3.5 h-3.5"
          />
          AI-Powered
        </span>

        <!-- Schedulable badge -->
        <span
          v-if="briefing.is_schedulable"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg"
        >
          <Icon
            name="lucide:calendar"
            class="w-3.5 h-3.5"
          />
          Schedulable
        </span>

        <!-- Subscription badge -->
        <span
          v-if="hasSubscription"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg"
        >
          <Icon
            name="lucide:bell"
            class="w-3.5 h-3.5"
          />
          Subscribed
        </span>

        <!-- Output formats -->
        <span
          v-for="format in outputFormats"
          :key="format"
          class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-text-secondary bg-bg-surface rounded-lg border border-border-subtle"
        >
          {{ format.toUpperCase() }}
        </span>
      </div>

      <!-- Description -->
      <div>
        <h3 class="text-sm font-medium text-text-primary mb-2">
          About this briefing
        </h3>
        <p class="text-sm text-text-secondary leading-relaxed">
          {{ briefing.description }}
        </p>
      </div>

      <!-- Parameters section -->
      <div v-if="hasParameters">
        <h3 class="text-sm font-medium text-text-primary mb-3">
          Configuration Options
        </h3>
        <div class="space-y-2">
          <div
            v-for="{ key, property, required } in parameterEntries"
            :key="key"
            class="flex items-start gap-3 p-3 rounded-lg bg-bg-surface border border-border-subtle"
          >
            <div class="shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-bg-elevated">
              <Icon
                :name="property.type === 'array' ? 'lucide:list' : property.type === 'boolean' ? 'lucide:toggle-left' : property.format === 'date' ? 'lucide:calendar' : 'lucide:type'"
                class="w-4 h-4 text-text-muted"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-text-primary">
                  {{ key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                </span>
                <span
                  v-if="required"
                  class="text-xs text-red-500"
                >
                  Required
                </span>
              </div>
              <p
                v-if="property.description"
                class="text-xs text-text-muted mt-0.5"
              >
                {{ property.description }}
              </p>
              <p class="text-xs text-text-muted/70 mt-1 font-mono">
                {{ formatPropertyType(property) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- No parameters -->
      <div
        v-else
        class="flex items-center gap-3 p-4 rounded-lg bg-bg-surface border border-border-subtle"
      >
        <div class="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-50">
          <Icon
            name="lucide:zap"
            class="w-5 h-5 text-emerald-600"
          />
        </div>
        <div>
          <p class="text-sm font-medium text-text-primary">
            No configuration needed
          </p>
          <p class="text-xs text-text-muted">
            This briefing generates with default settings automatically.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <div class="text-xs text-text-muted">
          <span v-if="briefing.is_system">System template</span>
          <span v-else>Custom template</span>
        </div>
        <div class="flex items-center gap-3">
          <BaseButton
            v-if="briefing.is_schedulable && !hasSubscription"
            variant="ghost"
            size="sm"
            @click="$emit('subscribe', briefing)"
          >
            <Icon
              name="lucide:bell-plus"
              class="w-4 h-4 mr-1.5"
            />
            Subscribe
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="$emit('generate', briefing)"
          >
            <Icon
              name="lucide:play"
              class="w-4 h-4 mr-2"
            />
            Generate Now
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

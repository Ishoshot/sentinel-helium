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

const colorMap: Record<string, { bg: string; icon: string; gradient: string }> = {
  standup: { bg: 'bg-amber-100', icon: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
  'standup-update': { bg: 'bg-amber-100', icon: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
  'weekly-team-summary': { bg: 'bg-blue-100', icon: 'text-blue-600', gradient: 'from-blue-500 to-indigo-500' },
  'delivery-velocity': { bg: 'bg-rose-100', icon: 'text-rose-600', gradient: 'from-rose-500 to-pink-500' },
  'engineer-spotlight': { bg: 'bg-violet-100', icon: 'text-violet-600', gradient: 'from-violet-500 to-purple-500' },
  'company-update': { bg: 'bg-emerald-100', icon: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-500' },
  'sprint-retrospective': { bg: 'bg-cyan-100', icon: 'text-cyan-600', gradient: 'from-cyan-500 to-blue-500' },
  'code-health': { bg: 'bg-pink-100', icon: 'text-pink-600', gradient: 'from-pink-500 to-rose-500' },
  default: { bg: 'bg-slate-100', icon: 'text-slate-600', gradient: 'from-slate-500 to-slate-600' },
}

const briefingIcon = computed((): string => {
  const icon = props.briefing.icon || iconMap[props.briefing.slug] || 'lucide:file-text'
  return icon
})

const briefingColors = computed(() => {
  return colorMap[props.briefing.slug] || colorMap.default
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
        <div
          class="flex size-14 items-center justify-center rounded-2xl ring-1"
          :class="[briefingColors.bg, `ring-${briefingColors.bg.replace('bg-', '').replace('-100', '-200')}`]"
        >
          <Icon
            :name="briefingIcon"
            class="size-7"
            :class="briefingColors.icon"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-xl font-semibold text-slate-900">
            {{ briefing.title }}
          </h2>
          <p class="mt-0.5 text-sm text-slate-500">
            For {{ audienceDisplay }}
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
          class="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100"
        >
          <Icon
            name="lucide:sparkles"
            class="size-3.5"
          />
          AI-Powered
        </span>

        <!-- Schedulable badge -->
        <span
          v-if="briefing.is_schedulable"
          class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100"
        >
          <Icon
            name="lucide:calendar"
            class="size-3.5"
          />
          Schedulable
        </span>

        <!-- Subscription badge -->
        <span
          v-if="hasSubscription"
          class="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-100"
        >
          <Icon
            name="lucide:bell"
            class="size-3.5"
          />
          Subscribed
        </span>

        <!-- Output formats -->
        <span
          v-for="format in outputFormats"
          :key="format"
          class="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
        >
          {{ format.toUpperCase() }}
        </span>
      </div>

      <!-- Description -->
      <div class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100">
        <h3 class="mb-2 text-sm font-semibold text-slate-900">
          About this briefing
        </h3>
        <p class="text-sm leading-relaxed text-slate-600">
          {{ briefing.description }}
        </p>
      </div>

      <!-- Parameters section -->
      <div v-if="hasParameters">
        <h3 class="mb-3 text-sm font-semibold text-slate-900">
          Configuration Options
        </h3>
        <div class="space-y-2">
          <div
            v-for="{ key, property, required } in parameterEntries"
            :key="key"
            class="flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200"
          >
            <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Icon
                :name="property.type === 'array' ? 'lucide:list' : property.type === 'boolean' ? 'lucide:toggle-left' : property.format === 'date' ? 'lucide:calendar' : 'lucide:type'"
                class="size-4 text-slate-500"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-slate-900">
                  {{ key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                </span>
                <span
                  v-if="required"
                  class="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600"
                >
                  Required
                </span>
              </div>
              <p
                v-if="property.description"
                class="mt-1 text-xs text-slate-500"
              >
                {{ property.description }}
              </p>
              <p class="mt-1.5 font-mono text-[11px] text-slate-400">
                {{ formatPropertyType(property) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- No parameters -->
      <div
        v-else
        class="flex items-center gap-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 ring-1 ring-emerald-100"
      >
        <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-emerald-200">
          <Icon
            name="lucide:zap"
            class="size-6 text-emerald-600"
          />
        </div>
        <div>
          <p class="font-medium text-slate-900">
            No configuration needed
          </p>
          <p class="mt-0.5 text-sm text-slate-600">
            This briefing generates with optimal settings automatically.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <Icon
            :name="briefing.is_system ? 'lucide:shield-check' : 'lucide:user'"
            class="size-3.5"
          />
          <span>{{ briefing.is_system ? 'System template' : 'Custom template' }}</span>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="briefing.is_schedulable && !hasSubscription"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
            @click="$emit('subscribe', briefing)"
          >
            <Icon
              name="lucide:bell-plus"
              class="size-4"
            />
            Subscribe
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
            @click="$emit('view', briefing)"
          >
            <Icon
              name="lucide:arrow-right"
              class="size-4"
            />
            View Briefing
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

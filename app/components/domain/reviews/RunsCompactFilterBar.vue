<script setup lang="ts">
import { RunStatus } from '~/types'

interface Props {
  search: string
  status: string | null
  risk: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string | null]
  'update:risk': [value: string | null]
}>()

// Search handler
const handleSearch = (value: string) => {
  emit('update:search', value)
}

// Status Options
const statusOptions = computed(() => [
  { 
    label: 'All Statuses', 
    action: () => emit('update:status', null),
    icon: !props.status ? 'lucide:check' : undefined
  },
  { separator: true, label: '' },
  { 
    label: 'Queued', 
    action: () => emit('update:status', RunStatus.Queued),
    icon: props.status === RunStatus.Queued ? 'lucide:check' : undefined
  },
  { 
    label: 'In Progress', 
    action: () => emit('update:status', RunStatus.InProgress),
    icon: props.status === RunStatus.InProgress ? 'lucide:check' : undefined
  },
  { 
    label: 'Completed', 
    action: () => emit('update:status', RunStatus.Completed),
    icon: props.status === RunStatus.Completed ? 'lucide:check' : undefined
  },
  { 
    label: 'Failed', 
    action: () => emit('update:status', RunStatus.Failed),
    icon: props.status === RunStatus.Failed ? 'lucide:check' : undefined
  }
])

// Risk Options
const riskOptions = computed(() => [
  { 
    label: 'All Risks', 
    action: () => emit('update:risk', null),
    icon: !props.risk ? 'lucide:check' : undefined
  },
  { separator: true, label: '' },
  { 
    label: 'Low', 
    action: () => emit('update:risk', 'low'),
    icon: props.risk === 'low' ? 'lucide:check' : undefined
  },
  { 
    label: 'Medium', 
    action: () => emit('update:risk', 'medium'),
    icon: props.risk === 'medium' ? 'lucide:check' : undefined
  },
  { 
    label: 'High', 
    action: () => emit('update:risk', 'high'),
    icon: props.risk === 'high' ? 'lucide:check' : undefined
  },
  { 
    label: 'Critical', 
    action: () => emit('update:risk', 'critical'),
    icon: props.risk === 'critical' ? 'lucide:check' : undefined
  }
])

const currentStatusLabel = computed(() => {
  if (!props.status) return 'Status'
  return props.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
})

const currentRiskLabel = computed(() => {
  if (!props.risk) return 'Risk'
  return props.risk.charAt(0).toUpperCase() + props.risk.slice(1)
})

const hasActiveFilters = computed(() => !!props.status || !!props.risk || !!props.search)

const clearFilters = () => {
  emit('update:search', '')
  emit('update:status', null)
  emit('update:risk', null)
}
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4">
    <!-- Search -->
    <div class="relative flex-1">
      <Icon
        name="lucide:search"
        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
      />
      <input
        :value="search"
        type="search"
        placeholder="Search runs..."
        class="w-full rounded-lg border border-border-subtle bg-bg-elevated py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-border-muted focus:outline-none focus:ring-0"
        @input="handleSearch(($event.target as HTMLInputElement).value)"
      >
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-2">
      <!-- Status Filter -->
      <BaseDropdown :items="statusOptions">
        <template #trigger>
          <BaseButton
            variant="secondary"
            class="w-full sm:w-auto justify-between"
            :class="{ 'bg-bg-elevated border-accent text-accent': status }"
          >
            <span class="flex items-center gap-2">
              <Icon
                name="lucide:activity"
                class="w-4 h-4 text-text-muted"
              />
              {{ currentStatusLabel }}
            </span>
            <Icon
              name="lucide:chevron-down"
              class="w-4 h-4 text-text-muted ml-2"
            />
          </BaseButton>
        </template>
      </BaseDropdown>

      <!-- Risk Filter -->
      <BaseDropdown :items="riskOptions">
        <template #trigger>
          <BaseButton
            variant="secondary"
            class="w-full sm:w-auto justify-between"
            :class="{ 'bg-bg-elevated border-accent text-accent': risk }"
          >
            <span class="flex items-center gap-2">
              <Icon
                name="lucide:shield-alert"
                class="w-4 h-4 text-text-muted"
              />
              {{ currentRiskLabel }}
            </span>
            <Icon
              name="lucide:chevron-down"
              class="w-4 h-4 text-text-muted ml-2"
            />
          </BaseButton>
        </template>
      </BaseDropdown>

      <!-- Clear Filters -->
      <button
        v-if="hasActiveFilters"
        class="text-sm text-text-muted hover:text-text-primary px-2 transition-colors"
        title="Clear filters"
        @click="clearFilters"
      >
        <Icon
          name="lucide:x"
          class="w-4 h-4"
        />
      </button>
    </div>
  </div>
</template>

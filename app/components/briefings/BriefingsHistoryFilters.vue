<script setup lang="ts">
import type { Briefing } from '~/types'

/**
 * Filters and search for briefings history list
 * Matches the styling pattern from code reviews filters
 */

interface Props {
  briefings: readonly Briefing[]
}

interface Filters {
  search: string
  status: string[]
  briefingId: number | null
  dateFrom: string
  dateTo: string
  sort: string
  direction: 'asc' | 'desc'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'filters-change': [filters: Filters]
}>()

// Filter state
const search = ref('')
const status = ref<string | null>(null) // Changed to single selection like reviews
const briefingId = ref<number | null>(null)
const dateRange = ref<{ from: string | null; to: string | null }>({ from: null, to: null })
const sortBy = ref<'created_at' | 'started_at' | 'completed_at'>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Status options (matching the backend enum)
const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

// Briefing filter options
const briefingOptions = computed(() => [
  { label: 'All Briefings', value: null },
  ...props.briefings.map(b => ({ label: b.title, value: b.id }))
])

// Sort options
const sortOptions = [
  { label: 'Newest First', value: 'created_at-desc' },
  { label: 'Oldest First', value: 'created_at-asc' },
  { label: 'Most Recent Start', value: 'started_at-desc' },
  { label: 'Most Recent Completion', value: 'completed_at-desc' },
]

const currentSort = computed({
  get: () => `${sortBy.value}-${sortOrder.value}`,
  set: (val) => {
    const [field, order] = val.split('-') as [typeof sortBy.value, typeof sortOrder.value]
    sortBy.value = field
    sortOrder.value = order
  }
})

// Date range display
const dateRangeDisplay = computed(() => {
  if (dateRange.value.from && dateRange.value.to) {
    return `${dateRange.value.from} - ${dateRange.value.to}`
  }
  if (dateRange.value.from) return `From ${dateRange.value.from}`
  if (dateRange.value.to) return `Until ${dateRange.value.to}`
  return null
})

// Active filters check
const hasActiveFilters = computed(() =>
  Boolean(
    search.value.trim() ||
      status.value ||
      briefingId.value ||
      dateRangeDisplay.value
  )
)

// Emit filters change
function emitFilters() {
  emit('filters-change', {
    search: search.value,
    status: status.value ? [status.value] : [], // Convert to array for backend
    briefingId: briefingId.value,
    dateFrom: dateRange.value.from || '',
    dateTo: dateRange.value.to || '',
    sort: sortBy.value,
    direction: sortOrder.value,
  })
}

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  emitFilters()
}, 500)

// Watch for changes
watch([search], () => {
  debouncedSearch()
})

watch([status, briefingId, dateRange, currentSort], () => {
  emitFilters()
}, { deep: true })

// Clear all filters
function clearFilters() {
  search.value = ''
  status.value = null
  briefingId.value = null
  dateRange.value = { from: null, to: null }
  sortBy.value = 'created_at'
  sortOrder.value = 'desc'
  emitFilters()
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search Bar - Full Width -->
    <div class="relative">
      <Icon
        name="lucide:search"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
      />
      <input
        v-model="search"
        type="search"
        placeholder="Search by briefing title..."
        class="w-full h-12 pl-12 pr-12 text-sm bg-bg-elevated border border-border-subtle rounded-xl placeholder:text-text-muted text-text-primary transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] hover:border-border-muted shadow-sm"
        @keydown.escape="search = ''"
      >
      <button
        v-if="search.trim()"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-bg-surface transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
        aria-label="Clear search"
        @click="search = ''"
      >
        <Icon
          name="lucide:x"
          class="w-4 h-4"
        />
      </button>
    </div>

    <!-- Filter Pills Row -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Status Filter -->
      <BaseDropdown
        v-model="status"
        :options="statusOptions"
        placeholder="Status"
        class="shrink-0"
        menu-width="w-48"
      >
        <template #trigger>
          <button
            type="button"
            class="h-10 px-4 flex items-center gap-2 bg-bg-elevated border rounded-xl text-sm font-medium transition-all hover:shadow-sm hover:border-border-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
            :class="status
              ? 'border-accent text-accent bg-accent/5'
              : 'border-border-subtle text-text-secondary'"
          >
            <Icon
              name="lucide:activity"
              class="w-4 h-4"
              :class="status ? 'text-accent' : 'text-text-muted'"
            />
            <span>{{ statusOptions.find(o => o.value === status)?.label || 'Status' }}</span>
            <Icon
              name="lucide:chevron-down"
              class="w-4 h-4 opacity-60"
            />
          </button>
        </template>
      </BaseDropdown>

      <!-- Briefing Type Filter -->
      <BaseDropdown
        v-if="briefings.length > 1"
        v-model="briefingId"
        :options="briefingOptions"
        placeholder="Briefing Type"
        class="shrink-0"
        menu-width="w-64"
      >
        <template #trigger>
          <button
            type="button"
            class="h-10 px-4 flex items-center gap-2 bg-bg-elevated border rounded-xl text-sm font-medium transition-all hover:shadow-sm hover:border-border-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] max-w-[180px]"
            :class="briefingId
              ? 'border-accent text-accent bg-accent/5'
              : 'border-border-subtle text-text-secondary'"
          >
            <Icon
              name="lucide:file-text"
              class="w-4 h-4 shrink-0"
              :class="briefingId ? 'text-accent' : 'text-text-muted'"
            />
            <span class="truncate">{{ briefingOptions.find(o => o.value === briefingId)?.label || 'Briefing' }}</span>
            <Icon
              name="lucide:chevron-down"
              class="w-4 h-4 opacity-60 shrink-0"
            />
          </button>
        </template>
      </BaseDropdown>

      <!-- Date Filter -->
      <BaseDropdown
        :model-value="null"
        :options="[]"
        placeholder="Date Range"
        class="shrink-0"
        menu-width="w-72"
      >
        <template #trigger>
          <button
            type="button"
            class="h-10 px-4 flex items-center gap-2 bg-bg-elevated border rounded-xl text-sm font-medium transition-all hover:shadow-sm hover:border-border-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
            :class="dateRangeDisplay
              ? 'border-accent text-accent bg-accent/5'
              : 'border-border-subtle text-text-secondary'"
          >
            <Icon
              name="lucide:calendar"
              class="w-4 h-4"
              :class="dateRangeDisplay ? 'text-accent' : 'text-text-muted'"
            />
            <span class="truncate max-w-[140px]">
              {{ dateRangeDisplay ?? 'Date Range' }}
            </span>
            <Icon
              name="lucide:chevron-down"
              class="w-4 h-4 opacity-60"
            />
          </button>
        </template>

        <div class="p-4 space-y-4 w-full">
          <div class="space-y-2">
            <label class="text-xs font-semibold text-text-secondary uppercase tracking-wide">From Date</label>
            <input
              :value="dateRange.from"
              type="date"
              class="w-full h-10 px-3 text-sm bg-bg-surface border border-border-subtle rounded-lg transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
              @input="dateRange = { ...dateRange, from: ($event.target as HTMLInputElement).value }"
            >
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold text-text-secondary uppercase tracking-wide">To Date</label>
            <input
              :value="dateRange.to"
              type="date"
              class="w-full h-10 px-3 text-sm bg-bg-surface border border-border-subtle rounded-lg transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
              :min="dateRange.from || undefined"
              @input="dateRange = { ...dateRange, to: ($event.target as HTMLInputElement).value }"
            >
          </div>
          <div class="pt-3 border-t border-border-subtle flex justify-end">
            <button
              type="button"
              class="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
              @click="dateRange = { from: null, to: null }"
            >
              Clear
            </button>
          </div>
        </div>
      </BaseDropdown>

      <div class="flex-1 min-w-[120px]" />

      <!-- Sort -->
      <BaseDropdown
        v-model="currentSort"
        :options="sortOptions"
        class="shrink-0"
        menu-width="w-56"
      >
        <template #trigger>
          <button
            type="button"
            class="h-10 px-4 flex items-center gap-2 bg-bg-elevated border border-border-subtle rounded-xl text-sm font-medium text-text-secondary transition-all hover:shadow-sm hover:text-text-primary hover:border-border-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
          >
            <Icon
              name="lucide:arrow-up-down"
              class="w-4 h-4"
            />
            <span class="hidden sm:inline">{{ sortOptions.find(o => o.value === currentSort)?.label }}</span>
            <span class="sm:hidden">Sort</span>
          </button>
        </template>
      </BaseDropdown>

      <!-- Clear all filters button -->
      <button
        v-if="hasActiveFilters"
        type="button"
        class="h-10 px-4 flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] rounded-xl"
        @click="clearFilters"
      >
        <Icon
          name="lucide:x-circle"
          class="w-4 h-4"
        />
        <span class="hidden sm:inline">Clear all</span>
      </button>
    </div>

    <!-- Active Filters - Compact Chip Display -->
    <div
      v-if="hasActiveFilters"
      class="flex flex-wrap items-center gap-2 pt-2"
    >
      <span class="text-xs font-semibold text-text-muted uppercase tracking-wide">Filtering:</span>

      <button
        v-if="search.trim()"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-subtle text-xs font-medium text-text-secondary hover:bg-bg-surface hover:border-border-muted transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] group"
        @click="search = ''"
      >
        <span class="text-text-primary">{{ search.trim() }}</span>
        <Icon
          name="lucide:x"
          class="w-3 h-3 text-text-muted group-hover:text-text-secondary"
        />
      </button>

      <button
        v-if="status"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-medium text-accent hover:bg-accent/15 transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] group"
        @click="status = null"
      >
        <span>{{ statusOptions.find(o => o.value === status)?.label }}</span>
        <Icon
          name="lucide:x"
          class="w-3 h-3 opacity-60 group-hover:opacity-100"
        />
      </button>

      <button
        v-if="briefingId"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-medium text-accent hover:bg-accent/15 transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] group max-w-[200px]"
        @click="briefingId = null"
      >
        <span class="truncate">{{ briefingOptions.find(o => o.value === briefingId)?.label }}</span>
        <Icon
          name="lucide:x"
          class="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0"
        />
      </button>

      <button
        v-if="dateRangeDisplay"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-medium text-accent hover:bg-accent/15 transition-all focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] group"
        @click="dateRange = { from: null, to: null }"
      >
        <Icon
          name="lucide:calendar"
          class="w-3 h-3"
        />
        <span>{{ dateRangeDisplay }}</span>
        <Icon
          name="lucide:x"
          class="w-3 h-3 opacity-60 group-hover:opacity-100"
        />
      </button>
    </div>
  </div>
</template>

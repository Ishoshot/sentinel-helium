<script setup lang="ts">
import type { Repository } from '~/types'

interface Props {
  search: string
  statusFilter: string | null
  riskFilter: string | null
  repositoryFilter: number | null
  authorFilter: string | null
  dateRange: { from: string | null; to: string | null }
  sortBy: 'created_at' | 'completed_at' | 'findings_count'
  sortOrder: 'asc' | 'desc'
  repositories: Repository[]
  isLoadingRepos?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoadingRepos: false,
})

const emit = defineEmits<{
  'update:search': [value: string]
  'update:statusFilter': [value: string | null]
  'update:riskFilter': [value: string | null]
  'update:repositoryFilter': [value: number | null]
  'update:authorFilter': [value: string | null]
  'update:dateRange': [value: { from: string | null; to: string | null }]
  'update:sortBy': [value: 'created_at' | 'completed_at' | 'findings_count']
  'update:sortOrder': [value: 'asc' | 'desc']
  clearFilters: []
}>()

// Computed wrappers for v-model behavior
const search = computed({
  get: () => props.search,
  set: (value) => emit('update:search', value),
})

const statusFilter = computed({
  get: () => props.statusFilter,
  set: (value) => emit('update:statusFilter', value),
})

const riskFilter = computed({
  get: () => props.riskFilter,
  set: (value) => emit('update:riskFilter', value),
})

const repositoryFilter = computed({
  get: () => props.repositoryFilter,
  set: (value) => emit('update:repositoryFilter', value),
})

const authorFilter = computed({
  get: () => props.authorFilter,
  set: (value) => emit('update:authorFilter', value),
})

const dateRange = computed({
  get: () => props.dateRange,
  set: (value) => emit('update:dateRange', value),
})

const sortBy = computed({
  get: () => props.sortBy,
  set: (value) => emit('update:sortBy', value),
})

const sortOrder = computed({
  get: () => props.sortOrder,
  set: (value) => emit('update:sortOrder', value),
})

// Computed
const dateRangeDisplay = computed(() => {
  if (props.dateRange.from && props.dateRange.to) {
    return `${props.dateRange.from} - ${props.dateRange.to}`
  }
  if (props.dateRange.from) return `From ${props.dateRange.from}`
  if (props.dateRange.to) return `Until ${props.dateRange.to}`
  return null
})

const hasActiveFilters = computed(() =>
  Boolean(
    props.search.trim() ||
      props.statusFilter ||
      props.riskFilter ||
      props.repositoryFilter ||
      props.authorFilter ||
      dateRangeDisplay.value
  )
)

// Options
const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Queued', value: 'queued' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Skipped', value: 'skipped' }
]

const riskOptions = [
  { label: 'All Risks', value: null },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
]

const repositoryOptions = computed(() => [
  { label: 'All Repositories', value: null },
  ...props.repositories.map(r => ({ label: r.full_name, value: r.id }))
])

const sortOptions = [
  { label: 'Newest First', value: 'created_at-desc' },
  { label: 'Oldest First', value: 'created_at-asc' },
  { label: 'Most Findings', value: 'findings_count-desc' },
  { label: 'Least Findings', value: 'findings_count-asc' },
]

const currentSort = computed({
  get: () => `${props.sortBy}-${props.sortOrder}`,
  set: (val) => {
    const [field, order] = val.split('-') as [typeof props.sortBy, typeof props.sortOrder]
    emit('update:sortBy', field)
    emit('update:sortOrder', order)
  }
})

function parseIsoDate(value: string | null): Date | null {
  if (!value) {
    return null
  }

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return null
  }

  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

function formatIsoDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizePickerDate(value: Date | Date[] | null | undefined): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatIsoDate(value)
  }

  return null
}

const dateFromPickerValue = computed(() => parseIsoDate(props.dateRange.from))
const dateToPickerValue = computed(() => parseIsoDate(props.dateRange.to))

function handleFromDateChange(value: Date | Date[] | null | undefined): void {
  const nextFrom = normalizePickerDate(value)
  let nextTo = props.dateRange.to

  if (nextFrom && nextTo && nextTo < nextFrom) {
    nextTo = nextFrom
  }

  dateRange.value = { from: nextFrom, to: nextTo }
}

function handleToDateChange(value: Date | Date[] | null | undefined): void {
  const nextTo = normalizePickerDate(value)
  const currentFrom = props.dateRange.from

  if (currentFrom && nextTo && nextTo < currentFrom) {
    dateRange.value = { from: currentFrom, to: currentFrom }
    return
  }

  dateRange.value = { ...props.dateRange, to: nextTo }
}

const datePickerInputClass = 'h-11 w-full rounded-xl border border-border-subtle bg-bg-surface py-2 pl-9 pr-3 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-border-muted focus:outline-none focus:ring-0'

const datePickerPt = {
  panel: { class: 'mt-2 w-[19rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-border-subtle bg-bg-elevated p-3 shadow-elevated' },
  header: { class: 'mb-3 grid grid-cols-[2rem_1fr_2rem] items-center gap-1 px-0.5' },
  title: { class: 'flex items-center justify-center gap-1.5 text-sm font-semibold tracking-tight text-text-primary' },
  selectMonth: {
    class: 'inline-flex min-h-0 w-auto min-w-0 items-center rounded-md bg-transparent px-1.5 py-0.5 text-sm font-semibold tracking-tight text-text-primary transition-colors hover:bg-bg-hover/80 focus:outline-none focus-visible:ring-1 focus-visible:ring-border-muted'
  },
  selectYear: {
    class: 'ml-0 inline-flex min-h-0 w-auto min-w-0 items-center rounded-md bg-transparent px-1.5 py-0.5 text-sm font-semibold tracking-tight text-text-primary transition-colors hover:bg-bg-hover/80 focus:outline-none focus-visible:ring-1 focus-visible:ring-border-muted'
  },
  pcPrevButton: {
    root: { class: 'inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary' }
  },
  pcNextButton: {
    root: { class: 'inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary' }
  },
  decade: { class: 'text-sm font-semibold tracking-tight text-text-primary' },
  monthView: { class: 'grid grid-cols-4 gap-2 pt-1' },
  month: (options: { context?: { selected?: boolean; disabled?: boolean } }) => ({
    class: [
      'inline-flex h-10 items-center justify-center rounded-lg bg-transparent px-1 text-sm font-medium transition-colors',
      options.context?.selected
        ? 'bg-accent text-white shadow-sm shadow-accent/25'
        : 'text-text-secondary hover:bg-bg-hover/90 hover:text-text-primary',
      options.context?.disabled ? 'pointer-events-none cursor-not-allowed opacity-35' : ''
    ]
  }),
  yearView: { class: 'grid grid-cols-5 gap-2 pt-1' },
  year: (options: { context?: { selected?: boolean; disabled?: boolean } }) => ({
    class: [
      'inline-flex h-10 items-center justify-center rounded-lg bg-transparent px-1 text-sm font-medium tabular-nums transition-colors',
      options.context?.selected
        ? 'bg-accent text-white shadow-sm shadow-accent/25'
        : 'text-text-secondary hover:bg-bg-hover/90 hover:text-text-primary',
      options.context?.disabled ? 'pointer-events-none cursor-not-allowed opacity-35' : ''
    ]
  }),
  tableHeaderCell: { class: 'pb-1.5 text-xs font-medium tracking-wide text-text-muted' },
  dayCell: { class: 'p-0.5' },
  day: (options: { context?: { selected?: boolean; disabled?: boolean; today?: boolean } }) => ({
    class: [
      'inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
      options.context?.selected
        ? 'bg-accent text-white shadow-sm shadow-accent/25'
        : 'text-text-secondary hover:bg-bg-hover/90 hover:text-text-primary',
      options.context?.disabled ? 'cursor-not-allowed opacity-40' : '',
      options.context?.today && !options.context?.selected ? 'ring-1 ring-accent/40' : ''
    ]
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search Bar -->
    <div class="relative max-w-md">
      <Icon
        name="lucide:search"
        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
      />
      <input
        v-model="search"
        type="search"
        placeholder="Search by PR title, branch, or commit..."
        class="w-full rounded-lg border border-border-subtle bg-bg-elevated py-2 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-border-muted focus:outline-none focus:ring-0"
        @keydown.escape="search = ''"
      >
      <button
        v-if="props.search.trim()"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
        @click="search = ''"
      >
        <Icon
          name="lucide:x"
          class="size-4"
        />
      </button>
    </div>

    <!-- Filter Pills -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Status Filter -->
      <BaseDropdown
        v-model="statusFilter"
        :options="statusOptions"
        placeholder="Status"
      >
        <template #trigger>
          <button
            type="button"
            class="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors"
            :class="props.statusFilter
              ? 'border-accent bg-accent text-white'
              : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-muted'"
          >
            <Icon
              name="lucide:activity"
              class="size-4"
            />
            <span>{{ statusOptions.find(o => o.value === props.statusFilter)?.label || 'Status' }}</span>
            <Icon
              name="lucide:chevron-down"
              class="size-3.5 opacity-60"
            />
          </button>
        </template>
      </BaseDropdown>

      <!-- Risk Filter -->
      <BaseDropdown
        v-model="riskFilter"
        :options="riskOptions"
        placeholder="Risk Level"
      >
        <template #trigger>
          <button
            type="button"
            class="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors"
            :class="props.riskFilter
              ? 'border-amber-500 bg-amber-500/10 text-amber-400'
              : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-muted'"
          >
            <Icon
              name="lucide:shield-alert"
              class="size-4"
            />
            <span>{{ riskOptions.find(o => o.value === props.riskFilter)?.label || 'Risk' }}</span>
            <Icon
              name="lucide:chevron-down"
              class="size-3.5 opacity-60"
            />
          </button>
        </template>
      </BaseDropdown>

      <!-- Repository Filter -->
      <BaseDropdown
        v-model="repositoryFilter"
        :options="repositoryOptions"
        placeholder="Repository"
        searchable
      >
        <template #trigger>
          <button
            type="button"
            class="flex h-9 max-w-[200px] items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors"
            :class="props.repositoryFilter
              ? 'border-accent bg-accent text-white'
              : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-muted'"
          >
            <Icon
              name="lucide:folder-git-2"
              class="size-4 shrink-0"
            />
            <span class="truncate">{{ repositoryOptions.find(o => o.value === props.repositoryFilter)?.label || 'Repository' }}</span>
            <Icon
              name="lucide:chevron-down"
              class="size-3.5 shrink-0 opacity-60"
            />
          </button>
        </template>
      </BaseDropdown>

      <!-- Author Filter -->
      <BaseDropdown
        :model-value="null"
        :options="[]"
        placeholder="Author"
        menu-width="w-64"
      >
        <template #trigger>
          <button
            type="button"
            class="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors"
            :class="props.authorFilter
              ? 'border-accent bg-accent text-white'
              : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-muted'"
          >
            <Icon
              name="lucide:user"
              class="size-4"
            />
            <span class="max-w-[100px] truncate">{{ props.authorFilter?.trim() || 'Author' }}</span>
            <Icon
              name="lucide:chevron-down"
              class="size-3.5 opacity-60"
            />
          </button>
        </template>

        <div class="w-full space-y-3 p-3">
          <label class="text-xs font-medium uppercase tracking-wide text-text-muted">Filter by Author</label>
          <div class="relative">
            <Icon
              name="lucide:user"
              class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            />
            <input
              :value="props.authorFilter"
              type="text"
              placeholder="GitHub username"
              class="w-full rounded-lg border border-border-subtle bg-bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-border-muted focus:outline-none focus:ring-0"
              @input="authorFilter = ($event.target as HTMLInputElement).value"
              @keydown.enter="($event.target as HTMLInputElement).blur()"
            >
          </div>
          <div class="flex justify-end border-t border-border-subtle pt-3">
            <button
              type="button"
              class="text-sm font-medium text-text-secondary hover:text-text-primary"
              @click="authorFilter = null"
            >
              Clear
            </button>
          </div>
        </div>
      </BaseDropdown>

      <!-- Date Filter -->
      <BaseDropdown
        :model-value="null"
        :options="[]"
        placeholder="Date Range"
        menu-width="w-72"
        overflow-visible
      >
        <template #trigger>
          <button
            type="button"
            class="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors"
            :class="dateRangeDisplay
              ? 'border-accent bg-accent text-white'
              : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-muted'"
          >
            <Icon
              name="lucide:calendar"
              class="size-4"
            />
            <span class="max-w-[140px] truncate">
              {{ dateRangeDisplay ?? 'Date Range' }}
            </span>
            <Icon
              name="lucide:chevron-down"
              class="size-3.5 opacity-60"
            />
          </button>
        </template>

        <div class="w-full space-y-4 p-3">
          <div class="space-y-2">
            <label class="text-xs font-medium uppercase tracking-wide text-text-muted">From</label>
            <div class="relative">
              <Icon
                name="lucide:calendar"
                class="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-text-muted"
              />
              <DatePicker
                class="w-full"
                :model-value="dateFromPickerValue"
                date-format="yy-mm-dd"
                :manual-input="false"
                append-to="self"
                placeholder="From date"
                :input-class="datePickerInputClass"
                :pt="datePickerPt"
                @update:model-value="handleFromDateChange"
              />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-medium uppercase tracking-wide text-text-muted">To</label>
            <div class="relative">
              <Icon
                name="lucide:calendar"
                class="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-text-muted"
              />
              <DatePicker
                class="w-full"
                :model-value="dateToPickerValue"
                date-format="yy-mm-dd"
                :manual-input="false"
                append-to="self"
                placeholder="To date"
                :input-class="datePickerInputClass"
                :pt="datePickerPt"
                :min-date="dateFromPickerValue || undefined"
                @update:model-value="handleToDateChange"
              />
            </div>
          </div>
          <div class="flex justify-end border-t border-border-subtle pt-3">
            <button
              type="button"
              class="text-sm font-medium text-text-secondary hover:text-text-primary"
              @click="dateRange = { from: null, to: null }"
            >
              Clear
            </button>
          </div>
        </div>
      </BaseDropdown>

      <div class="flex-1" />

      <!-- Sort -->
      <BaseDropdown
        v-model="currentSort"
        :options="sortOptions"
      >
        <template #trigger>
          <button
            type="button"
            class="flex h-9 items-center gap-2 rounded-lg border border-border-subtle bg-bg-elevated px-3 text-sm font-medium text-text-secondary transition-colors hover:border-border-muted"
          >
            <Icon
              name="lucide:arrow-up-down"
              class="size-4"
            />
            <span class="hidden sm:inline">{{ sortOptions.find(o => o.value === currentSort)?.label }}</span>
            <span class="sm:hidden">Sort</span>
          </button>
        </template>
      </BaseDropdown>

      <!-- Clear all -->
      <button
        v-if="hasActiveFilters"
        type="button"
        class="flex h-9 items-center gap-1.5 px-2 text-sm font-medium text-text-muted hover:text-text-secondary"
        @click="emit('clearFilters')"
      >
        <Icon
          name="lucide:x-circle"
          class="size-4"
        />
        <span class="hidden sm:inline">Clear all</span>
      </button>
    </div>

    <!-- Active Filters Display -->
    <div
      v-if="hasActiveFilters"
      class="flex flex-wrap items-center gap-2"
    >
      <span class="text-xs font-medium uppercase tracking-wide text-text-muted">Active:</span>

      <button
        v-if="props.search.trim()"
        type="button"
        class="group inline-flex items-center gap-1.5 rounded-md bg-bg-surface px-2 py-1 text-xs font-medium text-text-secondary"
        @click="search = ''"
      >
        "{{ props.search.trim() }}"
        <Icon
          name="lucide:x"
          class="size-3 text-text-muted group-hover:text-text-secondary"
        />
      </button>

      <button
        v-if="props.statusFilter"
        type="button"
        class="group inline-flex items-center gap-1.5 rounded-md bg-bg-surface px-2 py-1 text-xs font-medium text-text-secondary"
        @click="statusFilter = null"
      >
        {{ statusOptions.find(o => o.value === props.statusFilter)?.label }}
        <Icon
          name="lucide:x"
          class="size-3 text-text-muted group-hover:text-text-secondary"
        />
      </button>

      <button
        v-if="props.riskFilter"
        type="button"
        class="group inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400"
        @click="riskFilter = null"
      >
        {{ riskOptions.find(o => o.value === props.riskFilter)?.label }}
        <Icon
          name="lucide:x"
          class="size-3 text-amber-500 group-hover:text-amber-400"
        />
      </button>

      <button
        v-if="props.repositoryFilter"
        type="button"
        class="group inline-flex max-w-[200px] items-center gap-1.5 rounded-md bg-bg-surface px-2 py-1 text-xs font-medium text-text-secondary"
        @click="repositoryFilter = null"
      >
        <span class="truncate">{{ repositoryOptions.find(o => o.value === props.repositoryFilter)?.label }}</span>
        <Icon
          name="lucide:x"
          class="size-3 shrink-0 text-text-muted group-hover:text-text-secondary"
        />
      </button>

      <button
        v-if="props.authorFilter?.trim()"
        type="button"
        class="group inline-flex items-center gap-1.5 rounded-md bg-bg-surface px-2 py-1 text-xs font-medium text-text-secondary"
        @click="authorFilter = null"
      >
        <Icon
          name="lucide:user"
          class="size-3"
        />
        {{ props.authorFilter?.trim() }}
        <Icon
          name="lucide:x"
          class="size-3 text-text-muted group-hover:text-text-secondary"
        />
      </button>

      <button
        v-if="dateRangeDisplay"
        type="button"
        class="group inline-flex items-center gap-1.5 rounded-md bg-bg-surface px-2 py-1 text-xs font-medium text-text-secondary"
        @click="dateRange = { from: null, to: null }"
      >
        <Icon
          name="lucide:calendar"
          class="size-3"
        />
        {{ dateRangeDisplay }}
        <Icon
          name="lucide:x"
          class="size-3 text-text-muted group-hover:text-text-secondary"
        />
      </button>
    </div>
  </div>
</template>

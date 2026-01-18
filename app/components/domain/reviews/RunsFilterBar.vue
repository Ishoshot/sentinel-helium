<script setup lang="ts">
import type { Repository } from '~/types';

interface Props {
  search: string;
  statusFilter: string | null;
  riskFilter: string | null;
  repositoryFilter: number | null;
  authorFilter: string | null;
  dateRange: { from: string | null; to: string | null };
  sortBy: 'created_at' | 'completed_at' | 'findings_count';
  sortOrder: 'asc' | 'desc';
  repositories: Repository[];
  isLoadingRepos?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoadingRepos: false,
});

const emit = defineEmits<{
  'update:search': [value: string];
  'update:statusFilter': [value: string | null];
  'update:riskFilter': [value: string | null];
  'update:repositoryFilter': [value: number | null];
  'update:authorFilter': [value: string | null];
  'update:dateRange': [value: { from: string | null; to: string | null }];
  'update:sortBy': [value: 'created_at' | 'completed_at' | 'findings_count'];
  'update:sortOrder': [value: 'asc' | 'desc'];
  clearFilters: [];
}>();

// Computed wrappers for v-model behavior
const search = computed({
  get: () => props.search,
  set: (value) => emit('update:search', value),
});

const statusFilter = computed({
  get: () => props.statusFilter,
  set: (value) => emit('update:statusFilter', value),
});

const riskFilter = computed({
  get: () => props.riskFilter,
  set: (value) => emit('update:riskFilter', value),
});

const repositoryFilter = computed({
  get: () => props.repositoryFilter,
  set: (value) => emit('update:repositoryFilter', value),
});

const authorFilter = computed({
  get: () => props.authorFilter,
  set: (value) => emit('update:authorFilter', value),
});

const dateRange = computed({
  get: () => props.dateRange,
  set: (value) => emit('update:dateRange', value),
});

const sortBy = computed({
  get: () => props.sortBy,
  set: (value) => emit('update:sortBy', value),
});

const sortOrder = computed({
  get: () => props.sortOrder,
  set: (value) => emit('update:sortOrder', value),
});

// Computed
const dateRangeDisplay = computed(() => {
  if (props.dateRange.from && props.dateRange.to) {
    return `${props.dateRange.from} - ${props.dateRange.to}`;
  }
  if (props.dateRange.from) return `From ${props.dateRange.from}`;
  if (props.dateRange.to) return `Until ${props.dateRange.to}`;
  return null;
});

const hasActiveFilters = computed(() =>
  Boolean(
    props.search.trim() ||
      props.statusFilter ||
      props.riskFilter ||
      props.repositoryFilter ||
      props.authorFilter ||
      dateRangeDisplay.value
  )
);

// Options
const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Queued', value: 'queued' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Skipped', value: 'skipped' }
];

const riskOptions = [
  { label: 'All Risks', value: null },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
];

const repositoryOptions = computed(() => [
  { label: 'All Repositories', value: null },
  ...props.repositories.map(r => ({ label: r.full_name, value: r.id }))
]);

const sortOptions = [
  { label: 'Newest First', value: 'created_at-desc' },
  { label: 'Oldest First', value: 'created_at-asc' },
  { label: 'Most Findings', value: 'findings_count-desc' },
  { label: 'Least Findings', value: 'findings_count-asc' },
];

const currentSort = computed({
  get: () => `${props.sortBy}-${props.sortOrder}`,
  set: (val) => {
    const [field, order] = val.split('-') as [typeof props.sortBy, typeof props.sortOrder];
    emit('update:sortBy', field);
    emit('update:sortOrder', order);
  }
});
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
        placeholder="Search by PR title, branch, or commit..."
        class="w-full h-12 pl-12 pr-12 text-sm bg-bg-elevated border border-border-subtle rounded-xl placeholder:text-text-muted text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent hover:border-border-muted shadow-sm"
        @keydown.escape="search = ''"
      >
      <button
        v-if="props.search.trim()"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-bg-surface transition-all focus:outline-none focus:ring-2 focus:ring-accent"
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
        v-model="statusFilter"
        :options="statusOptions"
        placeholder="Status"
        class="shrink-0"
      >
        <template #trigger>
          <button
            type="button"
            class="h-10 px-4 flex items-center gap-2 bg-bg-elevated border rounded-xl text-sm font-medium transition-all hover:shadow-sm hover:border-border-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
            :class="props.statusFilter
              ? 'border-accent text-accent bg-accent/5'
              : 'border-border-subtle text-text-secondary'"
          >
            <Icon
              name="lucide:activity"
              class="w-4 h-4"
              :class="props.statusFilter ? 'text-accent' : 'text-text-muted'"
            />
            <span>{{ statusOptions.find(o => o.value === props.statusFilter)?.label || 'Status' }}</span>
            <Icon
              name="lucide:chevron-down"
              class="w-4 h-4 opacity-60"
            />
          </button>
        </template>
      </BaseDropdown>

      <!-- Risk Filter -->
      <BaseDropdown
        v-model="riskFilter"
        :options="riskOptions"
        placeholder="Risk Level"
        class="shrink-0"
      >
        <template #trigger>
          <button
            type="button"
            class="h-10 px-4 flex items-center gap-2 bg-bg-elevated border rounded-xl text-sm font-medium transition-all hover:shadow-sm hover:border-border-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
            :class="props.riskFilter
              ? 'border-warning text-warning bg-warning/5'
              : 'border-border-subtle text-text-secondary'"
          >
            <Icon
              name="lucide:shield-alert"
              class="w-4 h-4"
              :class="props.riskFilter ? 'text-warning' : 'text-text-muted'"
            />
            <span>{{ riskOptions.find(o => o.value === props.riskFilter)?.label || 'Risk' }}</span>
            <Icon
              name="lucide:chevron-down"
              class="w-4 h-4 opacity-60"
            />
          </button>
        </template>
      </BaseDropdown>

      <!-- Repository Filter -->
      <BaseDropdown
        v-model="repositoryFilter"
        :options="repositoryOptions"
        placeholder="Repository"
        class="shrink-0"
        searchable
      >
        <template #trigger>
          <button
            type="button"
            class="h-10 px-4 flex items-center gap-2 bg-bg-elevated border rounded-xl text-sm font-medium transition-all hover:shadow-sm hover:border-border-muted focus:outline-none focus:ring-2 focus:ring-accent/30 max-w-[200px]"
            :class="props.repositoryFilter
              ? 'border-accent text-accent bg-accent/5'
              : 'border-border-subtle text-text-secondary'"
          >
            <Icon
              name="lucide:folder-git-2"
              class="w-4 h-4 shrink-0"
              :class="props.repositoryFilter ? 'text-accent' : 'text-text-muted'"
            />
            <span class="truncate">{{ repositoryOptions.find(o => o.value === props.repositoryFilter)?.label || 'Repository' }}</span>
            <Icon
              name="lucide:chevron-down"
              class="w-4 h-4 opacity-60 shrink-0"
            />
          </button>
        </template>
      </BaseDropdown>

      <!-- Author Filter -->
      <BaseDropdown
        :model-value="null"
        :options="[]"
        placeholder="Author"
        class="shrink-0"
        menu-width="w-64"
      >
        <template #trigger>
          <button
            type="button"
            class="h-10 px-4 flex items-center gap-2 bg-bg-elevated border rounded-xl text-sm font-medium transition-all hover:shadow-sm hover:border-border-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
            :class="props.authorFilter
              ? 'border-accent text-accent bg-accent/5'
              : 'border-border-subtle text-text-secondary'"
          >
            <Icon
              name="lucide:user"
              class="w-4 h-4"
              :class="props.authorFilter ? 'text-accent' : 'text-text-muted'"
            />
            <span class="truncate max-w-[100px]">{{ props.authorFilter?.trim() || 'Author' }}</span>
            <Icon
              name="lucide:chevron-down"
              class="w-4 h-4 opacity-60"
            />
          </button>
        </template>

        <div class="p-4 w-full">
          <div class="space-y-3">
            <label class="text-xs font-semibold text-text-secondary uppercase tracking-wide">Filter by Author</label>
            <input
              :value="props.authorFilter"
              type="text"
              placeholder="Enter GitHub username"
              class="w-full h-10 px-3 text-sm bg-bg-surface border border-border-subtle rounded-lg placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              @input="authorFilter = ($event.target as HTMLInputElement).value"
              @keydown.enter="($event.target as HTMLInputElement).blur()"
            >
            <p class="text-xs text-text-muted">
              Press Enter to apply filter
            </p>
          </div>
          <div class="pt-3 mt-3 border-t border-border-subtle flex justify-end">
            <button
              type="button"
              class="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
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
        class="shrink-0"
        menu-width="w-72"
      >
        <template #trigger>
          <button
            type="button"
            class="h-10 px-4 flex items-center gap-2 bg-bg-elevated border rounded-xl text-sm font-medium transition-all hover:shadow-sm hover:border-border-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
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
              :value="props.dateRange.from"
              type="date"
              class="w-full h-10 px-3 text-sm bg-bg-surface border border-border-subtle rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              @input="dateRange = { ...props.dateRange, from: ($event.target as HTMLInputElement).value }"
            >
          </div>
          <div class="space-y-2">
            <label class="text-xs font-semibold text-text-secondary uppercase tracking-wide">To Date</label>
            <input
              :value="props.dateRange.to"
              type="date"
              class="w-full h-10 px-3 text-sm bg-bg-surface border border-border-subtle rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              :min="props.dateRange.from || undefined"
              @input="dateRange = { ...props.dateRange, to: ($event.target as HTMLInputElement).value }"
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
      >
        <template #trigger>
          <button
            type="button"
            class="h-10 px-4 flex items-center gap-2 bg-bg-elevated border border-border-subtle rounded-xl text-sm font-medium text-text-secondary transition-all hover:shadow-sm hover:text-text-primary hover:border-border-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
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
        class="h-10 px-4 flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 rounded-xl"
        @click="emit('clearFilters')"
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
        v-if="props.search.trim()"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-subtle text-xs font-medium text-text-secondary hover:bg-bg-surface hover:border-border-muted transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 group"
        @click="search = ''"
      >
        <span class="text-text-primary">{{ props.search.trim() }}</span>
        <Icon
          name="lucide:x"
          class="w-3 h-3 text-text-muted group-hover:text-text-secondary"
        />
      </button>

      <button
        v-if="props.statusFilter"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-medium text-accent hover:bg-accent/15 transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 group"
        @click="statusFilter = null"
      >
        <span>{{ statusOptions.find(o => o.value === props.statusFilter)?.label }}</span>
        <Icon
          name="lucide:x"
          class="w-3 h-3 opacity-60 group-hover:opacity-100"
        />
      </button>

      <button
        v-if="props.riskFilter"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warning/10 border border-warning/20 text-xs font-medium text-warning hover:bg-warning/15 transition-all focus:outline-none focus:ring-2 focus:ring-warning/30 group"
        @click="riskFilter = null"
      >
        <span>{{ riskOptions.find(o => o.value === props.riskFilter)?.label }}</span>
        <Icon
          name="lucide:x"
          class="w-3 h-3 opacity-60 group-hover:opacity-100"
        />
      </button>

      <button
        v-if="props.repositoryFilter"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-medium text-accent hover:bg-accent/15 transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 group max-w-[200px]"
        @click="repositoryFilter = null"
      >
        <span class="truncate">{{ repositoryOptions.find(o => o.value === props.repositoryFilter)?.label ?? props.repositories.find(r => r.id === props.repositoryFilter)?.full_name ?? props.repositories.find(r => r.id === props.repositoryFilter)?.name }}</span>
        <Icon
          name="lucide:x"
          class="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0"
        />
      </button>

      <button
        v-if="props.authorFilter?.trim()"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-medium text-accent hover:bg-accent/15 transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 group"
        @click="authorFilter = null"
      >
        <Icon
          name="lucide:user"
          class="w-3 h-3"
        />
        <span>{{ props.authorFilter?.trim() }}</span>
        <Icon
          name="lucide:x"
          class="w-3 h-3 opacity-60 group-hover:opacity-100"
        />
      </button>

      <button
        v-if="dateRangeDisplay"
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-medium text-accent hover:bg-accent/15 transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 group"
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

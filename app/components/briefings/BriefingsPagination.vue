<script setup lang="ts">
/**
 * Pagination controls for briefings list
 */

interface Props {
  currentPage: number
  lastPage: number
  total: number
  from: number | null
  to: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'page-change': [page: number]
}>()

// Safe display values
const displayFrom = computed(() => props.from ?? 1)
const displayTo = computed(() => props.to ?? props.total)

// Calculate visible page numbers (show max 7 pages)
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.lastPage
  const current = props.currentPage

  if (total <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (current > 3) {
      pages.push('...')
    }

    // Show pages around current
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }

    if (current < total - 2) {
      pages.push('...')
    }

    // Always show last page
    pages.push(total)
  }

  return pages
})

function goToPage(page: number) {
  if (page === props.currentPage) return
  if (page < 1 || page > props.lastPage) return
  emit('page-change', page)
}
</script>

<template>
  <div class="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
    <!-- Results Info -->
    <div class="text-sm text-slate-500">
      Showing <span class="font-medium text-slate-900">{{ displayFrom }}</span> to
      <span class="font-medium text-slate-900">{{ displayTo }}</span> of
      <span class="font-medium text-slate-900">{{ total }}</span> results
    </div>

    <!-- Page Controls -->
    <div
      v-if="lastPage > 1"
      class="flex items-center gap-1"
    >
      <!-- Previous Button -->
      <button
        type="button"
        :disabled="currentPage === 1"
        class="flex size-9 items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-40"
        :class="
          currentPage === 1
            ? 'text-slate-300'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        "
        @click="goToPage(currentPage - 1)"
      >
        <Icon
          name="lucide:chevron-left"
          class="size-5"
        />
      </button>

      <!-- Page Numbers -->
      <template
        v-for="(page, index) in visiblePages"
        :key="index"
      >
        <button
          v-if="typeof page === 'number'"
          type="button"
          class="flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-all"
          :class="
            page === currentPage
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          "
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span
          v-else
          class="flex size-9 items-center justify-center text-slate-400"
        >
          ...
        </span>
      </template>

      <!-- Next Button -->
      <button
        type="button"
        :disabled="currentPage === lastPage"
        class="flex size-9 items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-40"
        :class="
          currentPage === lastPage
            ? 'text-slate-300'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        "
        @click="goToPage(currentPage + 1)"
      >
        <Icon
          name="lucide:chevron-right"
          class="size-5"
        />
      </button>
    </div>
  </div>
</template>

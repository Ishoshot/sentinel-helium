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
  <div class="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-bg-elevated p-4">
    <!-- Results Info -->
    <div class="text-sm text-text-muted">
      Showing <span class="font-medium text-text-primary">{{ displayFrom }}</span> to
      <span class="font-medium text-text-primary">{{ displayTo }}</span> of
      <span class="font-medium text-text-primary">{{ total }}</span> results
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
            ? 'text-text-muted'
            : 'text-text-muted hover:bg-bg-hover hover:text-text-secondary'
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
              ? 'bg-gradient-to-r from-accent to-teal-600 text-white'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
          "
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span
          v-else
          class="flex size-9 items-center justify-center text-text-muted"
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
            ? 'text-text-muted'
            : 'text-text-muted hover:bg-bg-hover hover:text-text-secondary'
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

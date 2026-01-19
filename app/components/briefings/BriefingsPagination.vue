<script setup lang="ts">
/**
 * Pagination controls for briefings list
 */

interface Props {
  currentPage: number
  lastPage: number
  total: number
  from: number
  to: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'page-change': [page: number]
}>()

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
  <div class="flex items-center justify-between gap-4 pt-6 border-t border-border-subtle">
    <!-- Results Info -->
    <div class="text-sm text-text-muted">
      Showing <span class="font-medium text-text-primary">{{ from }}</span> to
      <span class="font-medium text-text-primary">{{ to }}</span> of
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
        class="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="
          currentPage === 1
            ? 'text-text-muted cursor-not-allowed'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
        "
        @click="goToPage(currentPage - 1)"
      >
        <Icon
          name="lucide:chevron-left"
          class="w-5 h-5"
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
          class="min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors"
          :class="
            page === currentPage
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
          "
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span
          v-else
          class="px-2 text-text-muted"
        >
          {{ page }}
        </span>
      </template>

      <!-- Next Button -->
      <button
        type="button"
        :disabled="currentPage === lastPage"
        class="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :class="
          currentPage === lastPage
            ? 'text-text-muted cursor-not-allowed'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
        "
        @click="goToPage(currentPage + 1)"
      >
        <Icon
          name="lucide:chevron-right"
          class="w-5 h-5"
        />
      </button>
    </div>
  </div>
</template>

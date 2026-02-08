<script setup lang="ts">
interface Props {
  currentPage: number
  lastPage: number
  from: number
  to: number
  total: number
  itemType?: string
}

const props = withDefaults(defineProps<Props>(), {
  itemType: 'reviews',
})

const emit = defineEmits<{
  loadPage: [page: number]
}>()

const canGoPrevious = computed(() => props.currentPage > 1)
const canGoNext = computed(() => props.currentPage < props.lastPage)

/**
 * Generate page numbers with ellipsis for large page counts
 * Shows: first page, current ± 1, last page, with ellipsis where needed
 */
const visiblePages = computed(() => {
  const pages: (number | 'ellipsis')[] = []
  const current = props.currentPage
  const last = props.lastPage

  if (last <= 7) {
    for (let i = 1; i <= last; i++) {
      pages.push(i)
    }
    return pages
  }

  pages.push(1)

  if (current > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < last - 2) {
    pages.push('ellipsis')
  }

  pages.push(last)

  return pages
})
</script>

<template>
  <div
    v-if="lastPage > 1"
    class="flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-6 sm:flex-row"
  >
    <p class="text-sm text-text-muted">
      Showing <span class="font-medium text-text-primary">{{ from }}</span> to <span class="font-medium text-text-primary">{{ to }}</span> of <span class="font-medium text-text-primary">{{ total }}</span> {{ itemType }}
    </p>

    <div class="flex items-center gap-1">
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-sm text-text-secondary hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canGoPrevious"
        @click="emit('loadPage', currentPage - 1)"
      >
        <Icon
          name="lucide:chevron-left"
          class="size-4"
        />
      </button>

      <template
        v-for="(page, index) in visiblePages"
        :key="index"
      >
        <span
          v-if="page === 'ellipsis'"
          class="px-1 text-text-muted"
        >
          ...
        </span>
        <button
          v-else
          type="button"
          class="inline-flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors"
          :class="page === currentPage
            ? 'border-accent bg-accent text-white'
            : 'border-border-subtle bg-bg-elevated text-text-secondary hover:bg-bg-hover'"
          @click="emit('loadPage', page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-sm text-text-secondary hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canGoNext"
        @click="emit('loadPage', currentPage + 1)"
      >
        <Icon
          name="lucide:chevron-right"
          class="size-4"
        />
      </button>
    </div>
  </div>
</template>

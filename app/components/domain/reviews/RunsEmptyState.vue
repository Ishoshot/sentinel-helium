<script setup lang="ts">
type EmptyStateType = 'no-data' | 'no-matches' | 'error'

interface Props {
  type: EmptyStateType
  viewMode?: 'all' | 'pr' | 'repository'
  errorMessage?: string
  workspaceSlug?: string
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'all',
})

const emit = defineEmits<{
  clearFilters: []
  retry: []
}>()

const config = computed(() => {
  switch (props.type) {
    case 'error':
      return {
        icon: 'lucide:alert-circle',
        iconClass: 'flex size-16 items-center justify-center rounded-2xl bg-red-50',
        iconColor: 'text-red-500',
        title: 'Failed to load reviews',
        description: props.errorMessage || 'An error occurred while loading the data.',
      }
    case 'no-matches':
      return {
        icon: 'lucide:search-x',
        iconClass: 'flex size-16 items-center justify-center rounded-2xl bg-gray-100',
        iconColor: 'text-gray-400',
        title: `No matching ${props.viewMode === 'all' ? 'reviews' : props.viewMode === 'pr' ? 'pull requests' : 'repositories'}`,
        description: "Try adjusting your search or filters to find what you're looking for.",
      }
    case 'no-data':
    default:
      return {
        icon: 'lucide:git-pull-request',
        iconClass: 'flex size-16 items-center justify-center rounded-2xl bg-gray-100',
        iconColor: 'text-gray-400',
        title: 'No reviews yet',
        description: 'Code reviews will appear here when pull requests are opened in your connected repositories.',
      }
  }
})
</script>

<template>
  <div class="py-16 text-center">
    <div
      class="mx-auto mb-6"
      :class="config.iconClass"
    >
      <Icon
        :name="config.icon"
        class="size-8"
        :class="config.iconColor"
      />
    </div>

    <h3 class="text-lg font-semibold text-gray-900">
      {{ config.title }}
    </h3>

    <p class="mx-auto mt-2 max-w-sm text-sm text-gray-500">
      {{ config.description }}
    </p>

    <!-- Actions -->
    <div class="mt-6">
      <NuxtLink
        v-if="type === 'no-data' && workspaceSlug"
        :to="`/${workspaceSlug}/repositories`"
        class="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        <Icon
          name="lucide:folder-git-2"
          class="size-4"
        />
        View Repositories
      </NuxtLink>

      <button
        v-else-if="type === 'no-matches'"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        @click="emit('clearFilters')"
      >
        <Icon
          name="lucide:x-circle"
          class="size-4"
        />
        Clear all filters
      </button>

      <button
        v-else-if="type === 'error'"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        @click="emit('retry')"
      >
        <Icon
          name="lucide:refresh-cw"
          class="size-4"
        />
        Try Again
      </button>
    </div>
  </div>
</template>

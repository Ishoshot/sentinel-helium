<script setup lang="ts">
interface Props {
  currentPage: number;
  lastPage: number;
  from: number;
  to: number;
  total: number;
  itemType?: string; // 'reviews' | 'pull requests' | 'repositories'
}

const props = withDefaults(defineProps<Props>(), {
  itemType: 'reviews',
});

const emit = defineEmits<{
  loadPage: [page: number];
}>();

const canGoPrevious = computed(() => props.currentPage > 1);
const canGoNext = computed(() => props.currentPage < props.lastPage);
</script>

<template>
  <div
    v-if="lastPage > 1"
    class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-subtle"
  >
    <p class="text-sm text-text-secondary font-medium">
      Showing <span class="text-text-primary font-semibold">{{ from }}</span> to <span class="text-text-primary font-semibold">{{ to }}</span> of <span class="text-text-primary font-semibold">{{ total }}</span> {{ itemType }}
    </p>
    <div class="flex items-center gap-2">
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="!canGoPrevious"
        @click="emit('loadPage', currentPage - 1)"
      >
        <Icon
          name="lucide:chevron-left"
          class="w-4 h-4"
        />
        Previous
      </BaseButton>
      <div class="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-bg-elevated border border-border-subtle rounded-lg text-sm font-medium text-text-secondary">
        <span class="text-text-primary">{{ currentPage }}</span>
        <span class="text-text-muted">/</span>
        <span>{{ lastPage }}</span>
      </div>
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="!canGoNext"
        @click="emit('loadPage', currentPage + 1)"
      >
        Next
        <Icon
          name="lucide:chevron-right"
          class="w-4 h-4"
        />
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
type ViewMode = 'all' | 'pr' | 'repository';

interface Props {
  modelValue: ViewMode;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: ViewMode];
}>();
</script>

<template>
  <div class="inline-flex items-center gap-1 p-1 bg-bg-elevated border border-border-subtle rounded-xl shadow-sm">
    <button
      type="button"
      class="relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30"
      :class="props.modelValue === 'all'
        ? 'bg-bg-base text-text-primary shadow-sm scale-105'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/50'"
      @click="emit('update:modelValue', 'all')"
    >
      <div class="flex items-center gap-2">
        <Icon
          name="lucide:list"
          class="w-4 h-4"
        />
        <span>All Runs</span>
      </div>
    </button>
    <button
      type="button"
      class="relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30"
      :class="props.modelValue === 'pr'
        ? 'bg-bg-base text-text-primary shadow-sm scale-105'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/50'"
      @click="emit('update:modelValue', 'pr')"
    >
      <div class="flex items-center gap-2">
        <Icon
          name="lucide:git-pull-request"
          class="w-4 h-4"
        />
        <span>By Pull Request</span>
      </div>
    </button>
    <button
      type="button"
      class="relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30"
      :class="props.modelValue === 'repository'
        ? 'bg-bg-base text-text-primary shadow-sm scale-105'
        : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/50'"
      @click="emit('update:modelValue', 'repository')"
    >
      <div class="flex items-center gap-2">
        <Icon
          name="lucide:folder-git-2"
          class="w-4 h-4"
        />
        <span>By Repository</span>
      </div>
    </button>
  </div>
</template>

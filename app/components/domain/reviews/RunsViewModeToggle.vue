<script setup lang="ts">
type ViewMode = 'all' | 'pr' | 'repository'

interface Props {
  modelValue: ViewMode
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: ViewMode]
}>()

const options = [
  { value: 'all' as const, label: 'All Runs', icon: 'lucide:list' },
  { value: 'pr' as const, label: 'By Pull Request', icon: 'lucide:git-pull-request' },
  { value: 'repository' as const, label: 'By Repository', icon: 'lucide:folder-git-2' },
]
</script>

<template>
  <div class="inline-flex max-w-full items-center gap-1 rounded-xl border border-border-subtle bg-bg-elevated/70 p-1">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      :class="props.modelValue === option.value
        ? 'bg-accent text-white shadow-sm'
        : 'text-text-muted hover:bg-bg-hover hover:text-text-secondary'"
      @click="emit('update:modelValue', option.value)"
    >
      <Icon
        :name="option.icon"
        class="size-4"
      />
      <span class="hidden sm:inline">{{ option.label }}</span>
    </button>
  </div>
</template>

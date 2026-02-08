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
  <div class="flex items-center gap-1 rounded-lg border border-border-subtle bg-bg-elevated p-1">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
      :class="props.modelValue === option.value
        ? 'bg-accent text-white'
        : 'text-text-muted hover:text-text-secondary'"
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

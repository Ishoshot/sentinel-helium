<script setup lang="ts">
type EmptyStateType = 'no-data' | 'no-matches' | 'error';

interface Props {
  type: EmptyStateType;
  viewMode?: 'all' | 'pr' | 'repository';
  errorMessage?: string;
  workspaceSlug?: string;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'all',
});

const emit = defineEmits<{
  clearFilters: [];
  retry: [];
}>();

const config = computed(() => {
  switch (props.type) {
    case 'error':
      return {
        icon: 'lucide:alert-circle',
        iconClass: 'w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-6 shadow-sm',
        iconSize: 'w-8 h-8',
        title: 'Failed to load reviews',
        description: props.errorMessage || 'An error occurred while loading the data.',
        showAction: true,
        actionLabel: 'Try Again',
        actionIcon: 'lucide:refresh-cw',
        actionVariant: 'secondary' as const,
        containerClass: 'bg-error/5 border border-error/20 rounded-2xl p-8',
        contentClass: 'flex flex-col items-center justify-center py-12 text-center',
      };
    case 'no-matches':
      return {
        icon: 'lucide:search-x',
        iconClass: 'w-16 h-16 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto mb-6',
        iconSize: 'w-8 h-8',
        title: `No matching ${props.viewMode === 'all' ? 'reviews' : props.viewMode === 'pr' ? 'pull requests' : 'repositories'}`,
        description: "Try adjusting your search or filters to find what you're looking for.",
        showAction: true,
        actionLabel: 'Clear all filters',
        actionIcon: 'lucide:x-circle',
        actionVariant: 'secondary' as const,
        containerClass: 'flex items-center justify-center py-16',
        contentClass: 'text-center max-w-md',
      };
    case 'no-data':
    default:
      return {
        icon: 'lucide:git-pull-request',
        iconClass: 'w-20 h-20 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto mb-6 shadow-sm',
        iconSize: 'w-10 h-10',
        title: 'No reviews yet',
        description: 'Code reviews will appear here when pull requests are opened in your connected repositories.',
        showAction: !!props.workspaceSlug,
        actionLabel: 'View Repositories',
        actionIcon: 'lucide:folder-git-2',
        actionVariant: 'primary' as const,
        containerClass: 'h-full flex flex-col items-center justify-center',
        contentClass: 'text-center max-w-md',
      };
  }
});

const handleAction = () => {
  if (props.type === 'error') {
    emit('retry');
  } else if (props.type === 'no-matches') {
    emit('clearFilters');
  }
};
</script>

<template>
  <div :class="config.containerClass">
    <div :class="config.contentClass">
      <div :class="config.iconClass">
        <Icon
          :name="config.icon"
          :class="[config.iconSize, type !== 'error' && 'text-text-muted']"
        />
      </div>
      <h3 class="font-bold text-text-primary mb-2" :class="type === 'no-data' ? 'text-2xl mb-3' : 'text-xl'">
        {{ config.title }}
      </h3>
      <p class="text-sm text-text-secondary leading-relaxed" :class="type === 'no-data' ? 'mb-8' : 'mb-6'">
        {{ config.description }}
      </p>
      <NuxtLink
        v-if="type === 'no-data' && workspaceSlug"
        :to="`/${workspaceSlug}/repositories`"
      >
        <BaseButton :variant="config.actionVariant">
          <Icon
            :name="config.actionIcon"
            class="w-4 h-4 mr-2"
          />
          {{ config.actionLabel }}
        </BaseButton>
      </NuxtLink>
      <BaseButton
        v-else-if="config.showAction"
        :variant="config.actionVariant"
        :size="type === 'no-matches' ? 'sm' : undefined"
        @click="handleAction"
      >
        <Icon
          :name="config.actionIcon"
          class="w-4 h-4 mr-2"
        />
        {{ config.actionLabel }}
      </BaseButton>
    </div>
  </div>
</template>

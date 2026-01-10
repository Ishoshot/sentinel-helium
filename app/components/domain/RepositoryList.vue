<script setup lang="ts">
import type { Repository } from '~/types'

/**
 * RepositoryList - List layout for repositories
 */

interface Props {
  repositories: readonly Repository[]
  canManage?: boolean
}

withDefaults(defineProps<Props>(), {
  canManage: false,
})

defineEmits<{
  toggleAutoReview: [repositoryId: number]
  openSettings: [repositoryId: number]
}>()
</script>

<template>
  <div class="space-y-4">
    <DomainRepositoryRow
      v-for="repo in repositories"
      :key="repo.id"
      :repository="repo"
      :can-manage="canManage"
      @toggle-auto-review="$emit('toggleAutoReview', $event)"
      @open-settings="$emit('openSettings', $event)"
    />
  </div>
</template>

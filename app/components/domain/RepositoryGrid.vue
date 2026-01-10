<script setup lang="ts">
import type { Repository } from '~/types'

/**
 * RepositoryGrid - Grid layout for repositories
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
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <DomainRepositoryCard
      v-for="repo in repositories"
      :key="repo.id"
      :repository="repo"
      :can-manage="canManage"
      @toggle-auto-review="$emit('toggleAutoReview', $event)"
      @open-settings="$emit('openSettings', $event)"
    />
  </div>
</template>

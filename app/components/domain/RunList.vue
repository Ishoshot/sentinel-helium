<script setup lang="ts">
import type { Run } from '~/types'

/**
 * RunList - Container for run rows
 */

interface Props {
  runs: readonly Run[]
  workspaceSlug: string
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-4">
    <DomainRunRow
      v-for="run in runs"
      :key="run.id"
      :run="run"
      :workspace-slug="workspaceSlug"
    />
  </div>
</template>

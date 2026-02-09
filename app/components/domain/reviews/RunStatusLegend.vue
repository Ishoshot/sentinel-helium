<script setup lang="ts">
import { RunStatus } from '~/types'

/**
 * RunStatusLegend - Compact inline legend showing all run status indicators
 */

const statuses = [
  RunStatus.Completed,
  RunStatus.InProgress,
  RunStatus.Queued,
  RunStatus.Failed,
  RunStatus.Skipped,
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
    <DomainReviewsRunStatusBadge
      v-for="status in statuses"
      :key="status"
      :status="status"
      variant="minimal"
    />
  </div>
</template>

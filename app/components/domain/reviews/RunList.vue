<script setup lang="ts">
import type { Run } from '~/types'
import DomainRunRow from '~/components/domain/reviews/RunRow.vue'

/**
 * RunList - Container for run rows
 */

interface Props {
  runs: readonly Run[]
  workspaceSlug: string
  showRepository?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRepository: false
})
</script>

<template>
  <div>
    <!-- List Header -->
    <div class="hidden sm:flex items-center justify-between px-6 pb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
      <div>Run</div>
      <div class="flex items-center gap-6 text-right">
        <div class="hidden md:block w-20">
          Duration
        </div>
        <div class="w-24">
          Time
        </div>
        <div class="hidden lg:block w-32">
          Author
        </div>
        <div class="w-4" /> <!-- Spacer for chevron -->
      </div>
    </div>

    <!-- Rows -->
    <div class="space-y-4">
      <DomainRunRow
        v-for="run in runs"
        :key="run.id"
        :run="run"
        :workspace-slug="workspaceSlug"
        :show-repository="props.showRepository"
      />
    </div>
  </div>
</template>

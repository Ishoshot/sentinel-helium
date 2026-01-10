<script setup lang="ts">
import type { Finding } from '~/types'

/**
 * FindingList - Container for finding items
 */

interface Props {
  findings: readonly Finding[]
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-3">
    <DomainFindingItem
      v-for="finding in findings"
      :key="finding.id"
      :finding="finding"
    />
  </div>
</template>

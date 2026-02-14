<script setup lang="ts">
import type { MemberRole } from '~/types'

/**
 * MemberRoleBadge - Role badge for team members
 * Domain component displaying member roles with appropriate styling
 */

interface Props {
  role: MemberRole
  label?: string
}

const props = defineProps<Props>()

// Map role to badge variant
const badgeVariant = computed(() => {
  const variants: Record<MemberRole, 'accent' | 'default'> = {
    owner: 'accent',
    admin: 'accent',
    member: 'default',
  }
  return variants[props.role]
})

// Role display label
const displayLabel = computed(() => {
  if (props.label) return props.label

  const labels: Record<MemberRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
  }
  return labels[props.role]
})
</script>

<template>
  <BaseBadge
    :variant="badgeVariant"
    size="sm"
  >
    {{ displayLabel }}
  </BaseBadge>
</template>

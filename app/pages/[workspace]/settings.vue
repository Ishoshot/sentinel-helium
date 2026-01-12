<script setup lang="ts">
/**
 * Settings parent layout - provides navigation tabs for settings sub-pages
 */

definePageMeta({
  middleware: ['auth', 'workspace'],
})

const route = useRoute()
const workspaceSlug = computed(() => route.params.workspace as string)

const tabs = computed(() => [
  {
    label: 'General',
    to: `/${workspaceSlug.value}/settings`,
    active: route.path === `/${workspaceSlug.value}/settings`,
  },
  {
    label: 'Integrations',
    to: `/${workspaceSlug.value}/settings/integrations`,
    active: route.path === `/${workspaceSlug.value}/settings/integrations`,
  },
  {
    label: 'API Keys',
    to: `/${workspaceSlug.value}/settings/api-keys`,
    active: route.path === `/${workspaceSlug.value}/settings/api-keys`,
  },
])
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-text-primary">
        Settings
      </h1>
      <p class="mt-1 text-text-secondary">
        Manage your workspace configuration
      </p>
    </div>

    <!-- Tabs navigation -->
    <div class="border-b border-border-subtle mb-6">
      <nav class="-mb-px flex flex-wrap gap-4">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="py-3 text-sm font-medium border-b-2 transition-default"
          :class="tab.active
            ? 'border-accent text-accent'
            : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-default'"
        >
          {{ tab.label }}
        </NuxtLink>
      </nav>
    </div>

    <!-- Child route content -->
    <NuxtPage />
  </div>
</template>

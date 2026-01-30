<script setup lang="ts">
/**
 * Public layout - Minimal shell for shared views
 */
</script>

<template>
  <div class="min-h-screen bg-bg-app">
    <header class="border-b border-border-subtle bg-bg-elevated">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2"
        >
          <SentinelLogo size="md" />
          <span class="text-xs font-medium text-text-muted">
            Shared Briefing
          </span>
        </NuxtLink>
      </div>
    </header>

    <main class="mx-auto w-full max-w-4xl px-6 py-10">
      <slot />
    </main>
  </div>
</template>

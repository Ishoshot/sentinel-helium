<script setup lang="ts">
/**
 * Auth layout - minimal centered layout for login/auth pages
 * No navigation, just Sentinel branding and centered content
 */
</script>

<template>
  <div class="min-h-screen bg-bg-app flex flex-col">
    <!-- Header with logo -->
    <header class="py-8">
      <div class="max-w-md mx-auto px-4">
        <NuxtLink
          to="/"
          class="text-xl font-semibold text-text-primary"
        >
          Sentinel
        </NuxtLink>
      </div>
    </header>

    <!-- Main content area - centered -->
    <main class="flex-1 flex items-start justify-center px-4 pt-8 pb-16">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-6 text-center text-sm text-text-muted">
      <p>&copy; {{ new Date().getFullYear() }} Sentinel. All rights reserved.</p>
    </footer>
  </div>
</template>

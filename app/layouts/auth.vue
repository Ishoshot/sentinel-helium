<script setup lang="ts">
/**
 * Auth layout - Dark theme with subtle grid pattern
 */
</script>

<template>
  <div class="min-h-screen bg-bg-app relative overflow-hidden">
    <!-- Subtle grid pattern -->
    <div
      class="absolute inset-0 opacity-[0.4]"
      style="background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 60px 60px;"
    />

    <!-- Content -->
    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header with logo -->
      <header class="py-8">
        <div class="max-w-md mx-auto px-6 flex justify-center">
          <NuxtLink
            to="/"
            class="inline-flex items-center"
          >
            <SentinelLogo size="lg" />
          </NuxtLink>
        </div>
      </header>

      <!-- Main content area - centered -->
      <main class="flex-1 flex items-center justify-center px-6 py-12">
        <div class="w-full max-w-md">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer class="py-6 text-center text-sm text-text-muted">
        <p>&copy; {{ new Date().getFullYear() }} Sentinel. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

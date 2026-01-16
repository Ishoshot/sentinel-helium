<script setup lang="ts">
/**
 * Auth layout - Light theme with subtle grid background
 */
</script>

<template>
  <div class="landing-light min-h-screen bg-white relative overflow-hidden">
    <!-- Subtle grid pattern -->
    <div class="absolute inset-0 opacity-[0.7]" style="background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 60px 60px;" />

    <!-- Content -->
    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header with logo -->
      <header class="py-8">
        <div class="max-w-md mx-auto px-6 flex justify-center">
          <NuxtLink
            to="/"
            class="inline-flex items-center"
          >
            <SentinelLogo size="md" />
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
      <footer class="py-6 text-center text-sm text-slate-400">
        <p>&copy; {{ new Date().getFullYear() }} Sentinel. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

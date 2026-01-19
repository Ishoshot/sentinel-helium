<script setup lang="ts">
/**
 * Landing page final call-to-action section 
 * Gradient background with centered headline and CTAs
 */
</script>

<template>
  <section class="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
    <!-- Subtle pattern overlay -->
    <div
      class="absolute inset-0 opacity-10"
      style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px;"
    />

    <!-- Glow effects -->
    <div class="absolute top-0 left-1/4 w-[500px] h-[300px] bg-white rounded-full blur-[150px] opacity-10 pointer-events-none" />
    <div class="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-indigo-300 rounded-full blur-[120px] opacity-20 pointer-events-none" />

    <div class="relative max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-white leading-tight">
        Ship code you're proud of
      </h2>
      <p class="mt-6 text-lg lg:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
        Start reviewing pull requests with intelligence and confidence.
        Set up your workspace in under a minute.
      </p>

      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/login"
          class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-white text-blue-700 hover:bg-blue-50 transition-all duration-200 shadow-xl"
        >
          Get started free
          <Icon
            name="ph:arrow-right-bold"
            class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </NuxtLink>
        <a
          href="#plans"
          class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white border border-white/30 hover:bg-white/10 transition-all duration-200"
        >
          View pricing
        </a>
      </div>

      <!-- Trust note -->
      <p class="mt-12 text-sm text-white/60">
        No credit card required. 20 free reviews per month.
      </p>
    </div>
  </section>
</template>

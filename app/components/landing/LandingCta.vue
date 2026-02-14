<script setup lang="ts">
/**
 * Landing page final call-to-action section
 * Premium dark theme with dramatic teal glow
 */
</script>

<template>
  <section class="py-24 lg:py-32 relative overflow-hidden bg-[#09090b]">
    <!-- Dramatic glow effects -->
    <div class="absolute top-0 left-1/4 w-[600px] h-[400px] bg-teal-500 rounded-full blur-[200px] opacity-10 pointer-events-none" />
    <div class="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-cyan-500 rounded-full blur-[150px] opacity-10 pointer-events-none" />

    <!-- Subtle grid pattern -->
    <div
      class="cta-grid-pattern absolute inset-0 opacity-[0.02]"
    />

    <div class="relative max-w-4xl mx-auto px-6 text-center">
      <h2 class="animate-fade-in-up text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-white leading-tight">
        Ship code you're
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300">proud of</span>
      </h2>
      <p class="animate-fade-in-up [animation-delay:120ms] [animation-fill-mode:both] mt-6 text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        Start reviewing pull requests with intelligence and confidence.
        Set up your workspace in under a minute.
      </p>

      <div class="animate-fade-in-up [animation-delay:220ms] [animation-fill-mode:both] mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/login"
          class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200"
        >
          Get started free
          <Icon
            name="ph:arrow-right-bold"
            class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </NuxtLink>
        <a
          href="#plans"
          class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white border border-zinc-700 hover:bg-zinc-800/50 hover:border-zinc-600 transition-all duration-200"
        >
          View pricing
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-grid-pattern {
  background-image: linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 60px 60px;
}
</style>

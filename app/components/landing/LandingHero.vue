<script setup lang="ts">
/**
 * Landing page hero section
 * Headline and CTAs
 */

defineProps<{
  visible: boolean
}>()
</script>

<template>
  <div
    class="text-center max-w-5xl mx-auto px-6 pt-32"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
  >
    <h1 class="animate-fade-in-up text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.1] text-white">
      <span class="block">The fastest way to ship</span>
      <span class="block mt-2">
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300">quality code</span>
        with confidence
      </span>
    </h1>

    <p class="animate-fade-in-up [animation-delay:120ms] [animation-fill-mode:both] mt-8 text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
      Deploy intelligent code reviews on every pull request.
      <span class="block sm:inline">Policy-driven analysis, instant findings, and actionable insights.</span>
    </p>

    <div class="animate-fade-in-up [animation-delay:220ms] [animation-fill-mode:both] mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
      <NuxtLink
        to="/login"
        class="group w-full sm:w-auto landing-btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl"
      >
        Get started
        <Icon
          name="ph:arrow-right-bold"
          class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </NuxtLink>
      <a
        href="mailto:hello@usesentinel.ai"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl group bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-200"
      >
        <span>Contact sales</span>
        <Icon
          name="ph:arrow-right-bold"
          class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Landing page hero section
 * Badge, headline with dual CTAs on white background
 */

defineProps<{
  visible: boolean
}>()
</script>

<template>
  <div
    class="text-center max-w-5xl mx-auto transition-all duration-1000 ease-out margin-top"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
  >
    <!-- Headline -->
    <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.1] text-gray-900">
      <span class="block">The fastest way to ship</span>
      <span class="block mt-2">quality code with confidence</span>
    </h1>

    <!-- Subheadline -->
    <p class="mt-8 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
      Deploy intelligent code reviews on every pull request.
      <span class="block sm:inline">Policy-driven analysis, instant findings, and actionable insights.</span>
    </p>

    <!-- CTAs -->
    <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
      <NuxtLink
        to="/login"
        class="group w-full sm:w-auto landing-btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl"
      >
        Get started
      </NuxtLink>
      <a
        href="mailto:hello@usesentinel.ai"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl group bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200 transition-all duration-200"
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

<style scoped>
.margin-top {
  margin-top: 10rem;
}
</style>
<script setup lang="ts">
/**
 * Landing page hero section
 * Badge, headline, CTAs, and stats
 */

defineProps<{
  visible: boolean
}>()
</script>

<template>
  <div
    class="max-w-3xl mx-auto text-center transition-all duration-1000 ease-out"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
  >
    <!-- Badge -->
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
      </span>
      <span class="text-xs font-medium text-blue-700">Now in public beta</span>
    </div>

    <!-- Headline -->
    <h1 class="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.1] text-gray-900">
      Code reviews that
      <span class="block text-blue-600">actually help</span>
    </h1>

    <!-- Subheadline -->
    <p class="mt-6 text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
      High-signal insights for your pull requests. No noise. No false positives.
      Just findings that help your team ship better code, faster.
    </p>

    <!-- CTAs -->
    <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
      <NuxtLink
        to="/login"
        class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30"
      >
        Start for free
        <Icon
          name="ph:arrow-right-bold"
          class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </NuxtLink>
      <a
        href="#how-it-works"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
      >
        See how it works
      </a>
    </div>

    <!-- Stats -->
    <div class="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-lg mx-auto">
      <div class="text-center">
        <div class="text-2xl lg:text-3xl font-semibold text-gray-900 tabular-nums">
          94%
        </div>
        <div class="mt-1 text-sm text-gray-500">
          Actionable
        </div>
      </div>
      <div class="text-center">
        <div class="text-2xl lg:text-3xl font-semibold text-gray-900 tabular-nums">
          2.3h
        </div>
        <div class="mt-1 text-sm text-gray-500">
          Time saved
        </div>
      </div>
      <div class="text-center">
        <div class="text-2xl lg:text-3xl font-semibold text-gray-900 tabular-nums">
          &lt;30s
        </div>
        <div class="mt-1 text-sm text-gray-500">
          Review time
        </div>
      </div>
    </div>
  </div>
</template>

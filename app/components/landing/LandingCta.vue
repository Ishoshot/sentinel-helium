<script setup lang="ts">
/**
 * Landing page final call-to-action section
 */
</script>

<template>
  <section class="py-24 lg:py-32">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 mb-6">
        Ready to ship better code?
      </h2>
      <p class="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
        Join hundreds of teams who trust Sentinel for calm, high-signal code reviews.
      </p>
      <NuxtLink
        to="/login"
        class="group inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30"
      >
        Get started for free
        <Icon
          name="ph:arrow-right-bold"
          class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </NuxtLink>
    </div>
  </section>
</template>

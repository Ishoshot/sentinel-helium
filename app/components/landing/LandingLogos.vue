<script setup lang="ts">
/**
 * Landing page trusted logos section
 * Displays company names as social proof
 */

const companies = ['Vercel', 'Linear', 'Raycast', 'Resend', 'Cal.com']
</script>

<template>
  <section class="py-16 border-y border-gray-100">
    <div class="max-w-6xl mx-auto px-6">
      <p class="text-center text-sm text-gray-400 mb-10 tracking-wide uppercase">
        Trusted by engineering teams at
      </p>
      <div class="flex flex-wrap items-center justify-center gap-x-16 gap-y-6">
        <span
          v-for="company in companies"
          :key="company"
          class="text-xl font-semibold text-gray-300 tracking-tight transition-colors hover:text-gray-400"
        >{{ company }}</span>
      </div>
    </div>
  </section>
</template>

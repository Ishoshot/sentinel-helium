<script setup lang="ts">
/**
 * Landing page testimonial section
 * Customer quote with avatar
 */
</script>

<template>
  <section class="py-24 lg:py-32">
    <div class="max-w-3xl mx-auto px-6">
      <div class="relative bg-gray-50/50 rounded-3xl p-10 lg:p-14 border border-gray-100">
        <Icon name="ph:quotes-bold" class="absolute top-8 left-10 w-10 h-10 text-gray-200" />
        <blockquote class="relative text-xl lg:text-2xl font-medium leading-relaxed text-gray-700">
          Sentinel caught a critical security issue in our auth flow that we'd
          been shipping for months. The signal-to-noise ratio is unlike anything
          else we've tried.
        </blockquote>
        <div class="mt-8 flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ring-2 ring-white shadow">
            <span class="text-sm font-semibold text-gray-600">SC</span>
          </div>
          <div>
            <div class="font-semibold text-gray-900">Sarah Chen</div>
            <div class="text-sm text-gray-500">Staff Engineer, Acme Corp</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

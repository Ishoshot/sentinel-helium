<script setup lang="ts">
/**
 * Landing page footer
 * Links, copyright, and brand wordmark
 */

const currentYear = new Date().getFullYear()

const links = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Docs', href: '#' },
  { label: 'Status', href: '#' },
]
</script>

<template>
  <footer class="relative border-t border-gray-200 overflow-hidden">
    <!-- Main footer content -->
    <div class="relative z-10 py-12">
      <div class="max-w-6xl mx-auto px-6">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <Icon
                name="ph:shield-check-bold"
                class="w-3.5 h-3.5 text-white"
              />
            </div>
            <span class="text-sm font-semibold text-gray-900">Sentinel</span>
          </div>

          <div class="flex items-center gap-8 text-sm text-gray-500">
            <a
              v-for="link in links"
              :key="link.label"
              :href="link.href"
              class="hover:text-gray-900 transition-colors duration-200"
            >{{ link.label }}</a>
          </div>

          <div class="text-sm text-gray-400">
            &copy; {{ currentYear }} Sentinel. All rights reserved.
          </div>
        </div>
      </div>
    </div>

    <!-- Large brand wordmark image -->
    <div class="relative h-32 lg:h-48 overflow-hidden pointer-events-none select-none">
      <!-- Top fade gradient -->
      <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white to-transparent z-10" />
      <!-- Wordmark image -->
      <div class="absolute inset-x-0 bottom-0 flex justify-center translate-y-[30%]">
        <img
          src="~/assets/images/sentinel-wordmark.png"
          alt=""
          class="w-[90%] max-w-5xl h-auto grayscale invert brightness-[0.85] opacity-[0.1] mix-blend-multiply"
          aria-hidden="true"
        >
      </div>
    </div>
  </footer>
</template>

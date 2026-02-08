<script setup lang="ts">
/**
 * Landing page footer - Dark theme
 * Links, copyright, and large brand wordmark
 */

const currentYear = new Date().getFullYear()

const productLinks = [
  { label: 'Features', href: '/#product' },
  { label: 'Pricing', href: '/#plans' },
  { label: 'FAQ', href: '/#faq' },
]

const companyLinks = [
  { label: 'Product', href: '/#product' },
  { label: 'Contact', href: 'mailto:hello@usesentinel.ai' },
  { label: 'Developers', href: '/#developers' },
]

const legalLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

const socialLinks = [
  { label: 'X / Twitter', href: 'https://x.com/SentinelAIHQ', icon: 'ph:x-logo-bold' },
  { label: 'GitHub', href: 'https://github.com/ishoshot', icon: 'ph:github-logo-bold' },
]
</script>

<template>
  <footer class="relative bg-[#0f0f12] border-t border-zinc-800/50 overflow-hidden">
    <!-- Main footer content -->
    <div class="relative z-10 py-16 lg:py-20">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <!-- Brand column -->
          <div class="col-span-2 md:col-span-1">
            <div class="mb-4">
              <SentinelLogo size="lg" />
            </div>
            <p class="text-sm text-zinc-500 leading-relaxed">
              Intelligent code reviews for teams who ship with confidence.
            </p>

            <!-- Social links -->
            <div class="flex items-center gap-3 mt-6">
              <a
                v-for="social in socialLinks"
                :key="social.label"
                :href="social.href"
                class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
                :aria-label="social.label"
              >
                <Icon
                  :name="social.icon"
                  class="w-4 h-4 text-zinc-400"
                />
              </a>
            </div>
          </div>

          <!-- Product links -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Product
            </h4>
            <ul class="space-y-3">
              <li
                v-for="link in productLinks"
                :key="link.label"
              >
                <a
                  :href="link.href"
                  class="text-sm text-zinc-400 hover:text-white transition-colors"
                >{{ link.label }}</a>
              </li>
            </ul>
          </div>

          <!-- Company links -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Company
            </h4>
            <ul class="space-y-3">
              <li
                v-for="link in companyLinks"
                :key="link.label"
              >
                <a
                  :href="link.href"
                  class="text-sm text-zinc-400 hover:text-white transition-colors"
                >{{ link.label }}</a>
              </li>
            </ul>
          </div>

          <!-- Legal links -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              Legal
            </h4>
            <ul class="space-y-3">
              <li
                v-for="link in legalLinks"
                :key="link.label"
              >
                <NuxtLink
                  :to="link.href"
                  class="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="mt-12 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-zinc-600">
            &copy; {{ currentYear }} Sentinel. All rights reserved.
          </div>
          <div class="text-sm text-zinc-600">
            Built for developers who care about quality.
          </div>
        </div>
      </div>
    </div>

    <!-- Large brand wordmark -->
    <div class="relative h-24 lg:h-36 overflow-hidden pointer-events-none select-none">
      <!-- Top fade gradient -->
      <div class="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0f0f12] to-transparent z-10" />

      <!-- SVG Wordmark -->
      <div class="absolute inset-x-0 bottom-0 flex justify-center translate-y-[35%]">
        <svg
          viewBox="0 0 600 100"
          class="w-[95%] max-w-5xl h-auto opacity-[0.03]"
          aria-hidden="true"
        >
          <text
            x="50%"
            y="80"
            font-family="Instrument Sans, system-ui, -apple-system"
            font-size="90"
            font-weight="700"
            fill="currentColor"
            class="text-white"
            text-anchor="middle"
          >
            SENTINEL
          </text>
        </svg>
      </div>
    </div>
  </footer>
</template>

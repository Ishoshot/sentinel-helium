<script setup lang="ts">
/**
 * Landing page how it works section
 * Dark theme - Simple 3-step flow with visual indicators
 */

const steps = [
  {
    number: '1',
    title: 'Connect GitHub',
    description: 'Authorize your GitHub account and select which repositories to enable.',
    icon: 'ph:github-logo-bold',
  },
  {
    number: '2',
    title: 'Push your code',
    description: 'Open a pull request and Sentinel automatically runs an intelligent review.',
    icon: 'ph:git-pull-request-bold',
  },
  {
    number: '3',
    title: 'Ship confidently',
    description: 'Review findings, resolve issues, and merge with full visibility.',
    icon: 'ph:rocket-launch-bold',
  },
]
</script>

<template>
  <section
    id="workflow"
    class="py-24 lg:py-32 bg-[#0f0f12] relative overflow-hidden"
  >
    <div class="relative max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="animate-fade-in-up [animation-fill-mode:both] text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
          Three steps to better code reviews
        </h2>
        <p class="mt-4 text-lg text-zinc-400 leading-relaxed">
          No complex setup. No configuration files. Just connect and start reviewing.
        </p>
      </div>

      <!-- Steps -->
      <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div
          v-for="(step, index) in steps"
          :key="step.number"
          class="animate-fade-in-up [animation-fill-mode:both] relative"
          :style="{ animationDelay: `${120 + (index * 100)}ms` }"
        >
          <!-- Connector line (desktop only) -->
          <div
            v-if="index < steps.length - 1"
            class="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-zinc-700 to-zinc-800"
          />

          <div class="relative text-center">
            <!-- Step icon -->
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg shadow-black/20 mb-6">
              <Icon
                :name="step.icon"
                class="w-8 h-8 text-teal-400"
              />
            </div>

            <!-- Step number -->
            <div class="absolute top-0 right-[calc(50%-50px)] w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white text-xs font-semibold flex items-center justify-center shadow-lg shadow-teal-500/30">
              {{ step.number }}
            </div>

            <!-- Content -->
            <h3 class="text-lg font-semibold text-white mb-2">
              {{ step.title }}
            </h3>
            <p class="text-sm text-zinc-500 leading-relaxed">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="animate-fade-in-up [animation-delay:380ms] [animation-fill-mode:both] mt-16 text-center">
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 transition-colors shadow-lg"
        >
          Get started in 60 seconds
          <Icon
            name="ph:arrow-right-bold"
            class="w-4 h-4"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

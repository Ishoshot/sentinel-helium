<script setup lang="ts">
/**
 * Landing page how it works section 
 * Simple 3-step flow with visual indicators
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
    class="py-24 lg:py-32 bg-slate-50"
  >
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
          Three steps to better code reviews
        </h2>
        <p class="mt-4 text-lg text-slate-600 leading-relaxed">
          No complex setup. No configuration files. Just connect and start reviewing.
        </p>
      </div>

      <!-- Steps -->
      <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div
          v-for="(step, index) in steps"
          :key="step.number"
          class="relative"
        >
          <!-- Connector line (desktop only) -->
          <div
            v-if="index < steps.length - 1"
            class="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-slate-200"
          />

          <div class="relative text-center">
            <!-- Step icon -->
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm mb-6">
              <Icon
                :name="step.icon"
                class="w-8 h-8 text-blue-600"
              />
            </div>

            <!-- Step number -->
            <div class="absolute top-0 right-[calc(50%-50px)] w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
              {{ step.number }}
            </div>

            <!-- Content -->
            <h3 class="text-lg font-semibold text-slate-900 mb-2">
              {{ step.title }}
            </h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-16 text-center">
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
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

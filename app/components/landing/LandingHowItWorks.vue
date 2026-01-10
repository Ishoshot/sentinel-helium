<script setup lang="ts">
/**
 * Landing page how it works section
 * Step-by-step process explanation
 */

const steps = [
  {
    number: '01',
    title: 'Connect',
    description: 'Install Sentinel on your GitHub organization. Select which repositories to monitor. No config files required.',
  },
  {
    number: '02',
    title: 'Review',
    description: 'Open a pull request. Sentinel automatically reviews your code and surfaces findings in seconds, right in your PR.',
  },
  {
    number: '03',
    title: 'Ship',
    description: 'Fix real issues, ignore the noise. Track trends over time and watch your code quality continuously improve.',
  },
]
</script>

<template>
  <section
    id="how-it-works"
    class="py-24 lg:py-32 bg-gray-50/70"
  >
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-16 lg:mb-20">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
          Up and running in minutes
        </h2>
        <p class="text-lg text-gray-500 max-w-xl mx-auto">
          No complex setup. No configuration hell. Just connect and go.
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div
          v-for="step in steps"
          :key="step.number"
          class="relative text-center lg:text-left"
        >
          <div class="text-6xl font-bold text-gray-200/80 mb-4 tabular-nums">
            {{ step.number }}
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ step.title }}</h3>
          <p class="text-gray-500 leading-relaxed">
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

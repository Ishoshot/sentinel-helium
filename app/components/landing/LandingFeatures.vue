<script setup lang="ts">
/**
 * Landing page features section
 * Grid of feature cards with icons
 */

const features = [
  {
    title: 'High-signal findings',
    description: 'Every finding is validated and worth your attention. No noise, no false positives—just insights that lead to real code improvements.',
    icon: 'ph:target-bold',
  },
  {
    title: 'Explainable feedback',
    description: 'Clear reasoning for every finding. Understand the why, not just the what. Context that helps your team learn and grow.',
    icon: 'ph:chat-circle-text-bold',
  },
  {
    title: 'Native integration',
    description: 'Lives where you work. Deep GitHub integration with inline comments, suggested fixes, and seamless PR workflows.',
    icon: 'ph:git-pull-request-bold',
  },
  {
    title: 'Your rules, enforced',
    description: 'Configure policies that match your standards. Set thresholds, customize rules, maintain consistency across every review.',
    icon: 'ph:sliders-horizontal-bold',
  },
]
</script>

<template>
  <section
    id="features"
    class="py-24 lg:py-32"
  >
    <div class="max-w-6xl mx-auto px-6">
      <div class="max-w-2xl mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900">
          Everything you need.
          <span class="block text-gray-400">Nothing you don't.</span>
        </h2>
        <p class="mt-5 text-lg text-gray-500 leading-relaxed">
          Built for teams who value signal over noise. Every feature serves a purpose.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-5">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="group p-7 bg-gray-50/70 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-100/50 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50"
        >
          <div class="w-11 h-11 bg-white rounded-xl flex items-center justify-center mb-5 border border-gray-200 shadow-sm group-hover:shadow-md group-hover:border-gray-300 transition-all duration-300">
            <Icon
              :name="feature.icon"
              class="w-5 h-5 text-gray-700"
            />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
          <p class="text-gray-500 leading-relaxed text-[15px]">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

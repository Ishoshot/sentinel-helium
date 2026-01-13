<script setup lang="ts">
/**
 * Landing page pricing section
 * Pricing tiers with features
 */

const tiers = [
  {
    name: 'Foundation',
    price: '$0',
    period: 'free forever',
    description: 'For individual developers and small projects getting started with trusted code review.',
    features: ['Bring-your-own-key providers', 'Core review insights', 'Usage visibility', 'Community support'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Illuminate',
    price: '$20',
    period: 'per month, billed monthly or yearly',
    description: 'For growing teams that want deeper insight and consistent code quality across projects.',
    features: ['Custom guidelines', 'Priority review queue', 'Expanded team limits', 'Workspace insights'],
    cta: 'Choose Illuminate',
    highlighted: true,
  },
  {
    name: 'Orchestrate',
    price: '$50',
    period: 'per month, billed monthly or yearly',
    description: 'For professional teams coordinating code quality at scale across multiple repositories.',
    features: ['API access', 'Advanced limits', 'Priority processing', 'Operational insights'],
    cta: 'Choose Orchestrate',
    highlighted: false,
  },
  {
    name: 'Sanctum',
    price: '$200',
    period: 'per month, billed monthly or yearly',
    description: 'For organizations that require governance, security, and reliability guarantees.',
    features: ['SSO & security controls', 'Audit logs', 'Governance support', 'Dedicated success'],
    cta: 'Choose Sanctum',
    highlighted: false,
  },
]
</script>

<template>
  <section
    id="pricing"
    class="py-24 lg:py-32 bg-gray-50/70"
  >
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
          Simple, transparent pricing
        </h2>
        <p class="text-lg text-gray-500">
          Start free. Scale as you grow.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
        <div
          v-for="tier in tiers"
          :key="tier.name"
          class="relative rounded-2xl p-7 transition-all duration-300"
          :class="tier.highlighted
            ? 'bg-gray-900 text-white shadow-2xl shadow-gray-900/20 scale-[1.02] lg:scale-105'
            : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'"
        >
          <!-- Popular badge -->
          <div
            v-if="tier.highlighted"
            class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full shadow-lg"
          >
            Most popular
          </div>

          <div
            class="text-sm font-medium mb-4"
            :class="tier.highlighted ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ tier.description }}
          </div>
          <div class="flex items-baseline gap-1 mb-1">
            <span
              class="text-4xl font-semibold tracking-tight"
              :class="tier.highlighted ? 'text-white' : 'text-gray-900'"
            >{{ tier.price }}</span>
          </div>
          <div
            class="text-sm mb-8"
            :class="tier.highlighted ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ tier.period }}
          </div>

          <ul class="space-y-3.5 mb-8">
            <li
              v-for="feat in tier.features"
              :key="feat"
              class="flex items-start gap-3 text-sm"
              :class="tier.highlighted ? 'text-gray-300' : 'text-gray-600'"
            >
              <Icon
                name="ph:check-bold"
                class="w-4 h-4 flex-shrink-0 mt-0.5"
                :class="tier.highlighted ? 'text-blue-400' : 'text-blue-600'"
              />
              <span>{{ feat }}</span>
            </li>
          </ul>

          <NuxtLink
            to="/login"
            class="block w-full text-center py-3 text-sm font-semibold rounded-xl transition-all duration-200"
            :class="tier.highlighted
              ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-sm'
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'"
          >
            {{ tier.cta }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

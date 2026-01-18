<script setup lang="ts">
/**
 * Landing page pricing section 
 * Plan cards + comparison table
 */

const tiers = [
  {
    name: 'Foundation',
    price: '$0',
    period: 'Free forever',
    description: 'Everything you need for prototypes and personal projects.',
    features: [
      '20 reviews per month',
      'GitHub integration',
      'Basic findings',
      '2 team members',
      'Community support',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Illuminate',
    price: '$20',
    period: 'per month',
    description: 'For growing teams wanting deeper insight and consistent quality.',
    features: [
      '500 reviews per month',
      'Custom guidelines',
      'Priority processing',
      '5 team members',
      'Email support',
    ],
    cta: 'Get started',
    highlighted: true,
  },
  {
    name: 'Orchestrate',
    price: '$50',
    period: 'per month',
    description: 'For professional teams coordinating quality at scale.',
    features: [
      '2,000 reviews per month',
      'API access',
      'Advanced analytics',
      'Unlimited members',
      'Priority support',
    ],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Sanctum',
    price: '$200',
    period: 'per month',
    description: 'For organizations requiring governance and security.',
    features: [
      'Unlimited reviews',
      'SSO & SAML',
      'Audit logs',
      'Unlimited members',
      'Dedicated support',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
]

const comparisonFeatures = [
  { name: 'Reviews per month', foundation: '20', illuminate: '500', orchestrate: '2,000', sanctum: 'Unlimited' },
  { name: 'Team members', foundation: '2', illuminate: '5', orchestrate: 'Unlimited', sanctum: 'Unlimited' },
  { name: 'GitHub integration', foundation: true, illuminate: true, orchestrate: true, sanctum: true },
  { name: 'Custom guidelines', foundation: false, illuminate: true, orchestrate: true, sanctum: true },
  { name: 'API access', foundation: false, illuminate: false, orchestrate: true, sanctum: true },
  { name: 'Advanced analytics', foundation: false, illuminate: false, orchestrate: true, sanctum: true },
  { name: 'SSO / SAML', foundation: false, illuminate: false, orchestrate: false, sanctum: true },
  { name: 'Audit logs', foundation: false, illuminate: false, orchestrate: false, sanctum: true },
  { name: 'Priority support', foundation: false, illuminate: false, orchestrate: true, sanctum: true },
  { name: 'Dedicated support', foundation: false, illuminate: false, orchestrate: false, sanctum: true },
]
</script>

<template>
  <section
    id="plans"
    class="py-24 lg:py-32 bg-white"
  >
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
          Spend more time shipping, not configuring
        </h2>
        <p class="mt-4 text-lg text-slate-600 leading-relaxed">
          Most devs would rather spend time building product. Only pay for what you need. All plans include BYOK for AI providers.
        </p>
      </div>

      <!-- Pricing cards -->
      <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
        <div
          v-for="tier in tiers"
          :key="tier.name"
          class="relative rounded-2xl p-6 transition-all duration-300"
          :class="tier.highlighted
            ? 'bg-gradient-to-b from-blue-600 to-blue-700 ring-1 ring-blue-500 shadow-xl shadow-blue-500/20 scale-[1.02]'
            : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg'"
        >
          <!-- Popular badge -->
          <div
            v-if="tier.highlighted"
            class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-blue-600 text-xs font-semibold rounded-full shadow-lg"
          >
            Most popular
          </div>

          <!-- Plan name -->
          <div
            class="text-sm font-semibold mb-4"
            :class="tier.highlighted ? 'text-white/80' : 'text-slate-500'"
          >
            {{ tier.name }}
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-1 mb-2">
            <span
              class="text-4xl font-semibold tracking-tight"
              :class="tier.highlighted ? 'text-white' : 'text-slate-900'"
            >{{ tier.price }}</span>
            <span
              class="text-sm"
              :class="tier.highlighted ? 'text-white/70' : 'text-slate-500'"
            >{{ tier.period }}</span>
          </div>

          <!-- Description -->
          <p
            class="text-sm mb-6 leading-relaxed"
            :class="tier.highlighted ? 'text-white/80' : 'text-slate-600'"
          >
            {{ tier.description }}
          </p>

          <!-- Features -->
          <ul class="space-y-3 mb-8">
            <li
              v-for="feat in tier.features"
              :key="feat"
              class="flex items-start gap-3 text-sm"
              :class="tier.highlighted ? 'text-white/90' : 'text-slate-600'"
            >
              <Icon
                name="ph:check-bold"
                class="w-4 h-4 flex-shrink-0 mt-0.5"
                :class="tier.highlighted ? 'text-white' : 'text-emerald-500'"
              />
              <span>{{ feat }}</span>
            </li>
          </ul>

          <!-- CTA -->
          <NuxtLink
            :to="tier.name === 'Sanctum' ? 'mailto:hello@usesentinel.ai' : '/login'"
            class="block w-full text-center py-3 text-sm font-semibold rounded-xl transition-all duration-200"
            :class="tier.highlighted
              ? 'bg-white text-blue-600 hover:bg-white/90 shadow-lg'
              : 'bg-slate-900 text-white hover:bg-slate-800'"
          >
            {{ tier.cta }}
          </NuxtLink>
        </div>
      </div>

      <!-- Comparison table -->
      <div class="mt-20">
        <h3 class="text-xl font-semibold text-slate-900 mb-8">Compare plans</h3>

        <!-- Desktop table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-4 pr-4 text-sm font-medium text-slate-500">
                  Feature
                </th>
                <th
                  v-for="tier in tiers"
                  :key="tier.name"
                  class="text-center py-4 px-4 text-sm font-semibold text-slate-900"
                >
                  {{ tier.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="feature in comparisonFeatures"
                :key="feature.name"
                class="border-b border-slate-100"
              >
                <td class="py-4 pr-4 text-sm text-slate-600">{{ feature.name }}</td>
                <td class="text-center py-4 px-4">
                  <template v-if="typeof feature.foundation === 'boolean'">
                    <Icon
                      v-if="feature.foundation"
                      name="ph:check-bold"
                      class="w-4 h-4 text-emerald-500 mx-auto"
                    />
                    <span
                      v-else
                      class="text-slate-300"
                    >—</span>
                  </template>
                  <span
                    v-else
                    class="text-sm text-slate-900"
                  >{{ feature.foundation }}</span>
                </td>
                <td class="text-center py-4 px-4 bg-blue-50/50">
                  <template v-if="typeof feature.illuminate === 'boolean'">
                    <Icon
                      v-if="feature.illuminate"
                      name="ph:check-bold"
                      class="w-4 h-4 text-emerald-500 mx-auto"
                    />
                    <span
                      v-else
                      class="text-slate-300"
                    >—</span>
                  </template>
                  <span
                    v-else
                    class="text-sm text-slate-900"
                  >{{ feature.illuminate }}</span>
                </td>
                <td class="text-center py-4 px-4">
                  <template v-if="typeof feature.orchestrate === 'boolean'">
                    <Icon
                      v-if="feature.orchestrate"
                      name="ph:check-bold"
                      class="w-4 h-4 text-emerald-500 mx-auto"
                    />
                    <span
                      v-else
                      class="text-slate-300"
                    >—</span>
                  </template>
                  <span
                    v-else
                    class="text-sm text-slate-900"
                  >{{ feature.orchestrate }}</span>
                </td>
                <td class="text-center py-4 px-4">
                  <template v-if="typeof feature.sanctum === 'boolean'">
                    <Icon
                      v-if="feature.sanctum"
                      name="ph:check-bold"
                      class="w-4 h-4 text-emerald-500 mx-auto"
                    />
                    <span
                      v-else
                      class="text-slate-300"
                    >—</span>
                  </template>
                  <span
                    v-else
                    class="text-sm text-slate-900"
                  >{{ feature.sanctum }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile comparison (simplified) -->
        <div class="lg:hidden space-y-4">
          <p class="text-sm text-slate-500">View full comparison on desktop</p>
        </div>
      </div>

      <!-- Bottom note -->
      <div class="mt-12 text-center">
        <p class="text-sm text-slate-500">
          All plans include workspace-level controls and review history.
          <a
            href="#faq"
            class="text-blue-600 hover:text-blue-700 ml-1"
          >Learn more about billing</a>
        </p>
      </div>
    </div>
  </section>
</template>

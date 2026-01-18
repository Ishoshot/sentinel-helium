<script setup lang="ts">
import { hasToken } from '~/services/core/api'

/**
 * Full pricing comparison with all features
 */

definePageMeta({
  layout: false,
})

useHead({
  title: 'Pricing - Sentinel',
  htmlAttrs: {
    class: 'scroll-smooth',
  },
  bodyAttrs: {
    class: 'bg-[#0a0a1a]',
  },
})

const isCheckingAuth = ref(true)
const isAuthenticated = ref(false)
const scrolled = ref(false)

onMounted(async () => {
  if (hasToken()) {
    isAuthenticated.value = true
  }
  isCheckingAuth.value = false

  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

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
    href: '/login',
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
    href: '/login',
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
    href: '/login',
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
    href: 'mailto:hello@usesentinel.ai',
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
  { name: 'BYOK (Bring Your Own Key)', foundation: true, illuminate: true, orchestrate: true, sanctum: true },
  { name: 'Workspace-level controls', foundation: true, illuminate: true, orchestrate: true, sanctum: true },
  { name: 'Review history', foundation: true, illuminate: true, orchestrate: true, sanctum: true },
]

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes. You can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.',
  },
  {
    question: 'What happens when I reach my review limit?',
    answer: 'Reviews are gracefully skipped when you reach your monthly limit. The system logs the skip reason for visibility, and you can upgrade at any time.',
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'The Foundation plan is free forever with 20 reviews per month. You can start there and upgrade when you need more.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards through our secure payment processor. Enterprise customers can request invoicing.',
  },
]
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="isCheckingAuth"
    class="landing-dark min-h-screen flex items-center justify-center"
  >
    <div class="flex flex-col items-center gap-4">
      <div class="w-8 h-8 border-2 border-[var(--landing-border-subtle)] border-t-[var(--landing-accent)] rounded-full animate-spin" />
      <span class="text-[var(--landing-text-muted)] text-sm">Loading...</span>
    </div>
  </div>

  <!-- Pricing page -->
  <div
    v-else
    class="landing-dark min-h-screen overflow-x-hidden antialiased"
  >
    <!-- Navigation -->
    <LandingNav
      :scrolled="scrolled"
      :is-authenticated="isAuthenticated"
    />

    <!-- Hero -->
    <section class="pt-32 lg:pt-40 pb-16 lg:pb-20 landing-aurora-bg">
      <div class="relative max-w-4xl mx-auto px-6 text-center">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
          Simple, transparent pricing
        </h1>
        <p class="mt-6 text-lg lg:text-xl text-[var(--landing-text-secondary)] max-w-2xl mx-auto">
          Start free, scale as you grow. All plans include BYOK for AI providers.
        </p>
      </div>
    </section>

    <!-- Pricing cards -->
    <section class="py-16 lg:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
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
              :to="tier.href"
              class="block w-full text-center py-3 text-sm font-semibold rounded-xl transition-all duration-200"
              :class="tier.highlighted
                ? 'bg-white text-blue-600 hover:bg-white/90 shadow-lg'
                : 'bg-slate-900 text-white hover:bg-slate-800'"
            >
              {{ tier.cta }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison table -->
    <section class="py-16 lg:py-20 bg-slate-50">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="text-2xl lg:text-3xl font-semibold text-slate-900 mb-10 text-center">
          Compare all features
        </h2>

        <!-- Desktop table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full bg-white rounded-2xl overflow-hidden shadow-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-5 px-6 text-sm font-medium text-slate-500 w-1/5">
                  Feature
                </th>
                <th
                  v-for="tier in tiers"
                  :key="tier.name"
                  class="text-center py-5 px-4 text-sm font-semibold text-slate-900"
                  :class="{ 'bg-blue-50': tier.highlighted }"
                >
                  <div>{{ tier.name }}</div>
                  <div class="text-xs font-normal text-slate-500 mt-1">{{ tier.price }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="feature in comparisonFeatures"
                :key="feature.name"
                class="border-b border-slate-100 last:border-0"
              >
                <td class="py-4 px-6 text-sm text-slate-600">{{ feature.name }}</td>
                <td class="text-center py-4 px-4">
                  <template v-if="typeof feature.foundation === 'boolean'">
                    <Icon
                      v-if="feature.foundation"
                      name="ph:check-bold"
                      class="w-5 h-5 text-emerald-500 mx-auto"
                    />
                    <span
                      v-else
                      class="text-slate-300"
                    >—</span>
                  </template>
                  <span
                    v-else
                    class="text-sm text-slate-900 font-medium"
                  >{{ feature.foundation }}</span>
                </td>
                <td class="text-center py-4 px-4 bg-blue-50/50">
                  <template v-if="typeof feature.illuminate === 'boolean'">
                    <Icon
                      v-if="feature.illuminate"
                      name="ph:check-bold"
                      class="w-5 h-5 text-emerald-500 mx-auto"
                    />
                    <span
                      v-else
                      class="text-slate-300"
                    >—</span>
                  </template>
                  <span
                    v-else
                    class="text-sm text-slate-900 font-medium"
                  >{{ feature.illuminate }}</span>
                </td>
                <td class="text-center py-4 px-4">
                  <template v-if="typeof feature.orchestrate === 'boolean'">
                    <Icon
                      v-if="feature.orchestrate"
                      name="ph:check-bold"
                      class="w-5 h-5 text-emerald-500 mx-auto"
                    />
                    <span
                      v-else
                      class="text-slate-300"
                    >—</span>
                  </template>
                  <span
                    v-else
                    class="text-sm text-slate-900 font-medium"
                  >{{ feature.orchestrate }}</span>
                </td>
                <td class="text-center py-4 px-4">
                  <template v-if="typeof feature.sanctum === 'boolean'">
                    <Icon
                      v-if="feature.sanctum"
                      name="ph:check-bold"
                      class="w-5 h-5 text-emerald-500 mx-auto"
                    />
                    <span
                      v-else
                      class="text-slate-300"
                    >—</span>
                  </template>
                  <span
                    v-else
                    class="text-sm text-slate-900 font-medium"
                  >{{ feature.sanctum }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile comparison hint -->
        <div class="lg:hidden text-center">
          <p class="text-sm text-slate-500 mb-6">View full comparison on desktop</p>
          <div class="space-y-4">
            <NuxtLink
              v-for="tier in tiers"
              :key="tier.name"
              :to="tier.href"
              class="block p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-slate-900">{{ tier.name }}</div>
                  <div class="text-sm text-slate-500">{{ tier.price }} {{ tier.period }}</div>
                </div>
                <Icon
                  name="ph:arrow-right"
                  class="w-5 h-5 text-slate-400"
                />
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing FAQ -->
    <section class="py-16 lg:py-20 bg-white">
      <div class="max-w-3xl mx-auto px-6">
        <h2 class="text-2xl lg:text-3xl font-semibold text-slate-900 mb-10 text-center">
          Pricing FAQ
        </h2>

        <div class="divide-y divide-slate-200">
          <details
            v-for="faq in faqs"
            :key="faq.question"
            class="group py-5"
          >
            <summary class="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-slate-900">
              <span>{{ faq.question }}</span>
              <Icon
                name="ph:plus-bold"
                class="w-5 h-5 text-slate-400 transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <p class="mt-4 text-slate-600 leading-relaxed pr-12">
              {{ faq.answer }}
            </p>
          </details>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 lg:py-20 landing-cta-gradient relative overflow-hidden">
      <div class="absolute top-0 left-1/4 w-[400px] h-[200px] bg-blue-400 rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div class="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-purple-400 rounded-full blur-[100px] opacity-15 pointer-events-none" />

      <div class="relative max-w-3xl mx-auto px-6 text-center">
        <h2 class="text-3xl lg:text-4xl font-semibold text-white mb-4">
          Ready to get started?
        </h2>
        <p class="text-lg text-white/70 mb-8">
          Start with 20 free reviews per month. No credit card required.
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-white text-slate-900 hover:bg-white/90 transition-colors shadow-xl"
        >
          Get started free
          <Icon
            name="ph:arrow-right-bold"
            class="w-4 h-4"
          />
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>

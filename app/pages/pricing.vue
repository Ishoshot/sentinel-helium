<script setup lang="ts">
import { hasAuthPresenceCookie, syncAuthPresenceWithToken } from '~/services/core/api'
import { usePlans } from '~/composables/billing/usePlans'
import { usePageSeo } from '~/composables/seo/usePageSeo'

/**
 * Full pricing comparison with all features
 * Premium dark theme with teal accents
 * Fetches plans from API for up-to-date pricing
 */

definePageMeta({
  layout: false,
})

usePageSeo({
  title: 'Pricing',
  description: 'Simple, transparent pricing for AI-powered code reviews. Start free with 20 reviews per month. Scale as you grow with BYOK AI providers.',
  path: '/pricing',
})

useHead({
  htmlAttrs: {
    class: 'scroll-smooth',
  },
  bodyAttrs: {
    class: 'bg-[#09090b]',
  },
})

const { plans, fetchPlans, comparisonFeatures } = usePlans()

await fetchPlans()

const isAuthenticated = ref(hasAuthPresenceCookie())
const scrolled = ref(false)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()

  requestAnimationFrame(() => {
    isAuthenticated.value = syncAuthPresenceWithToken()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

// Transform plans to the format expected by the template
const tiers = computed(() => plans.value.map(plan => ({
  name: plan.name ?? plan.tier,
  price: plan.price_label ?? `$${plan.price_monthly_cents ? plan.price_monthly_cents / 100 : 0}`,
  period: plan.period ?? (plan.price_monthly_cents === 0 ? 'Free forever' : 'per month'),
  description: plan.description,
  features: plan.feature_list ?? [],
  cta: plan.cta ?? 'Get started',
  href: plan.cta_link ?? '/login',
  highlighted: plan.highlighted ?? false,
})))

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

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer,
          },
        })),
      }),
    },
  ],
})
</script>

<template>
  <!-- Pricing page -->
  <div
    class="landing-dark min-h-screen overflow-x-hidden antialiased"
  >
    <!-- Navigation -->
    <LandingNav
      :scrolled="scrolled"
      :is-authenticated="isAuthenticated"
    />

    <!-- Hero -->
    <section class="pt-32 lg:pt-40 pb-16 lg:pb-20 bg-[#0f0f12]">
      <div class="relative max-w-4xl mx-auto px-6 text-center">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
          Simple, transparent pricing
        </h1>
        <p class="mt-6 text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto">
          Start free, scale as you grow. All plans include BYOK for AI providers.
        </p>
      </div>
    </section>

    <!-- Pricing cards -->
    <section class="py-16 lg:py-20 bg-[#09090b]">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div
            v-for="tier in tiers"
            :key="tier.name"
            class="relative rounded-2xl p-6 transition-all duration-300"
            :class="tier.highlighted
              ? 'bg-gradient-to-b from-teal-500/20 to-teal-600/5 ring-1 ring-teal-500/50 shadow-xl shadow-teal-500/10 scale-[1.02]'
              : 'bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 hover:shadow-lg hover:shadow-black/20'"
          >
            <!-- Popular badge -->
            <div
              v-if="tier.highlighted"
              class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-semibold rounded-full shadow-lg shadow-teal-500/30"
            >
              Most popular
            </div>

            <!-- Plan name -->
            <div
              class="text-sm font-semibold mb-4"
              :class="tier.highlighted ? 'text-teal-300' : 'text-zinc-500'"
            >
              {{ tier.name }}
            </div>

            <!-- Price -->
            <div class="flex items-baseline gap-1 mb-2">
              <span
                class="text-4xl font-semibold tracking-tight"
                :class="tier.highlighted ? 'text-white' : 'text-zinc-100'"
              >{{ tier.price }}</span>
              <span
                class="text-sm"
                :class="tier.highlighted ? 'text-teal-300/70' : 'text-zinc-500'"
              >{{ tier.period }}</span>
            </div>

            <!-- Description -->
            <p
              class="text-sm mb-6 leading-relaxed"
              :class="tier.highlighted ? 'text-zinc-300' : 'text-zinc-500'"
            >
              {{ tier.description }}
            </p>

            <!-- Features -->
            <ul class="space-y-3 mb-8">
              <li
                v-for="feat in tier.features"
                :key="feat"
                class="flex items-start gap-3 text-sm"
                :class="tier.highlighted ? 'text-zinc-200' : 'text-zinc-400'"
              >
                <Icon
                  name="ph:check-bold"
                  class="w-4 h-4 flex-shrink-0 mt-0.5"
                  :class="tier.highlighted ? 'text-teal-400' : 'text-emerald-500'"
                />
                <span>{{ feat }}</span>
              </li>
            </ul>

            <!-- CTA -->
            <NuxtLink
              :to="tier.href"
              class="block w-full text-center py-3 text-sm font-semibold rounded-xl transition-all duration-200"
              :class="tier.highlighted
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30'
                : 'bg-white text-zinc-900 hover:bg-zinc-100'"
            >
              {{ tier.cta }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison table -->
    <section class="py-16 lg:py-20 bg-[#0f0f12]">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="text-2xl lg:text-3xl font-semibold text-white mb-10 text-center">
          Compare all features
        </h2>

        <!-- Desktop table -->
        <div class="hidden lg:block overflow-x-auto">
          <div class="overflow-hidden rounded-2xl border border-zinc-800/50">
            <table class="w-full bg-zinc-900/30">
              <thead>
                <tr class="border-b border-zinc-800/50">
                  <th class="text-left py-5 px-6 text-sm font-medium text-zinc-500 w-1/5">
                    Feature
                  </th>
                  <th
                    v-for="tier in tiers"
                    :key="tier.name"
                    class="text-center py-5 px-4 text-sm font-semibold text-zinc-300"
                    :class="{ 'bg-teal-500/5': tier.highlighted }"
                  >
                    <div>{{ tier.name }}</div>
                    <div class="text-xs font-normal text-zinc-500 mt-1">
                      {{ tier.price }}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="feature in comparisonFeatures"
                  :key="feature.name"
                  class="border-b border-zinc-800/30 last:border-0"
                >
                  <td class="py-4 px-6 text-sm text-zinc-400">
                    {{ feature.name }}
                  </td>
                  <td class="text-center py-4 px-4">
                    <template v-if="typeof feature.foundation === 'boolean'">
                      <Icon
                        v-if="feature.foundation"
                        name="ph:check-bold"
                        class="w-5 h-5 text-emerald-500 mx-auto"
                      />
                      <span
                        v-else
                        class="text-zinc-700"
                      >—</span>
                    </template>
                    <span
                      v-else
                      class="text-sm text-zinc-300 font-medium"
                    >{{ feature.foundation }}</span>
                  </td>
                  <td class="text-center py-4 px-4 bg-teal-500/5">
                    <template v-if="typeof feature.illuminate === 'boolean'">
                      <Icon
                        v-if="feature.illuminate"
                        name="ph:check-bold"
                        class="w-5 h-5 text-emerald-500 mx-auto"
                      />
                      <span
                        v-else
                        class="text-zinc-700"
                      >—</span>
                    </template>
                    <span
                      v-else
                      class="text-sm text-zinc-300 font-medium"
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
                        class="text-zinc-700"
                      >—</span>
                    </template>
                    <span
                      v-else
                      class="text-sm text-zinc-300 font-medium"
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
                        class="text-zinc-700"
                      >—</span>
                    </template>
                    <span
                      v-else
                      class="text-sm text-zinc-300 font-medium"
                    >{{ feature.sanctum }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile comparison hint -->
        <div class="lg:hidden text-center">
          <p class="text-sm text-zinc-500 mb-6">
            View full comparison on desktop
          </p>
          <div class="space-y-4">
            <NuxtLink
              v-for="tier in tiers"
              :key="tier.name"
              :to="tier.href"
              class="block p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700/50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-semibold text-zinc-100">
                    {{ tier.name }}
                  </div>
                  <div class="text-sm text-zinc-500">
                    {{ tier.price }} {{ tier.period }}
                  </div>
                </div>
                <Icon
                  name="ph:arrow-right"
                  class="w-5 h-5 text-zinc-600"
                />
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing FAQ -->
    <section class="py-16 lg:py-20 bg-[#09090b]">
      <div class="max-w-3xl mx-auto px-6">
        <h2 class="text-2xl lg:text-3xl font-semibold text-white mb-10 text-center">
          Pricing FAQ
        </h2>

        <div class="divide-y divide-zinc-800/50">
          <details
            v-for="faq in faqs"
            :key="faq.question"
            class="group py-5"
          >
            <summary class="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-white">
              <span>{{ faq.question }}</span>
              <Icon
                name="ph:plus-bold"
                class="w-5 h-5 text-zinc-500 transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <p class="mt-4 text-zinc-400 leading-relaxed pr-12">
              {{ faq.answer }}
            </p>
          </details>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 lg:py-20 bg-[#0f0f12] relative overflow-hidden">
      <!-- Glow effects -->
      <div class="absolute top-0 left-1/4 w-[400px] h-[300px] bg-teal-500 rounded-full blur-[200px] opacity-10 pointer-events-none" />
      <div class="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-cyan-500 rounded-full blur-[150px] opacity-10 pointer-events-none" />

      <div class="relative max-w-3xl mx-auto px-6 text-center">
        <h2 class="text-3xl lg:text-4xl font-semibold text-white mb-4">
          Ready to get started?
        </h2>
        <p class="text-lg text-zinc-400 mb-8">
          Start with 20 free reviews per month. No credit card required.
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200"
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

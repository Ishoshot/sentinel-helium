<script setup lang="ts">
import { usePlans } from '~/composables/billing/usePlans'

/**
 * Landing page pricing section - Dark theme
 * Plan cards + comparison table
 * Fetches plans from API for up-to-date pricing
 */

const { plans, fetchPlans, comparisonFeatures } = usePlans()

// Fetch plans on mount
onMounted(() => {
  fetchPlans()
})

// Transform plans to the format expected by the template
const tiers = computed(() => plans.value.map(plan => ({
  name: plan.name ?? plan.tier,
  price: plan.price_label ?? `$${plan.price_monthly_cents ? plan.price_monthly_cents / 100 : 0}`,
  period: plan.period ?? (plan.price_monthly_cents === 0 ? 'Free forever' : 'per month'),
  description: plan.description,
  features: plan.feature_list ?? [],
  cta: plan.cta ?? 'Get started',
  ctaLink: plan.cta_link ?? '/login',
  highlighted: plan.highlighted ?? false,
})))

// Slice comparison features for preview (with fallback for loading state)
const previewFeatures = computed(() => (comparisonFeatures.value ?? []).slice(0, 5))
</script>

<template>
  <section
    id="plans"
    class="py-24 lg:py-32 bg-[#09090b] relative overflow-hidden"
  >

    <div class="relative max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
          Spend more time shipping, not configuring
        </h2>
        <p class="mt-4 text-lg text-zinc-400 leading-relaxed">
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
            ? 'bg-gradient-to-b from-teal-500/20 to-teal-600/5 ring-1 ring-teal-500/50 shadow-xl shadow-teal-500/10 scale-[1.02]'
            : 'bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50'"
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
            :to="tier.ctaLink"
            class="block w-full text-center py-3 text-sm font-semibold rounded-xl transition-all duration-200"
            :class="tier.highlighted
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:shadow-teal-500/30'
              : 'bg-white text-zinc-900 hover:bg-zinc-100'"
          >
            {{ tier.cta }}
          </NuxtLink>
        </div>
      </div>

      <!-- Comparison table with blur overlay -->
      <div class="mt-20 relative">
        <h3 class="text-xl font-semibold text-white mb-8">
          Compare plans
        </h3>

        <!-- Desktop table with blur -->
        <div class="hidden lg:block relative">
          <div class="overflow-hidden rounded-xl border border-zinc-800/50">
            <table class="w-full pointer-events-none">
              <thead>
                <tr class="border-b border-zinc-800/50 bg-zinc-900/30">
                  <th class="text-left py-4 px-4 text-sm font-medium text-zinc-500">
                    Feature
                  </th>
                  <th
                    v-for="tier in tiers"
                    :key="tier.name"
                    class="text-center py-4 px-4 text-sm font-semibold text-zinc-300"
                  >
                    {{ tier.name }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="feature in previewFeatures"
                  :key="feature.name"
                  class="border-b border-zinc-800/30"
                >
                  <td class="py-4 px-4 text-sm text-zinc-400">
                    {{ feature.name }}
                  </td>
                  <td class="text-center py-4 px-4">
                    <template v-if="typeof feature.foundation === 'boolean'">
                      <Icon
                        v-if="feature.foundation"
                        name="ph:check-bold"
                        class="w-4 h-4 text-emerald-500 mx-auto"
                      />
                      <span
                        v-else
                        class="text-zinc-700"
                      >—</span>
                    </template>
                    <span
                      v-else
                      class="text-sm text-zinc-300"
                    >{{ feature.foundation }}</span>
                  </td>
                  <td class="text-center py-4 px-4 bg-teal-500/5">
                    <template v-if="typeof feature.illuminate === 'boolean'">
                      <Icon
                        v-if="feature.illuminate"
                        name="ph:check-bold"
                        class="w-4 h-4 text-emerald-500 mx-auto"
                      />
                      <span
                        v-else
                        class="text-zinc-700"
                      >—</span>
                    </template>
                    <span
                      v-else
                      class="text-sm text-zinc-300"
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
                        class="text-zinc-700"
                      >—</span>
                    </template>
                    <span
                      v-else
                      class="text-sm text-zinc-300"
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
                        class="text-zinc-700"
                      >—</span>
                    </template>
                    <span
                      v-else
                      class="text-sm text-zinc-300"
                    >{{ feature.sanctum }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Blur overlay with CTA -->
          <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent backdrop-blur-[2px]">
            <div class="text-center py-8">
              <p class="text-zinc-400 mb-4">
                View detailed feature comparison
              </p>
              <NuxtLink
                to="/pricing"
                class="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-white text-zinc-900 rounded-xl hover:bg-zinc-100 transition-colors shadow-lg"
              >
                See all features
                <Icon
                  name="ph:arrow-right-bold"
                  class="w-4 h-4"
                />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Mobile CTA -->
        <div class="lg:hidden text-center py-8 px-6 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <p class="text-sm text-zinc-400 mb-4">
            Compare all features in detail
          </p>
          <NuxtLink
            to="/pricing"
            class="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-white text-zinc-900 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            View full pricing
            <Icon
              name="ph:arrow-right-bold"
              class="w-4 h-4"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- Bottom note -->
      <div class="mt-12 text-center">
        <p class="text-sm text-zinc-500">
          All plans include workspace-level controls and review history.
          <a
            href="#faq"
            class="text-teal-400 hover:text-teal-300 ml-1"
          >Learn more about billing</a>
        </p>
      </div>
    </div>
  </section>
</template>

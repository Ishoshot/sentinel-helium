<script setup lang="ts">
import { hasAuthPresenceCookie, syncAuthPresenceWithToken } from '~/services/core/api'
import { useWorkspaces } from '~/composables/workspace/useWorkspaces'
import { usePageSeo } from '~/composables/seo/usePageSeo'

/**
 * Landing page with hero section and floating UI mockups
 * Premium dark theme with teal accents
 */

definePageMeta({
  layout: false,
})

usePageSeo({
  title: 'Sentinel',
  description: 'The fastest way to ship quality code with confidence. AI-powered code reviews with instant PR analysis, custom guidelines, and BYOK AI providers.',
  path: '/',
})

useHead({
  htmlAttrs: {
    class: 'scroll-smooth bg-[#09090b]',
  },
  bodyAttrs: {
    class: 'bg-[#09090b]',
  },
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Sentinel',
        'url': 'https://usesentinel.ai',
        'logo': 'https://usesentinel.ai/apple-touch-icon.png',
        'sameAs': [
          'https://x.com/SentinelAIHQ',
          'https://github.com/ishoshot',
        ],
        'contactPoint': {
          '@type': 'ContactPoint',
          'email': 'hello@usesentinel.ai',
          'contactType': 'customer support',
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Sentinel',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Web',
        'offers': [
          { '@type': 'Offer', 'name': 'Foundation', 'price': '0', 'priceCurrency': 'USD' },
          { '@type': 'Offer', 'name': 'Illuminate', 'price': '20', 'priceCurrency': 'USD' },
          { '@type': 'Offer', 'name': 'Orchestrate', 'price': '50', 'priceCurrency': 'USD' },
          { '@type': 'Offer', 'name': 'Sanctum', 'price': '200', 'priceCurrency': 'USD' },
        ],
      }),
    },
  ],
})

const { fetchWorkspaces } = useWorkspaces()

const isAuthenticated = hasAuthPresenceCookie()

// Scroll-based header state
const scrolled = ref(false)

onMounted(() => {
  // Add scroll listener for header
  window.addEventListener('scroll', handleScroll)
  handleScroll()

  requestAnimationFrame(() => {
    const hasToken = syncAuthPresenceWithToken()
    if (isAuthenticated && hasToken) {
      void fetchWorkspaces()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  scrolled.value = window.scrollY > 20
}
</script>

<template>
  <div
    class="landing-dark min-h-screen overflow-x-hidden antialiased"
  >
    <!-- Navigation -->
    <LandingNav
      :scrolled="scrolled"
      :is-authenticated="isAuthenticated"
    />

    <!-- Hero Section -->
    <section class="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
      <!-- Subtle grid pattern -->
      <div
        class="landing-grid-pattern absolute inset-0 opacity-[0.03]"
      />

      <div class="relative max-w-8xl mx-auto px-6 my-10">
        <LandingHero :visible="true" />

        <!-- Floating UI Mockups -->
        <div class="mt-16 lg:mt-24 relative">
          <LandingMockup :visible="true" />
        </div>
      </div>
    </section>

    <!-- Logos Section -->
    <LandingLogos />

    <!-- Features Section -->
    <LandingFeatures />

    <!-- Architecture Section -->
    <LandingArchitecture />
    <LandingArchitectureMobile />

    <!-- How It Works Section -->
    <LandingHowItWorks />

    <!-- Languages Section -->
    <LandingLanguages />

    <!-- Testimonial Section -->
    <LandingTestimonial />

    <!-- Pricing Section -->
    <LandingPricing />

    <!-- FAQ Section -->
    <LandingFaq />

    <!-- Final CTA Section -->
    <LandingCta />

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>

<style scoped>
.landing-grid-pattern {
  background-image: linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 60px 60px;
}
</style>

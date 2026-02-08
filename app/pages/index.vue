<script setup lang="ts">
import { hasToken } from '~/services/core/api'
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

const router = useRouter()
const { workspaces, fetchWorkspaces } = useWorkspaces()

const isCheckingAuth = ref(true)
const isAuthenticated = ref(false)

// Scroll-based header state
const scrolled = ref(false)

// Animation states for staggered reveals
const heroVisible = ref(false)
const mockupVisible = ref(false)

onMounted(async () => {
  // Check if user has a token
  if (hasToken()) {
    isAuthenticated.value = true
    await fetchWorkspaces()
  }
  isCheckingAuth.value = false

  // Add scroll listener for header
  window.addEventListener('scroll', handleScroll)

  // Staggered animation reveals
  setTimeout(() => {
    heroVisible.value = true
  }, 100)

  setTimeout(() => {
    mockupVisible.value = true
  }, 400)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  scrolled.value = window.scrollY > 20
}
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="isCheckingAuth"
    class="landing-dark min-h-screen flex items-center justify-center"
  >
    <div class="flex flex-col items-center gap-4">
      <div class="w-8 h-8 border-2 border-zinc-800 border-t-teal-500 rounded-full animate-spin" />
      <span class="text-zinc-500 text-sm">Loading...</span>
    </div>
  </div>

  <!-- Landing page -->
  <div
    v-else
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
        class="absolute inset-0 opacity-[0.03]"
        style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 60px 60px;"
      />

      <div class="relative max-w-8xl mx-auto px-6 my-10">
        <LandingHero :visible="heroVisible" />

        <!-- Floating UI Mockups -->
        <div class="mt-16 lg:mt-24 relative">
          <LandingMockup :visible="mockupVisible" />
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

<script setup lang="ts">
import { hasToken } from '~/services/core/api'
import { useWorkspaces } from '~/composables/workspace/useWorkspaces'

/**
 * Landing page with hero section and floating UI mockups
 */

definePageMeta({
  layout: false,
})

useHead({
  htmlAttrs: {
    class: 'scroll-smooth',
  },
  bodyAttrs: {
    class: 'bg-[#fffff]',
  },
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
    class="landing-light min-h-screen flex items-center justify-center"
  >
    <div class="flex flex-col items-center gap-4">
      <div class="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      <span class="text-gray-500 text-sm">Loading...</span>
    </div>
  </div>

  <!-- Landing page -->
  <div
    v-else
    class="landing-light min-h-screen overflow-x-hidden antialiased"
  >
    <!-- Navigation -->
    <LandingNav
      :scrolled="scrolled"
      :is-authenticated="isAuthenticated"
    />

    <!-- Hero Section -->
    <section class="relative pt-24 lg:pt-32 pb-16 lg:pb-24 bg-white overflow-hidden">
      <!-- Subtle grid pattern -->
      <div
        class="absolute inset-0 opacity-[0.7]"
        style="background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 60px 60px;"
      />

      <div class="relative max-w-7xl mx-auto px-6 my-10">
        <LandingHero :visible="heroVisible" />

        <!-- Floating UI Mockups -->
        <div class="mt-16 lg:mt-24 relative">
          <LandingMockup :visible="mockupVisible" />
        </div>
      </div>
    </section>

    <!-- Logos Section -->
    <LandingLogos />

    <!-- Features Section (Light Background) -->
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

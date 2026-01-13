<script setup lang="ts">
import { hasToken } from '~/services/api'
import { useWorkspaces } from '~/composables/useWorkspaces'

/**
 * Landing page - Award-winning marketing page for Sentinel
 * Apple-inspired design: Light mode, grayscale-first, single accent color
 */

definePageMeta({
  layout: false,
})

useHead({
  htmlAttrs: {
    class: 'scroll-smooth',
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
    const sortedWorkspaces = [...workspaces.value].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const firstWorkspace = sortedWorkspaces[0]
    if (firstWorkspace) {
      router.push(`/${firstWorkspace.slug}`)
      return
    }
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
  }, 500)
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
    v-if="isCheckingAuth && isAuthenticated"
    class="min-h-screen bg-white flex items-center justify-center"
  >
    <div class="flex flex-col items-center gap-4">
      <div class="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      <span class="text-gray-500 text-sm">Loading...</span>
    </div>
  </div>

  <!-- Landing page -->
  <div
    v-else
    class="min-h-screen bg-white text-gray-900 overflow-x-hidden antialiased"
  >
    <!-- Navigation -->
    <LandingNav :scrolled="scrolled" />

    <!-- Hero Section -->
    <section class="relative pt-28 lg:pt-36 pb-16 lg:pb-24 overflow-hidden">
      <!-- Subtle gradient background -->
      <div class="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-white to-white pointer-events-none" />

      <div class="relative max-w-6xl mx-auto px-6">
        <LandingHero :visible="heroVisible" />
        <LandingMockup :visible="mockupVisible" />
      </div>
    </section>

    <!-- Logos Section -->
    <LandingLogos />

    <!-- Features Section -->
    <LandingFeatures />

    <!-- How It Works Section -->
    <LandingHowItWorks />

    <!-- Testimonial Section -->
    <LandingTestimonial />

    <!-- Pricing Section -->
    <LandingPricing />

    <!-- Final CTA Section -->
    <LandingCta />

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>

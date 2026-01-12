<script setup lang="ts">
/**
 * Landing page navigation header
 * Fixed position with scroll-based background change
 */

const props = defineProps<{
  scrolled: boolean
}>()

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    :class="props.scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'"
  >
    <div class="max-w-6xl mx-auto px-6">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
            <Icon
              name="ph:shield-check-bold"
              class="w-4 h-4 text-white"
            />
          </div>
          <span class="text-[15px] font-semibold tracking-tight">Sentinel</span>
        </div>

        <!-- Nav Links (Desktop) -->
        <nav class="hidden md:flex items-center gap-8">
          <a
            href="#features"
            class="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
          >Features</a>
          <a
            href="#how-it-works"
            class="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
          >How it works</a>
          <a
            href="#pricing"
            class="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
          >Pricing</a>
        </nav>

        <!-- CTA -->
        <div class="flex items-center gap-3">
          <button
            class="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Toggle navigation menu"
            @click="toggleMenu"
          >
            <Icon
              name="ph:list-bold"
              class="w-5 h-5"
            />
          </button>
          <NuxtLink
            to="/login"
            class="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 hidden sm:block px-3 py-2"
          >
            Sign in
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Get Started
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMenuOpen"
        class="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl"
      >
        <nav class="px-6 py-4 flex flex-col gap-3 text-sm text-gray-600">
          <a
            href="#features"
            class="hover:text-gray-900 transition-colors"
            @click="closeMenu"
          >Features</a>
          <a
            href="#how-it-works"
            class="hover:text-gray-900 transition-colors"
            @click="closeMenu"
          >How it works</a>
          <a
            href="#pricing"
            class="hover:text-gray-900 transition-colors"
            @click="closeMenu"
          >Pricing</a>
        </nav>
      </div>
    </Transition>
  </header>
</template>

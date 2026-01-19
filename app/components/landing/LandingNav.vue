<script setup lang="ts">
import { useWorkspaceStore } from '~/stores/useWorkspaceStore'

/**
 * Landing page navigation header - Light theme
 * Fixed position with scroll-based glassmorphism
 */

const props = defineProps<{
  scrolled: boolean
  isAuthenticated?: boolean
}>()

const workspaceStore = useWorkspaceStore()

const isMenuOpen = ref(false)

const navLinks = [
  { label: 'Product', href: '/#product' },
  { label: 'Workflow', href: '/#workflow' },
  { label: 'Pricing', href: '/#plans' },
  // { label: 'Privacy Policy', href: '/privacy' },
  // { label: 'FAQ', href: '/#faq' },
] satisfies ReadonlyArray<{ label: string; href: string }>

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

const dashboardUrl = computed(() => {
  if (!props.isAuthenticated) {
    return '/login'
  }

  // If there's a current workspace, use it
  if (workspaceStore.hasCurrentWorkspace) {
    return `/${workspaceStore.currentWorkspaceSlug}`
  }

  // Otherwise, try to get the first workspace from the list
  if (workspaceStore.workspaces.length > 0) {
    const sortedWorkspaces = [...workspaceStore.workspaces].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    const firstWorkspace = sortedWorkspaces.at(0)
    if (firstWorkspace) {
      return `/${firstWorkspace.slug}`
    }
  }

  // No workspaces found, redirect to workspace creation or login
  return '/login'
})

const ctaText = computed(() => {
  return props.isAuthenticated ? 'Dashboard' : 'Get Started'
})
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="props.scrolled
      ? 'bg-[var(--landing-bg-surface)]/80 backdrop-blur-xl border-b border-[var(--landing-border-subtle)]'
      : 'bg-transparent'"
  >
    <div class="max-w-6xl mx-auto px-6 py-2">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink
          :to="isAuthenticated ? dashboardUrl : '/'"
          class="flex items-center group"
        >
          <SentinelLogo size="lg" />
        </NuxtLink>

        <!-- Nav Links (Desktop) -->
        <nav class="hidden md:flex items-center gap-10">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="text-sm transition-colors duration-200"
            :class="props.scrolled
              ? 'text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]'
              : 'text-gray-600 hover:text-gray-900'"
          >{{ link.label }}</a>
            <a 
            class="text-sm transition-colors duration-200"
            :class="props.scrolled
              ? 'text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]'
              : 'text-gray-600 hover:text-gray-900'" href="https://dev.usesentinel.ai/privacy">Privacy Policy</a>
        </nav>

        <!-- CTA -->
        <div class="flex items-center gap-3">
          <button
            class="md:hidden p-2 transition-colors"
            :class="props.scrolled
              ? 'text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]'
              : 'text-gray-600 hover:text-gray-900'"
            aria-label="Toggle navigation menu"
            @click="toggleMenu"
          >
            <Icon
              name="ph:list-bold"
              class="w-5 h-5"
            />
          </button>
          <NuxtLink
            v-if="!isAuthenticated"
            to="/login"
            class="hidden sm:block px-3 py-2 text-sm transition-colors duration-200"
            :class="props.scrolled
              ? 'text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]'
              : 'text-gray-600 hover:text-gray-900'"
          >
            Sign in
          </NuxtLink>
          <NuxtLink
            :to="dashboardUrl"
            class="landing-btn-primary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg"
          >
            {{ ctaText }}
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
        class="md:hidden border-t border-[var(--landing-border-subtle)] bg-[var(--landing-bg-surface)]/95 backdrop-blur-xl"
      >
        <nav class="px-6 py-4 flex flex-col gap-3 text-sm text-[var(--landing-text-secondary)]">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="hover:text-[var(--landing-text-primary)] transition-colors py-2"
            @click="closeMenu"
          >{{ link.label }}</a>
        </nav>
      </div>
    </Transition>
  </header>
</template>

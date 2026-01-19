<script setup lang="ts">
/**
 * Getting Started Panel
 * Slides in from the right, shows installation and setup guide
 */

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

function handleClose() {
  emit('close')
}

const steps = [
  {
    title: 'Connect GitHub',
    description: 'Connect your GitHub account to start reviewing pull requests',
    icon: 'lucide:github',
    completed: false,
  },
  {
    title: 'Install GitHub App',
    description: 'Install the Sentinel GitHub App on your repositories',
    icon: 'lucide:download',
    completed: false,
  },
  {
    title: 'Configure Repositories',
    description: 'Select which repositories you want Sentinel to review',
    icon: 'lucide:settings',
    completed: false,
  },
  {
    title: 'Set up Provider Keys (Optional)',
    description: 'Bring your own API keys for AI providers to control costs',
    icon: 'lucide:key',
    completed: false,
  },
]
</script>

<template>
  <!-- Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="props.isOpen"
      class="fixed inset-0 bg-black/50 z-40"
      @click="handleClose"
    />
  </Transition>

  <!-- Side Panel -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-300 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="props.isOpen"
      class="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-bg-elevated border-l border-border-subtle shadow-2xl z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
        <div>
          <h2 class="text-lg font-semibold text-text-primary">
            Getting Started
          </h2>
          <p class="text-sm text-text-secondary mt-0.5">
            Set up Sentinel in minutes
          </p>
        </div>
        <button
          type="button"
          class="p-2 hover:bg-bg-surface rounded-lg transition-colors"
          @click="handleClose"
        >
          <Icon
            name="lucide:x"
            class="w-5 h-5 text-text-secondary"
          />
        </button>
      </div>

      <!-- Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <!-- Welcome Section -->
        <div class="mb-8">
          <div class="w-12 h-12 rounded-lg bg-accent-light flex items-center justify-center mb-4">
            <Icon
              name="lucide:sparkles"
              class="w-6 h-6 text-accent"
            />
          </div>
          <h3 class="text-base font-semibold text-text-primary mb-2">
            Welcome to Sentinel!
          </h3>
          <p class="text-sm text-text-secondary leading-relaxed">
            Get AI-powered code reviews automatically on every pull request. Follow these steps to complete your setup.
          </p>
        </div>

        <!-- Steps -->
        <div class="space-y-4 mb-8">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="relative"
          >
            <!-- Connector Line (except for last item) -->
            <div
              v-if="index < steps.length - 1"
              class="absolute left-6 top-12 bottom-0 w-px bg-border-subtle"
            />

            <div class="flex gap-4">
              <!-- Step Icon -->
              <div
                class="relative flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                :class="step.completed ? 'bg-success-light' : 'bg-bg-surface'"
              >
                <Icon
                  v-if="step.completed"
                  name="lucide:check"
                  class="w-5 h-5 text-success"
                />
                <Icon
                  v-else
                  :name="step.icon"
                  class="w-5 h-5 text-text-muted"
                />
              </div>

              <!-- Step Content -->
              <div class="flex-1 pt-1">
                <h4 class="text-sm font-semibold text-text-primary mb-1">
                  {{ step.title }}
                </h4>
                <p class="text-sm text-text-secondary leading-relaxed">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-text-primary mb-3">
            Quick Links
          </h4>

          <NuxtLink
            to="/"
            class="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:border-border-muted hover:bg-bg-surface transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-bg-surface flex items-center justify-center">
                <Icon
                  name="lucide:github"
                  class="w-4 h-4 text-text-muted"
                />
              </div>
              <span class="text-sm font-medium text-text-primary">Connect GitHub</span>
            </div>
            <Icon
              name="lucide:arrow-right"
              class="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors"
            />
          </NuxtLink>

          <NuxtLink
            to="/"
            class="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:border-border-muted hover:bg-bg-surface transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-bg-surface flex items-center justify-center">
                <Icon
                  name="lucide:book-open"
                  class="w-4 h-4 text-text-muted"
                />
              </div>
              <span class="text-sm font-medium text-text-primary">View Documentation</span>
            </div>
            <Icon
              name="lucide:arrow-right"
              class="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors"
            />
          </NuxtLink>

          <NuxtLink
            to="/"
            class="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:border-border-muted hover:bg-bg-surface transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-bg-surface flex items-center justify-center">
                <Icon
                  name="lucide:life-buoy"
                  class="w-4 h-4 text-text-muted"
                />
              </div>
              <span class="text-sm font-medium text-text-primary">Get Help</span>
            </div>
            <Icon
              name="lucide:arrow-right"
              class="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-border-subtle bg-bg-surface">
        <p class="text-xs text-text-muted text-center">
          Need help? <a
            href="mailto:hello@usesentinel.ai"
            class="text-accent hover:text-accent-hover"
          >Contact support</a>
        </p>
      </div>
    </div>
  </Transition>
</template>

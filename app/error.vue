<script setup lang="ts">
import type { NuxtError } from '#app'

/**
 * Global error page - handles all unhandled errors
 * Elevated, immersive error experience with ambient visuals
 */

interface Props {
  error: NuxtError
}

const props = defineProps<Props>()

// Error configuration based on status code
const errorConfig = computed(() => {
  const status = props.error.statusCode || 500

  const configs: Record<number, {
    code: string
    title: string
    subtitle: string
    description: string
    action: 'home' | 'back' | 'signin' | 'retry'
    actionLabel: string
    secondaryAction?: 'back' | 'home'
  }> = {
    400: {
      code: '400',
      title: 'Bad Request',
      subtitle: 'Something doesn\'t add up',
      description: 'The request couldn\'t be processed. Double-check your input and give it another shot.',
      action: 'back',
      actionLabel: 'Go Back',
      secondaryAction: 'home',
    },
    401: {
      code: '401',
      title: 'Session Expired',
      subtitle: 'Time to sign back in',
      description: 'Your session has ended. Sign in again to pick up where you left off.',
      action: 'signin',
      actionLabel: 'Sign In',
    },
    403: {
      code: '403',
      title: 'Access Denied',
      subtitle: 'This area is off-limits',
      description: 'You don\'t have permission to view this page. If this seems wrong, reach out to your workspace admin.',
      action: 'back',
      actionLabel: 'Go Back',
      secondaryAction: 'home',
    },
    404: {
      code: '404',
      title: 'Page Not Found',
      subtitle: 'Lost in the void',
      description: 'The page you\'re looking for doesn\'t exist or has been moved somewhere else.',
      action: 'home',
      actionLabel: 'Back to Home',
      secondaryAction: 'back',
    },
    422: {
      code: '422',
      title: 'Invalid Data',
      subtitle: 'Something\'s not quite right',
      description: 'The information provided couldn\'t be validated. Please review and try again.',
      action: 'back',
      actionLabel: 'Go Back',
    },
    429: {
      code: '429',
      title: 'Slow Down',
      subtitle: 'Too many requests',
      description: 'You\'ve hit the rate limit. Take a breather and try again in a moment.',
      action: 'retry',
      actionLabel: 'Try Again',
    },
    500: {
      code: '500',
      title: 'Server Error',
      subtitle: 'Something broke on our end',
      description: 'We\'re experiencing technical difficulties. Our team has been notified and is working on it.',
      action: 'retry',
      actionLabel: 'Try Again',
      secondaryAction: 'home',
    },
    502: {
      code: '502',
      title: 'Bad Gateway',
      subtitle: 'Connection lost',
      description: 'We\'re having trouble reaching our servers. Please try again in a few minutes.',
      action: 'retry',
      actionLabel: 'Try Again',
      secondaryAction: 'home',
    },
    503: {
      code: '503',
      title: 'Maintenance',
      subtitle: 'We\'ll be right back',
      description: 'Sentinel is undergoing scheduled maintenance. Thanks for your patience.',
      action: 'retry',
      actionLabel: 'Refresh',
    },
  }

  return configs[status] ?? configs[500]!
})

// Custom message from error if available
const errorMessage = computed(() => {
  if (props.error.message && props.error.message !== props.error.statusMessage) {
    return props.error.message
  }
  return null
})

// Handle navigation
function handlePrimaryAction() {
  switch (errorConfig.value.action) {
    case 'home':
      clearError({ redirect: '/' })
      break
    case 'back':
      if (window.history.length > 1) {
        window.history.back()
      } else {
        clearError({ redirect: '/' })
      }
      break
    case 'signin':
      clearError({ redirect: '/login' })
      break
    case 'retry':
      clearError()
      window.location.reload()
      break
  }
}

function handleSecondaryAction() {
  if (errorConfig.value.secondaryAction === 'back') {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      clearError({ redirect: '/' })
    }
  } else {
    clearError({ redirect: '/' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg-app relative overflow-hidden">
    <!-- Ambient background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Gradient orbs -->
      <div class="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full blur-3xl animate-float-slow" />
      <div class="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/3 rounded-full blur-3xl animate-float-slower" />
      
      <!-- Grid pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
    </div>

    <!-- Content -->
    <div class="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <!-- Error code - Large ambient number -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
        <span class="text-[20rem] sm:text-[28rem] font-bold text-text-primary/[0.02] leading-none tracking-tighter">
          {{ errorConfig.code }}
        </span>
      </div>

      <!-- Main content -->
      <div class="relative z-10 max-w-md w-full text-center">
        <!-- Status badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border-subtle mb-8">
          <span class="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span class="text-xs font-medium text-text-muted uppercase tracking-wider">
            Error {{ error.statusCode }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl font-bold text-text-primary mb-3 tracking-tight">
          {{ errorConfig.title }}
        </h1>

        <!-- Subtitle -->
        <p class="text-lg text-text-secondary mb-6">
          {{ errorConfig.subtitle }}
        </p>

        <!-- Description -->
        <p class="text-text-muted mb-8 max-w-sm mx-auto leading-relaxed">
          {{ errorConfig.description }}
        </p>

        <!-- Custom error message -->
        <div
          v-if="errorMessage"
          class="mb-8 p-4 rounded-xl bg-bg-elevated border border-border-subtle"
        >
          <p class="text-sm text-text-muted font-mono break-all">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <BaseButton
            size="lg"
            @click="handlePrimaryAction"
          >
            {{ errorConfig.actionLabel }}
          </BaseButton>

          <BaseButton
            v-if="errorConfig.secondaryAction"
            variant="secondary"
            size="lg"
            @click="handleSecondaryAction"
          >
            {{ errorConfig.secondaryAction === 'back' ? 'Go Back' : 'Back to Home' }}
          </BaseButton>
        </div>

        <!-- Help link for server errors -->
        <p
          v-if="error.statusCode && error.statusCode >= 500"
          class="mt-10 text-sm text-text-muted"
        >
          Problem persists?
          <a
            href="mailto:support@sentinel.dev"
            class="text-accent hover:text-accent-hover transition-default underline underline-offset-2"
          >
            Contact support
          </a>
        </p>
      </div>

      <!-- Footer branding -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div class="flex items-center gap-2 text-text-muted/50">
          <div class="w-5 h-5 bg-text-muted/20 rounded flex items-center justify-center">
            <Icon
              name="lucide:shield-check"
              class="w-3 h-3"
            />
          </div>
          <span class="text-xs font-medium tracking-wide">SENTINEL</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float-slow {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(30px, -30px);
  }
}

@keyframes float-slower {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-20px, 20px);
  }
}

.animate-float-slow {
  animation: float-slow 20s ease-in-out infinite;
}

.animate-float-slower {
  animation: float-slower 25s ease-in-out infinite;
}
</style>

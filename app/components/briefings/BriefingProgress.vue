<script setup lang="ts">
import { BriefingGenerationStatus } from "~/types";

interface Props {
  progress: number;
  message?: string | null;
  status?: BriefingGenerationStatus;
  variant?: "inline" | "card" | "fullscreen";
}

const props = withDefaults(defineProps<Props>(), {
  message: null,
  status: BriefingGenerationStatus.Processing,
  variant: "card",
});

// Smooth progress animation
const displayProgress = ref(0);

watch(
  () => props.progress,
  (newProgress) => {
    // Animate to new progress value
    const start = displayProgress.value;
    const end = newProgress;
    const duration = 500;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      displayProgress.value = start + (end - start) * eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  },
  { immediate: true }
);

// Status-specific styling
const isPending = computed(() => props.status === BriefingGenerationStatus.Pending);
const isProcessing = computed(() => props.status === BriefingGenerationStatus.Processing);
const isComplete = computed(() => props.status === BriefingGenerationStatus.Completed);
const isFailed = computed(() => props.status === BriefingGenerationStatus.Failed);

// Progress bar color
const progressColor = computed(() => {
  if (isFailed.value) return "bg-error";
  if (isComplete.value) return "bg-success";
  return "bg-accent";
});

// Animated dots for pending state
const dots = ref("...");
let dotsInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  dotsInterval = setInterval(() => {
    dots.value = dots.value.length >= 3 ? "." : dots.value + ".";
  }, 500);
});

onUnmounted(() => {
  if (dotsInterval) clearInterval(dotsInterval);
});

// Progress steps for visual interest
const progressSteps = computed(() => {
  const steps = [
    { threshold: 0, label: "Starting", icon: "lucide:play" },
    { threshold: 15, label: "Collecting data", icon: "lucide:database" },
    { threshold: 35, label: "Analyzing patterns", icon: "lucide:search" },
    { threshold: 55, label: "Generating narrative", icon: "lucide:pen-tool" },
    { threshold: 75, label: "Adding achievements", icon: "lucide:trophy" },
    { threshold: 90, label: "Finalizing", icon: "lucide:check-circle" },
  ];

  return steps.map((step) => ({
    ...step,
    isActive: displayProgress.value >= step.threshold,
    isCurrent:
      displayProgress.value >= step.threshold &&
      (steps.find((s) => s.threshold > step.threshold)?.threshold ?? 100) > displayProgress.value,
  }));
});

const currentStep = computed(() => {
  return progressSteps.value.filter((s) => s.isCurrent)[0] ?? progressSteps.value[0];
});
</script>

<template>
  <!-- Inline variant -->
  <div
    v-if="variant === 'inline'"
    class="flex items-center gap-3"
  >
    <div class="flex-1 h-2 bg-bg-surface rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="progressColor"
        :style="{ width: `${displayProgress}%` }"
      />
    </div>
    <span class="text-sm text-text-muted tabular-nums">
      {{ Math.round(displayProgress) }}%
    </span>
  </div>

  <!-- Card variant -->
  <div
    v-else-if="variant === 'card'"
    class="rounded-2xl border border-border-subtle bg-bg-elevated p-6"
  >
    <!-- Status header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <!-- Animated spinner/icon -->
        <div
          class="relative w-10 h-10 rounded-xl flex items-center justify-center"
          :class="[
            isComplete ? 'bg-success/10 text-success' :
            isFailed ? 'bg-error/10 text-error' :
            'bg-accent/10 text-accent'
          ]"
        >
          <Icon
            v-if="isComplete"
            name="lucide:check"
            class="w-5 h-5"
          />
          <Icon
            v-else-if="isFailed"
            name="lucide:x"
            class="w-5 h-5"
          />
          <Icon
            v-else
            :name="currentStep?.icon ?? 'lucide:loader-2'"
            class="w-5 h-5"
            :class="{ 'animate-spin': isPending || isProcessing }"
          />

          <!-- Pulse ring for active state -->
          <div
            v-if="isProcessing"
            class="absolute inset-0 rounded-xl bg-accent/20 animate-ping"
          />
        </div>

        <div>
          <h3 class="font-semibold text-text-primary">
            <template v-if="isPending">
              Queued{{ dots }}
            </template>
            <template v-else-if="isProcessing">
              {{ currentStep?.label ?? 'Generating' }}{{ dots }}
            </template>
            <template v-else-if="isComplete">
              Ready to view
            </template>
            <template v-else-if="isFailed">
              Generation failed
            </template>
          </h3>
          <p
            v-if="message && !isComplete"
            class="text-sm text-text-muted"
          >
            {{ message }}
          </p>
        </div>
      </div>

      <!-- Progress percentage -->
      <div
        v-if="!isComplete && !isFailed"
        class="text-2xl font-semibold text-text-primary tabular-nums"
      >
        {{ Math.round(displayProgress) }}<span class="text-text-muted text-lg">%</span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="relative h-3 bg-bg-surface rounded-full overflow-hidden mb-4">
      <!-- Background shimmer -->
      <div
        v-if="isProcessing"
        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
      />

      <!-- Progress fill -->
      <div
        class="relative h-full rounded-full transition-all duration-300"
        :class="progressColor"
        :style="{ width: `${displayProgress}%` }"
      >
        <!-- Animated gradient overlay -->
        <div
          v-if="isProcessing"
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
        />
      </div>
    </div>

    <!-- Progress steps -->
    <div class="flex justify-between">
      <div
        v-for="(step, index) in progressSteps"
        :key="step.threshold"
        class="flex flex-col items-center"
      >
        <div
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="[
            step.isActive ? progressColor : 'bg-bg-surface',
            step.isCurrent && 'ring-4 ring-accent/20'
          ]"
        />
        <span
          v-if="index === 0 || index === progressSteps.length - 1"
          class="mt-2 text-xs text-text-muted"
        >
          {{ index === 0 ? 'Start' : 'Done' }}
        </span>
      </div>
    </div>
  </div>

  <!-- Fullscreen variant (for generation page) -->
  <div
    v-else-if="variant === 'fullscreen'"
    class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
  >
    <!-- Large animated icon -->
    <div class="relative mb-8">
      <div
        class="w-24 h-24 rounded-3xl flex items-center justify-center"
        :class="[
          isComplete ? 'bg-success/10 text-success' :
          isFailed ? 'bg-error/10 text-error' :
          'bg-accent/10 text-accent'
        ]"
      >
        <Icon
          v-if="isComplete"
          name="lucide:check"
          class="w-12 h-12"
        />
        <Icon
          v-else-if="isFailed"
          name="lucide:x"
          class="w-12 h-12"
        />
        <Icon
          v-else
          :name="currentStep?.icon ?? 'lucide:sparkles'"
          class="w-12 h-12"
        />
      </div>

      <!-- Animated rings -->
      <div
        v-if="isProcessing"
        class="absolute inset-0"
      >
        <div class="absolute inset-0 rounded-3xl border-2 border-accent/30 animate-ping" />
        <div
          class="progress-ring-delay absolute inset-0 rounded-3xl border-2 border-accent/20 animate-ping"
        />
      </div>
    </div>

    <!-- Status text -->
    <h2 class="text-2xl font-semibold text-text-primary mb-2">
      <template v-if="isPending">
        Preparing your briefing{{ dots }}
      </template>
      <template v-else-if="isProcessing">
        {{ currentStep?.label ?? 'Creating your briefing' }}{{ dots }}
      </template>
      <template v-else-if="isComplete">
        Your briefing is ready!
      </template>
      <template v-else-if="isFailed">
        Something went wrong
      </template>
    </h2>

    <p
      v-if="message"
      class="text-text-secondary mb-8 max-w-md"
    >
      {{ message }}
    </p>

    <!-- Wide progress bar -->
    <div class="w-full max-w-md mb-4">
      <div class="relative h-4 bg-bg-surface rounded-full overflow-hidden">
        <div
          v-if="isProcessing"
          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
        />
        <div
          class="relative h-full rounded-full transition-all duration-500"
          :class="progressColor"
          :style="{ width: `${displayProgress}%` }"
        />
      </div>
    </div>

    <!-- Progress number -->
    <div
      v-if="!isComplete && !isFailed"
      class="text-4xl font-bold text-text-primary tabular-nums mb-2"
    >
      {{ Math.round(displayProgress) }}%
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

.progress-ring-delay {
  animation-delay: 0.5s;
}
</style>

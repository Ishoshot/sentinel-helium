<script setup lang="ts">
import {
  architectureLayers as layers,
  architectureStats,
  badgeColors,
  statusColors,
} from '~/composables/landing/useArchitectureData'

/**
 * Landing page architecture visualization (Mobile)
 * Shows the Sentinel review pipeline with interactive cards
 */
</script>

<template>
  <section class="lg:hidden py-24 bg-slate-50 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
          Built for reliability at scale
        </h2>
        <p class="mt-4 text-lg text-slate-600 leading-relaxed">
          A complete review pipeline from webhook to annotation. Every step designed for speed, accuracy, and transparency.
        </p>
      </div>

      <!-- Architecture visualization -->
      <div class="relative">
        <!-- Background grid pattern -->
        <div
          class="absolute inset-0 opacity-50"
          style="background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 20px 20px;"
        />

        <!-- Connection lines (SVG overlay) -->
        <svg
          class="absolute inset-0 w-full h-full pointer-events-none z-0"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
              <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.3" />
            </linearGradient>
          </defs>
          <!-- Horizontal flow line -->
          <line
            x1="10%"
            y1="50%"
            x2="90%"
            y2="50%"
            stroke="url(#lineGradient)"
            stroke-width="2"
            stroke-dasharray="8 4"
            class="animate-pulse"
          />
        </svg>

        <!-- Layers grid -->
        <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          <!-- Each layer column -->
          <div
            v-for="(layer, layerIndex) in layers"
            :key="layer.title"
            class="space-y-4"
          >
            <!-- Layer title -->
            <div class="flex items-center gap-2 mb-6">
              <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                {{ layerIndex + 1 }}
              </div>
              <span class="text-sm font-semibold text-slate-500 uppercase tracking-wider">{{ layer.title }}</span>
            </div>

            <!-- Cards in this layer -->
            <div
              v-for="(item, itemIndex) in layer.items"
              :key="item.id"
              class="architecture-card group relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-300 hover:scale-[1.02]"
              :style="{ animationDelay: `${(layerIndex * 200) + (itemIndex * 100)}ms` }"
            >

              <!-- Card header -->
              <div class="relative px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <Icon
                      :name="item.icon"
                      class="w-4 h-4 text-slate-600"
                    />
                  </div>
                  <span class="text-sm font-semibold text-slate-900">{{ item.title }}</span>
                </div>
                <span
                  class="px-2 py-0.5 text-[10px] font-semibold rounded-full border"
                  :class="badgeColors[item.badgeColor]"
                >
                  {{ item.badge }}
                </span>
              </div>

              <!-- Card content -->
              <div class="relative p-4 space-y-2">
                <div
                  v-for="row in item.rows"
                  :key="row.label"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="text-slate-500 flex items-center gap-2">
                    <Icon
                      name="ph:caret-right"
                      class="w-3 h-3 text-slate-300"
                    />
                    {{ row.label }}
                  </span>
                  <span class="flex items-center gap-2 text-slate-700 font-medium">
                    {{ row.value }}
                    <span
                      v-if="row.status"
                      class="w-1.5 h-1.5 rounded-full"
                      :class="statusColors[row.status]"
                    />
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Flow arrows between columns (desktop only) -->
        <div class="hidden xl:flex absolute top-1/2 left-0 right-0 -translate-y-1/2 justify-around px-[12%] pointer-events-none z-20">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center"
          >
            <div class="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <Icon
                name="ph:arrow-right-bold"
                class="w-4 h-4 text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom stats -->
      <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-slate-900">< 30s</div>
          <div class="text-sm text-slate-500 mt-1">Avg review time</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-slate-900">99.9%</div>
          <div class="text-sm text-slate-500 mt-1">Uptime SLA</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-slate-900">6</div>
          <div class="text-sm text-slate-500 mt-1">AI providers</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-slate-900">BYOK</div>
          <div class="text-sm text-slate-500 mt-1">Your API keys</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.architecture-card {
  animation: fadeInUp 0.3s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered floating animation for cards */
.architecture-card:nth-child(odd) {
  animation: fadeInUp 0.3s ease-out forwards, subtleFloat 3s ease-in-out infinite;
  animation-delay: var(--delay, 0ms), 0.5s;
}

.architecture-card:nth-child(even) {
  animation: fadeInUp 0.3s ease-out forwards, subtleFloatAlt 4s ease-in-out infinite;
  animation-delay: var(--delay, 0ms), 0.8s;
}

@keyframes subtleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes subtleFloatAlt {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* Override float on hover for lift effect */
.architecture-card:hover {
  animation-play-state: paused;
}
</style>

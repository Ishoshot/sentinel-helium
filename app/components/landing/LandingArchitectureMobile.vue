<script setup lang="ts">
import {
  architectureLayers as layers,
  architectureStats,
  statusColors,
} from '~/composables/landing/useArchitectureData'

/**
 * Landing page architecture visualization (Mobile) - Dark theme
 * Shows the Sentinel review pipeline with interactive cards
 */

// Dark badge colors
const darkBadgeColors: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  slate: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
}

const darkStatusColors: Record<string, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
}
</script>

<template>
  <section class="lg:hidden py-24 bg-[#09090b] overflow-hidden">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
          Built for reliability at scale
        </h2>
        <p class="mt-4 text-lg text-zinc-400 leading-relaxed">
          A complete review pipeline from webhook to annotation. Every step designed for speed, accuracy, and transparency.
        </p>
      </div>

      <!-- Architecture visualization -->
      <div class="relative">
        <!-- Background grid pattern -->
        <div
          class="absolute inset-0 opacity-[0.02]"
          style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 20px 20px;"
        />

        <!-- Connection lines (SVG overlay) -->
        <svg
          class="absolute inset-0 w-full h-full pointer-events-none z-0"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="lineGradientDark"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stop-color="#14b8a6"
                stop-opacity="0.3"
              />
              <stop
                offset="50%"
                stop-color="#06b6d4"
                stop-opacity="0.5"
              />
              <stop
                offset="100%"
                stop-color="#10b981"
                stop-opacity="0.3"
              />
            </linearGradient>
          </defs>
          <!-- Horizontal flow line -->
          <line
            x1="10%"
            y1="50%"
            x2="90%"
            y2="50%"
            stroke="url(#lineGradientDark)"
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
              <div class="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                {{ layerIndex + 1 }}
              </div>
              <span class="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{{ layer.title }}</span>
            </div>

            <!-- Cards in this layer -->
            <div
              v-for="(item, itemIndex) in layer.items"
              :key="item.id"
              class="architecture-card-mobile cursor-pointer group relative bg-[#111113] rounded-xl border border-zinc-800/50 shadow-lg shadow-black/20 overflow-hidden transition-all duration-300 hover:border-zinc-700/50 hover:scale-[1.02]"
              :style="{ animationDelay: `${(layerIndex * 200) + (itemIndex * 100)}ms` }"
            >
              <!-- Card header -->
              <div class="relative px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                    <Icon
                      :name="item.icon"
                      class="w-4 h-4 text-zinc-400"
                    />
                  </div>
                  <span class="text-sm font-semibold text-white">{{ item.title }}</span>
                </div>
                <span
                  class="px-2 py-0.5 text-[10px] font-semibold rounded-full border"
                  :class="darkBadgeColors[item.badgeColor]"
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
                  <span class="text-zinc-500 flex items-center gap-2">
                    <Icon
                      name="ph:caret-right"
                      class="w-3 h-3 text-zinc-600"
                    />
                    {{ row.label }}
                  </span>
                  <span class="flex items-center gap-2 text-zinc-300 font-medium">
                    {{ row.value }}
                    <span
                      v-if="row.status"
                      class="w-1.5 h-1.5 rounded-full"
                      :class="darkStatusColors[row.status]"
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
            <div class="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 shadow-lg flex items-center justify-center">
              <Icon
                name="ph:arrow-right-bold"
                class="w-4 h-4 text-zinc-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom stats -->
      <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-white">
            &lt; 30s
          </div>
          <div class="text-sm text-zinc-500 mt-1">
            Avg review time
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white">
            99.9%
          </div>
          <div class="text-sm text-zinc-500 mt-1">
            Uptime SLA
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white">
            6
          </div>
          <div class="text-sm text-zinc-500 mt-1">
            AI providers
          </div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white">
            BYOK
          </div>
          <div class="text-sm text-zinc-500 mt-1">
            Your API keys
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.architecture-card-mobile {
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
.architecture-card-mobile:nth-child(odd) {
  animation: fadeInUp 0.3s ease-out forwards, subtleFloat 3s ease-in-out infinite;
  animation-delay: var(--delay, 0ms), 0.5s;
}

.architecture-card-mobile:nth-child(even) {
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
.architecture-card-mobile:hover {
  animation-play-state: paused;
}
</style>

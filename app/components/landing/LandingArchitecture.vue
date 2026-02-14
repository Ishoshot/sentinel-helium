<script setup lang="ts">
import {
  architectureLayers,
  architectureStats,
  colorConfig,
  cardActions,
  cardPositions,
  type ArchitectureRow,
} from '~/composables/landing/useArchitectureData'

/**
 * Landing page architecture visualization (Desktop) - Dark theme
 * Isometric 3D view matching Laravel Cloud's design
 */

type CardColor = 'blue' | 'amber' | 'cyan' | 'emerald' | 'rose'

interface DesktopCard {
  id: string
  title: string
  badge: { text: string; color: CardColor }
  color: CardColor
  position: { col: number; row: number; z: number }
  hasStripes: boolean
  rows: ArchitectureRow[]
  action?: string
}

// Map badge colors to card colors for desktop view
const badgeToCardColor: Record<string, CardColor> = {
  blue: 'blue',
  slate: 'blue',
  amber: 'amber',
  purple: 'amber',
  cyan: 'emerald',
  emerald: 'emerald',
  rose: 'rose',
  indigo: 'rose',
}

// Build desktop cards from shared data
const cards: DesktopCard[] = architectureLayers.flatMap(layer =>
  layer.items.map(item => ({
    id: item.id,
    title: item.title,
    badge: { text: item.badge, color: badgeToCardColor[item.badgeColor] ?? 'blue' },
    color: badgeToCardColor[item.badgeColor] ?? 'blue',
    position: cardPositions[item.id] ?? { col: 1, row: 1, z: 0 },
    hasStripes: true,
    rows: item.rows,
    action: cardActions[item.id],
  }))
)

// Group cards by column
const columns = [1, 2, 3, 4].map(col => ({
  id: col,
  cards: cards.filter(c => c.position.col === col),
}))

// Dark theme color config
const darkColorConfig: Record<CardColor, { border: string; badge: string; stripe: string }> = {
  blue: { border: 'border-l-blue-500', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30', stripe: 'rgba(59, 130, 246, 0.3)' },
  amber: { border: 'border-l-amber-500', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', stripe: 'rgba(245, 158, 11, 0.3)' },
  cyan: { border: 'border-l-cyan-500', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', stripe: 'rgba(6, 182, 212, 0.3)' },
  emerald: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', stripe: 'rgba(16, 185, 129, 0.3)' },
  rose: { border: 'border-l-rose-500', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30', stripe: 'rgba(244, 63, 94, 0.3)' },
}
</script>

<template>
  <section class="hidden lg:block relative py-24 lg:py-32 overflow-hidden bg-[#09090b]">
    <!-- Dot grid background -->
    <div class="absolute inset-0 dot-grid-dark opacity-50" />

    <div class="relative z-10 max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="animate-fade-in-up [animation-fill-mode:both] text-center max-w-3xl mx-auto mb-20">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
          Built for reliability at scale
        </h2>
        <p class="mt-4 text-lg text-zinc-400 leading-relaxed">
          A complete review pipeline from webhook to annotation. Every step designed for speed, accuracy, and transparency.
        </p>
      </div>

      <!-- 3D Architecture -->
      <div class="architecture-wrapper">
        <div class="architecture-scene">
          <div class="architecture-stage-dark">
            <!-- Columns -->
            <div
              v-for="column in columns"
              :key="column.id"
              class="architecture-column animate-fade-in-up [animation-fill-mode:both]"
              :style="{
                '--col': column.id,
                '--col-z': `${(column.id - 1) * 25}px`,
                animationDelay: `${120 + ((column.id - 1) * 100)}ms`,
              }"
            >
              <!-- Cards -->
              <div
                v-for="card in column.cards"
                :key="card.id"
                class="card-wrapper"
                :style="{
                  '--card-z': `${card.position.z}px`,
                }"
              >
                <div
                  class="architecture-card-dark cursor-pointer"
                  :class="darkColorConfig[card.color]?.border"
                >
                  <!-- Stripe pattern -->
                  <div
                    v-if="card.hasStripes"
                    class="card-stripes-dark"
                    :style="{ '--stripe-color': darkColorConfig[card.color]?.stripe }"
                  />

                  <!-- Header -->
                  <div class="card-header-dark">
                    <div class="flex items-center gap-2">
                      <span class="card-title-dark">{{ card.title }}</span>
                      <span
                        v-if="card.badge"
                        class="card-badge-dark"
                        :class="darkColorConfig[card.badge.color]?.badge"
                      >
                        <Icon
                          name="ph:squares-four"
                          class="w-3 h-3"
                        />
                        {{ card.badge!.text }}
                      </span>
                    </div>
                    <button class="card-menu-dark">
                      <Icon
                        name="ph:dots-three"
                        class="w-5 h-5"
                      />
                    </button>
                  </div>

                  <!-- Body -->
                  <div class="card-body-dark">
                    <div
                      v-for="row in card.rows"
                      :key="row.label"
                      class="card-row-dark"
                    >
                      <div class="row-left-dark">
                        <Icon
                          :name="row.icon"
                          class="w-4 h-4 text-zinc-500"
                        />
                        <span class="row-label-dark">{{ row.label }}</span>
                      </div>
                      <div class="row-right-dark">
                        <span class="row-value-dark">{{ row.value }}</span>
                        <span
                          v-if="row.status"
                          class="status-dot"
                          :class="row.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Action -->
                  <button
                    v-if="card.action"
                    class="card-action-dark"
                  >
                    <Icon
                      name="ph:plus"
                      class="w-4 h-4"
                    />
                    {{ card.action }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="(stat, index) in [
            { value: '< 30s', label: 'Avg review time' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '6', label: 'AI providers' },
            { value: 'BYOK', label: 'Your API keys' },
          ]"
          :key="stat.label"
          class="animate-fade-in-up [animation-fill-mode:both] text-center"
          :style="{ animationDelay: `${520 + (index * 90)}ms` }"
        >
          <div class="text-3xl font-bold text-white">
            {{ stat.value }}
          </div>
          <div class="text-sm text-zinc-500 mt-1">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Dot grid background - dark version */
.dot-grid-dark {
  background-image: radial-gradient(circle, #27272a 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Architecture wrapper */
.architecture-wrapper {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

/* 3D Scene setup */
.architecture-scene {
  perspective: 1800px;
  perspective-origin: 50% 50%;
}

/* The tilted stage - dark */
.architecture-stage-dark {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  transform-style: preserve-3d;
  transform: rotateX(17deg) rotateZ(-8deg) scale(0.9);
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.architecture-stage-dark:hover {
  transform: rotateX(16deg) rotateZ(-7deg) scale(0.92);
}

/* Columns */
.architecture-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transform-style: preserve-3d;
  transform: translateZ(var(--col-z));
}

/* Card wrapper for 3D positioning */
.card-wrapper {
  transform-style: preserve-3d;
  transform: translateZ(var(--card-z));
}

/* Card base styles - dark */
.architecture-card-dark {
  position: relative;
  width: 350px;
  background: #111113;
  border-radius: 12px;
  border: 1px solid #27272a;
  border-left-width: 4px;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: all 0.3s ease;

  /* Elevation shadow - dark version */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 12px 24px rgba(0, 0, 0, 0.3),
    0 24px 48px rgba(0, 0, 0, 0.2),
    /* Shadow on the "ground" showing elevation */
    0 50px 40px -30px rgba(0, 0, 0, 0.5);
}

.architecture-card-dark:hover {
  transform: translateZ(15px) scale(1.02);
  border-color: #3f3f46;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 12px 24px rgba(0, 0, 0, 0.35),
    0 24px 48px rgba(0, 0, 0, 0.25),
    0 60px 50px -30px rgba(0, 0, 0, 0.6),
    0 0 30px -10px rgba(20, 184, 166, 0.15);
}

/* Diagonal stripes - dark */
.card-stripes-dark {
  height: 8px;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 3px,
    var(--stripe-color) 3px,
    var(--stripe-color) 6px
  );
}

/* Card header - dark */
.card-header-dark {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #1f1f23;
}

.card-title-dark {
  font-size: 14px;
  font-weight: 600;
  color: #fafafa;
}

.card-badge-dark {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.card-menu-dark {
  color: #52525b;
  transition: color 0.15s;
}

.card-menu-dark:hover {
  color: #a1a1aa;
}

/* Card body - dark */
.card-body-dark {
  padding: 10px 14px;
}

.card-row-dark {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.row-left-dark {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-label-dark {
  font-size: 13px;
  color: #71717a;
}

.row-right-dark {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-value-dark {
  font-size: 13px;
  font-weight: 500;
  color: #a1a1aa;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Card action - dark */
.card-action-dark {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #14b8a6;
  border-top: 1px solid #1f1f23;
  transition: background-color 0.15s;
}

.card-action-dark:hover {
  background-color: #18181b;
}

/* Responsive - flatten on smaller screens */
@media (max-width: 1024px) {
  .architecture-stage-dark {
    transform: rotateX(45deg) rotateZ(-45deg) scale(0.7);
  }
}

@media (max-width: 768px) {
  .architecture-scene {
    perspective: none;
  }

  .architecture-stage-dark {
    transform: none;
    flex-direction: column;
    align-items: center;
  }

  .architecture-column {
    transform: none;
  }

  .card-wrapper {
    transform: none;
  }

  .architecture-card-dark {
    width: 100%;
    max-width: 320px;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .architecture-card-dark:hover {
    transform: translateY(-2px);
  }
}
</style>

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
 * Landing page architecture visualization (Desktop)
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
</script>

<template>
  <section class="hidden lg:block relative py-24 lg:py-32 overflow-hidden bg-[#f8fafc]">
    <!-- Dot grid background -->
    <div class="absolute inset-0 dot-grid" />

    <div class="relative z-10 max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
          Built for reliability at scale
        </h2>
        <p class="mt-4 text-lg text-slate-600 leading-relaxed">
          A complete review pipeline from webhook to annotation. Every step designed for speed, accuracy, and transparency.
        </p>
      </div>

      <!-- 3D Architecture -->
      <div class="architecture-wrapper">
        <div class="architecture-scene">
          <div class="architecture-stage">
            <!-- Columns -->
            <div
              v-for="column in columns"
              :key="column.id"
              class="architecture-column"
              :style="{
                '--col': column.id,
                '--col-z': `${(column.id - 1) * 25}px`,
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
                  class="architecture-card"
                  :class="colorConfig[card.color]?.border"
                >
                  <!-- Stripe pattern -->
                  <div
                    v-if="card.hasStripes"
                    class="card-stripes"
                    :style="{ '--stripe-color': colorConfig[card.color]?.stripe }"
                  />

                  <!-- Header -->
                  <div class="card-header">
                    <div class="flex items-center gap-2">
                      <span class="card-title">{{ card.title }}</span>
                      <span
                        v-if="card.badge"
                        class="card-badge"
                        :class="colorConfig[card.badge.color]?.badge"
                      >
                        <Icon
                          name="ph:squares-four"
                          class="w-3 h-3"
                        />
                        {{ card.badge!.text }}
                      </span>
                    </div>
                    <button class="card-menu">
                      <Icon
                        name="ph:dots-three"
                        class="w-5 h-5"
                      />
                    </button>
                  </div>

                  <!-- Body -->
                  <div class="card-body">
                    <div
                      v-for="row in card.rows"
                      :key="row.label"
                      class="card-row"
                    >
                      <div class="row-left">
                        <Icon
                          :name="row.icon"
                          class="w-4 h-4 text-slate-400"
                        />
                        <span class="row-label">{{ row.label }}</span>
                      </div>
                      <div class="row-right">
                        <span class="row-value">{{ row.value }}</span>
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
                    class="card-action"
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
          v-for="stat in [
            { value: '< 30s', label: 'Avg review time' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '6', label: 'AI providers' },
            { value: 'BYOK', label: 'Your API keys' },
          ]"
          :key="stat.label"
          class="text-center"
        >
          <div class="text-3xl font-bold text-slate-900">{{ stat.value }}</div>
          <div class="text-sm text-slate-500 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Dot grid background - exactly like Laravel Cloud */
.dot-grid {
  background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
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

/* The tilted stage */
.architecture-stage {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  transform-style: preserve-3d;
  transform: rotateX(22deg) rotateZ(-12deg) scale(0.9);
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.architecture-stage:hover {
  transform: rotateX(17deg) rotateZ(-8deg) scale(0.95);
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

/* Card base styles */
.architecture-card {
  position: relative;
  width: 400px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  border-left-width: 4px;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: all 0.3s ease;

  /* Elevation shadow - key for the floating effect */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 8px rgba(0, 0, 0, 0.04),
    0 12px 24px rgba(0, 0, 0, 0.06),
    0 24px 48px rgba(0, 0, 0, 0.04),
    /* Shadow on the "ground" showing elevation */
    0 50px 40px -30px rgba(0, 0, 0, 0.15);
}

.architecture-card:hover {
  transform: translateZ(15px) scale(1.02);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 8px rgba(0, 0, 0, 0.04),
    0 12px 24px rgba(0, 0, 0, 0.08),
    0 24px 48px rgba(0, 0, 0, 0.06),
    0 60px 50px -30px rgba(0, 0, 0, 0.2);
}

/* Diagonal stripes */
.card-stripes {
  height: 8px;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 3px,
    var(--stripe-color) 3px,
    var(--stripe-color) 6px
  );
}

/* Card header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.card-badge {
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

.card-menu {
  color: #94a3b8;
  transition: color 0.15s;
}

.card-menu:hover {
  color: #475569;
}

/* Card body */
.card-body {
  padding: 10px 14px;
}

.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-label {
  font-size: 13px;
  color: #64748b;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-value {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Card action */
.card-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #0ea5e9;
  border-top: 1px solid #f1f5f9;
  transition: background-color 0.15s;
}

.card-action:hover {
  background-color: #f8fafc;
}

/* Responsive - flatten on smaller screens */
@media (max-width: 1024px) {
  .architecture-stage {
    transform: rotateX(45deg) rotateZ(-45deg) scale(0.7);
  }
}

@media (max-width: 768px) {
  .architecture-scene {
    perspective: none;
  }

  .architecture-stage {
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

  .architecture-card {
    width: 100%;
    max-width: 320px;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.06),
      0 4px 12px rgba(0, 0, 0, 0.04);
  }

  .architecture-card:hover {
    transform: translateY(-2px);
  }
}
</style>

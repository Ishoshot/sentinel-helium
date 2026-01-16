<script setup lang="ts">
/**
 * Landing page hero visual - SVG-based dashboard mockup
 * Coded visual that looks like an image 
 */

defineProps<{
  visible: boolean
}>()

// Sample data for the animated visualization
const metrics = [
  { label: 'Reviews', value: 1284, color: 'accent' },
  { label: 'Resolved', value: 94, suffix: '%', color: 'success' },
  { label: 'Avg Time', value: 28, suffix: 's', color: 'warning' },
]

const reviewItems = [
  {
    title: 'feat: Add policy audit trail',
    repo: 'sentinel-api',
    findings: 3,
    severity: 'warning',
    time: '12m ago',
  },
  {
    title: 'fix: Resolve auth callback race',
    repo: 'auth-service',
    findings: 0,
    severity: 'success',
    time: '24m ago',
  },
  {
    title: 'refactor: Extract billing logic',
    repo: 'billing-core',
    findings: 1,
    severity: 'info',
    time: '1h ago',
  },
]
</script>

<template>
  <div
    class="relative transition-all duration-1000 delay-200 ease-out"
    :class="visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'"
  >
    <!-- Glow effects behind the visual -->
    <div class="absolute -inset-8 pointer-events-none">
      <!-- Primary blue glow -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--landing-accent)] rounded-full blur-[120px] opacity-20" />
      <!-- Secondary purple glow -->
      <div class="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500 rounded-full blur-[100px] opacity-10" />
    </div>

    <!-- Main dashboard container -->
    <div class="relative">
      <!-- SVG Dashboard Frame -->
      <svg
        viewBox="0 0 800 520"
        class="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- Gradients -->
          <linearGradient
            id="cardGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stop-color="#18181b"
            />
            <stop
              offset="100%"
              stop-color="#0f0f11"
            />
          </linearGradient>

          <linearGradient
            id="headerGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stop-color="#1c1c1f"
            />
            <stop
              offset="100%"
              stop-color="#18181b"
            />
          </linearGradient>

          <linearGradient
            id="accentGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stop-color="#3b82f6"
            />
            <stop
              offset="100%"
              stop-color="#60a5fa"
            />
          </linearGradient>

          <linearGradient
            id="successGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stop-color="#10b981"
            />
            <stop
              offset="100%"
              stop-color="#34d399"
            />
          </linearGradient>

          <linearGradient
            id="barGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0%"
              stop-color="#3b82f6"
              stop-opacity="0.8"
            />
            <stop
              offset="100%"
              stop-color="#3b82f6"
              stop-opacity="0.2"
            />
          </linearGradient>

          <!-- Filters -->
          <filter
            id="glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur
              stdDeviation="3"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Clip paths -->
          <clipPath id="mainClip">
            <rect
              x="0"
              y="0"
              width="800"
              height="520"
              rx="16"
            />
          </clipPath>
        </defs>

        <!-- Main card background -->
        <g clip-path="url(#mainClip)">
          <rect
            x="0"
            y="0"
            width="800"
            height="520"
            fill="url(#cardGradient)"
          />

          <!-- Grid pattern overlay -->
          <g opacity="0.03">
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                stroke-width="1"
              />
            </pattern>
            <rect
              width="800"
              height="520"
              fill="url(#grid)"
            />
          </g>

          <!-- Window header -->
          <rect
            x="0"
            y="0"
            width="800"
            height="48"
            fill="url(#headerGradient)"
          />
          <line
            x1="0"
            y1="48"
            x2="800"
            y2="48"
            stroke="rgba(255,255,255,0.06)"
            stroke-width="1"
          />

          <!-- Traffic lights -->
          <circle
            cx="24"
            cy="24"
            r="6"
            fill="#3f3f46"
          />
          <circle
            cx="44"
            cy="24"
            r="6"
            fill="#3f3f46"
          />
          <circle
            cx="64"
            cy="24"
            r="6"
            fill="#3f3f46"
          />

          <!-- URL bar -->
          <rect
            x="280"
            y="12"
            width="240"
            height="24"
            rx="6"
            fill="#0a0a0b"
          />
          <text
            x="300"
            y="28"
            font-family="ui-monospace, monospace"
            font-size="11"
            fill="#71717a"
          >
            sentinel.app/workspace
          </text>

          <!-- Content area -->
          <!-- Stats row -->
          <g transform="translate(24, 72)">
            <!-- Stats cards -->
            <g
              v-for="(stat, i) in 3"
              :key="i"
              :transform="`translate(${i * 254}, 0)`"
            >
              <rect
                width="238"
                height="88"
                rx="12"
                fill="#111113"
                stroke="rgba(255,255,255,0.06)"
                stroke-width="1"
              />
              <!-- Stat value -->
              <text
                x="20"
                y="45"
                font-family="Instrument Sans, system-ui"
                font-size="32"
                font-weight="600"
                :fill="i === 0 ? '#3b82f6' : i === 1 ? '#10b981' : '#f59e0b'"
              >
                {{ metrics[i].value }}{{ metrics[i].suffix || '' }}
              </text>
              <!-- Stat label -->
              <text
                x="20"
                y="70"
                font-family="Instrument Sans, system-ui"
                font-size="13"
                fill="#71717a"
              >
                {{ metrics[i].label }}
              </text>
              <!-- Mini chart decoration -->
              <g
                :transform="`translate(180, 20)`"
                opacity="0.4"
              >
                <rect
                  y="28"
                  width="8"
                  height="20"
                  rx="2"
                  :fill="i === 0 ? '#3b82f6' : i === 1 ? '#10b981' : '#f59e0b'"
                />
                <rect
                  x="12"
                  y="20"
                  width="8"
                  height="28"
                  rx="2"
                  :fill="i === 0 ? '#3b82f6' : i === 1 ? '#10b981' : '#f59e0b'"
                />
                <rect
                  x="24"
                  y="32"
                  width="8"
                  height="16"
                  rx="2"
                  :fill="i === 0 ? '#3b82f6' : i === 1 ? '#10b981' : '#f59e0b'"
                />
              </g>
            </g>
          </g>

          <!-- Activity section -->
          <g transform="translate(24, 184)">
            <text
              x="0"
              y="0"
              font-family="Instrument Sans, system-ui"
              font-size="11"
              font-weight="600"
              fill="#52525b"
              letter-spacing="0.1em"
            >
              RECENT REVIEWS
            </text>

            <!-- Review items -->
            <g
              v-for="(item, i) in reviewItems"
              :key="i"
              :transform="`translate(0, ${24 + i * 80})`"
            >
              <!-- Item container -->
              <rect
                width="752"
                height="68"
                rx="10"
                fill="#111113"
                stroke="rgba(255,255,255,0.06)"
                stroke-width="1"
              />

              <!-- Status indicator -->
              <circle
                cx="24"
                cy="34"
                r="4"
                :fill="item.severity === 'success' ? '#10b981' : item.severity === 'warning' ? '#f59e0b' : '#3b82f6'"
                filter="url(#glow)"
              />

              <!-- Title -->
              <text
                x="44"
                y="30"
                font-family="Instrument Sans, system-ui"
                font-size="14"
                font-weight="500"
                fill="#fafafa"
              >
                {{ item.title }}
              </text>

              <!-- Repo name -->
              <text
                x="44"
                y="50"
                font-family="ui-monospace, monospace"
                font-size="12"
                fill="#52525b"
              >
                {{ item.repo }}
              </text>

              <!-- Time -->
              <text
                x="640"
                y="30"
                font-family="Instrument Sans, system-ui"
                font-size="12"
                fill="#52525b"
                text-anchor="end"
              >
                {{ item.time }}
              </text>

              <!-- Findings badge -->
              <g transform="translate(660, 18)">
                <rect
                  width="72"
                  height="24"
                  rx="6"
                  :fill="item.findings === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'"
                />
                <text
                  x="36"
                  y="16"
                  font-family="Instrument Sans, system-ui"
                  font-size="11"
                  font-weight="500"
                  :fill="item.findings === 0 ? '#10b981' : '#f59e0b'"
                  text-anchor="middle"
                >
                  {{ item.findings === 0 ? 'Clean' : `${item.findings} findings` }}
                </text>
              </g>
            </g>
          </g>

          <!-- Progress bar at bottom -->
          <g transform="translate(24, 480)">
            <rect
              width="752"
              height="4"
              rx="2"
              fill="#1c1c1f"
            />
            <rect
              width="640"
              height="4"
              rx="2"
              fill="url(#barGradient)"
            >
              <animate
                attributeName="width"
                from="0"
                to="640"
                dur="2s"
                fill="freeze"
                begin="0.5s"
              />
            </rect>
          </g>

          <!-- Border overlay -->
          <rect
            x="0.5"
            y="0.5"
            width="799"
            height="519"
            rx="16"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            stroke-width="1"
          />
        </g>
      </svg>

      <!-- Floating elements for depth -->
      <div class="absolute -top-4 -right-4 w-24 h-24 bg-[var(--landing-accent)]/10 rounded-xl blur-xl" />
      <div class="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/5 rounded-xl blur-xl" />
    </div>
  </div>
</template>

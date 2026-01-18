<script setup lang="ts">
/**
 * Landing page code review visualization
 * SVG-based animated code diff with findings
 */

const codeLines = [
  { num: 1, content: 'async function processPayment(user, amount) {', type: 'normal' },
  { num: 2, content: '  const token = await getToken(user.id);', type: 'normal' },
  { num: 3, content: '  if (!token) return null;', type: 'warning', finding: 'Missing error handling' },
  { num: 4, content: '', type: 'normal' },
  { num: 5, content: '  const result = await stripe.charge({', type: 'normal' },
  { num: 6, content: '    amount: amount,', type: 'added' },
  { num: 7, content: '    currency: "usd",', type: 'added' },
  { num: 8, content: '    source: token', type: 'normal' },
  { num: 9, content: '  });', type: 'normal' },
  { num: 10, content: '', type: 'normal' },
  { num: 11, content: '  return result;', type: 'normal' },
  { num: 12, content: '}', type: 'normal' },
]
</script>

<template>
  <div class="relative">
    <!-- Main code block -->
    <svg
      viewBox="0 0 560 380"
      class="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="codeCardBg"
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
            stop-color="#111113"
          />
        </linearGradient>

        <linearGradient
          id="addedLine"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stop-color="rgba(16, 185, 129, 0.15)"
          />
          <stop
            offset="100%"
            stop-color="rgba(16, 185, 129, 0)"
          />
        </linearGradient>

        <linearGradient
          id="warningLine"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stop-color="rgba(245, 158, 11, 0.15)"
          />
          <stop
            offset="100%"
            stop-color="rgba(245, 158, 11, 0)"
          />
        </linearGradient>
      </defs>

      <!-- Card background -->
      <rect
        width="560"
        height="380"
        rx="12"
        fill="url(#codeCardBg)"
      />

      <!-- Border -->
      <rect
        x="0.5"
        y="0.5"
        width="559"
        height="379"
        rx="12"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
      />

      <!-- Header -->
      <rect
        width="560"
        height="40"
        rx="12"
        fill="#1c1c1f"
      />
      <rect
        y="28"
        width="560"
        height="12"
        fill="#1c1c1f"
      />

      <!-- Traffic lights -->
      <circle
        cx="20"
        cy="20"
        r="5"
        fill="#3f3f46"
      />
      <circle
        cx="38"
        cy="20"
        r="5"
        fill="#3f3f46"
      />
      <circle
        cx="56"
        cy="20"
        r="5"
        fill="#3f3f46"
      />

      <!-- File name -->
      <text
        x="280"
        y="24"
        font-family="ui-monospace, monospace"
        font-size="11"
        fill="#71717a"
        text-anchor="middle"
      >
        payments/processor.ts
      </text>

      <!-- Header border -->
      <line
        x1="0"
        y1="40"
        x2="560"
        y2="40"
        stroke="rgba(255,255,255,0.06)"
      />

      <!-- Code content -->
      <g transform="translate(0, 52)">
        <!-- Line backgrounds -->
        <g
          v-for="(line, i) in codeLines"
          :key="i"
        >
          <!-- Added line highlight -->
          <rect
            v-if="line.type === 'added'"
            :y="i * 26"
            width="560"
            height="26"
            fill="url(#addedLine)"
          />
          <!-- Warning line highlight -->
          <rect
            v-if="line.type === 'warning'"
            :y="i * 26"
            width="560"
            height="26"
            fill="url(#warningLine)"
          />

          <!-- Line number gutter -->
          <rect
            :y="i * 26"
            width="48"
            height="26"
            fill="rgba(0,0,0,0.2)"
          />
          <text
            x="32"
            :y="i * 26 + 17"
            font-family="ui-monospace, monospace"
            font-size="11"
            fill="#52525b"
            text-anchor="end"
          >
            {{ line.num }}
          </text>

          <!-- Added indicator -->
          <text
            v-if="line.type === 'added'"
            x="44"
            :y="i * 26 + 17"
            font-family="ui-monospace, monospace"
            font-size="11"
            fill="#10b981"
          >
            +
          </text>

          <!-- Code content -->
          <text
            :x="line.type === 'added' ? 60 : 56"
            :y="i * 26 + 17"
            font-family="ui-monospace, monospace"
            font-size="12"
            :fill="line.type === 'warning' ? '#fafafa' : line.type === 'added' ? '#a7f3d0' : '#a1a1aa'"
          >
            {{ line.content }}
          </text>
        </g>
      </g>

      <!-- Finding annotation -->
      <g transform="translate(360, 104)">
        <rect
          width="185"
          height="48"
          rx="8"
          fill="#18181b"
          stroke="#f59e0b"
          stroke-width="1"
          stroke-opacity="0.3"
        />
        <circle
          cx="16"
          cy="24"
          r="8"
          fill="rgba(245, 158, 11, 0.15)"
        />
        <text
          x="16"
          y="28"
          font-family="system-ui"
          font-size="10"
          fill="#f59e0b"
          text-anchor="middle"
        >
          !
        </text>
        <text
          x="32"
          y="20"
          font-family="system-ui"
          font-size="10"
          fill="#f59e0b"
        >
          Warning
        </text>
        <text
          x="32"
          y="36"
          font-family="system-ui"
          font-size="11"
          fill="#a1a1aa"
        >
          Missing error handling
        </text>
        <!-- Connector line -->
        <line
          x1="-8"
          y1="24"
          x2="-40"
          y2="24"
          stroke="#f59e0b"
          stroke-width="1"
          stroke-opacity="0.5"
          stroke-dasharray="4 2"
        />
      </g>
    </svg>
  </div>
</template>

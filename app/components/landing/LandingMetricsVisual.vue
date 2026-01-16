<script setup lang="ts">
/**
 * Landing page metrics visualization
 * SVG-based chart showing review analytics
 */

// Chart data points for the line graph
const chartData = [20, 35, 25, 50, 42, 65, 55, 80, 70, 95, 85, 100]
</script>

<template>
  <div class="relative">
    <svg
      viewBox="0 0 480 320"
      class="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="metricsBg"
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
          id="chartGradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            stop-color="#3b82f6"
            stop-opacity="0.3"
          />
          <stop
            offset="100%"
            stop-color="#3b82f6"
            stop-opacity="0"
          />
        </linearGradient>

        <linearGradient
          id="lineGradient"
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

        <filter
          id="glowFilter"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur
            stdDeviation="2"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Card background -->
      <rect
        width="480"
        height="320"
        rx="12"
        fill="url(#metricsBg)"
      />

      <!-- Border -->
      <rect
        x="0.5"
        y="0.5"
        width="479"
        height="319"
        rx="12"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
      />

      <!-- Header area -->
      <text
        x="24"
        y="32"
        font-family="Instrument Sans, system-ui"
        font-size="11"
        fill="#52525b"
        letter-spacing="0.1em"
      >
        REVIEW VELOCITY
      </text>

      <!-- Stats row -->
      <g transform="translate(24, 48)">
        <text
          font-family="Instrument Sans, system-ui"
          font-size="32"
          font-weight="600"
          fill="#fafafa"
        >
          847
        </text>
        <text
          x="80"
          y="0"
          font-family="Instrument Sans, system-ui"
          font-size="12"
          fill="#71717a"
        >
          reviews this month
        </text>
        <text
          x="80"
          y="18"
          font-family="Instrument Sans, system-ui"
          font-size="12"
          fill="#10b981"
        >
          +23% vs last month
        </text>
      </g>

      <!-- Chart area -->
      <g transform="translate(24, 100)">
        <!-- Y-axis grid lines -->
        <g opacity="0.1">
          <line
            x1="0"
            y1="0"
            x2="432"
            y2="0"
            stroke="white"
          />
          <line
            x1="0"
            y1="50"
            x2="432"
            y2="50"
            stroke="white"
          />
          <line
            x1="0"
            y1="100"
            x2="432"
            y2="100"
            stroke="white"
          />
          <line
            x1="0"
            y1="150"
            x2="432"
            y2="150"
            stroke="white"
          />
        </g>

        <!-- Y-axis labels -->
        <text
          x="-8"
          y="4"
          font-family="ui-monospace, monospace"
          font-size="9"
          fill="#52525b"
          text-anchor="end"
        >
          100
        </text>
        <text
          x="-8"
          y="54"
          font-family="ui-monospace, monospace"
          font-size="9"
          fill="#52525b"
          text-anchor="end"
        >
          75
        </text>
        <text
          x="-8"
          y="104"
          font-family="ui-monospace, monospace"
          font-size="9"
          fill="#52525b"
          text-anchor="end"
        >
          50
        </text>
        <text
          x="-8"
          y="154"
          font-family="ui-monospace, monospace"
          font-size="9"
          fill="#52525b"
          text-anchor="end"
        >
          25
        </text>

        <!-- Chart fill area -->
        <path
          d="M 0,150
             L 0,120
             L 36,97.5
             L 72,112.5
             L 108,75
             L 144,87
             L 180,52.5
             L 216,67.5
             L 252,30
             L 288,45
             L 324,7.5
             L 360,22.5
             L 396,0
             L 432,0
             L 432,150
             Z"
          fill="url(#chartGradient)"
        />

        <!-- Chart line -->
        <path
          d="M 0,120
             L 36,97.5
             L 72,112.5
             L 108,75
             L 144,87
             L 180,52.5
             L 216,67.5
             L 252,30
             L 288,45
             L 324,7.5
             L 360,22.5
             L 396,0"
          fill="none"
          stroke="url(#lineGradient)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Data points -->
        <g filter="url(#glowFilter)">
          <circle
            v-for="(value, i) in chartData.slice(0, -1)"
            :key="i"
            :cx="i * 36"
            :cy="150 - (value * 1.5)"
            r="4"
            fill="#3b82f6"
          />
        </g>

        <!-- End point highlight -->
        <circle
          cx="396"
          cy="0"
          r="6"
          fill="#3b82f6"
          filter="url(#glowFilter)"
        />
        <circle
          cx="396"
          cy="0"
          r="3"
          fill="white"
        />
      </g>

      <!-- X-axis labels -->
      <g transform="translate(24, 268)">
        <text
          v-for="(month, i) in ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']"
          :key="month"
          :x="i * 36"
          font-family="ui-monospace, monospace"
          font-size="9"
          fill="#52525b"
          text-anchor="middle"
        >
          {{ month }}
        </text>
      </g>

      <!-- Bottom stats bar -->
      <g transform="translate(24, 290)">
        <rect
          width="432"
          height="1"
          fill="rgba(255,255,255,0.06)"
        />
      </g>
    </svg>
  </div>
</template>

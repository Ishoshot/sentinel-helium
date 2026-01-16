<script setup lang="ts">
/**
 * Landing page languages/technologies showcase
 * Infinite scrolling rows with premium design
 */

interface Language {
  name: string
  icon: string
  color: string
}

// All 33 supported languages grouped for 6 rows
const row1: Language[] = [
  { name: 'PHP', icon: 'simple-icons:php', color: '#777BB4' },
  { name: 'JavaScript', icon: 'simple-icons:javascript', color: '#F7DF1E' },
  { name: 'TypeScript', icon: 'simple-icons:typescript', color: '#3178C6' },
  { name: 'Python', icon: 'simple-icons:python', color: '#3776AB' },
  { name: 'Go', icon: 'simple-icons:go', color: '#00ADD8' },
  { name: 'Rust', icon: 'simple-icons:rust', color: '#CE422B' },
]

const row2: Language[] = [
  { name: 'Java', icon: 'simple-icons:openjdk', color: '#ED8B00' },
  { name: 'Kotlin', icon: 'simple-icons:kotlin', color: '#7F52FF' },
  { name: 'Scala', icon: 'simple-icons:scala', color: '#DC322F' },
  { name: 'Groovy', icon: 'simple-icons:apachegroovy', color: '#4298B8' },
  { name: 'Clojure', icon: 'simple-icons:clojure', color: '#5881D8' },
  { name: 'C#', icon: 'simple-icons:csharp', color: '#512BD4' },
]

const row3: Language[] = [
  { name: 'Ruby', icon: 'simple-icons:ruby', color: '#CC342D' },
  { name: 'Elixir', icon: 'simple-icons:elixir', color: '#4B275F' },
  { name: 'Haskell', icon: 'simple-icons:haskell', color: '#5D4F85' },
  { name: 'OCaml', icon: 'simple-icons:ocaml', color: '#EC6813' },
  { name: 'F#', icon: 'simple-icons:fsharp', color: '#378BBA' },
  { name: 'Lua', icon: 'simple-icons:lua', color: '#2C2D72' },
]

const row4: Language[] = [
  { name: 'Swift', icon: 'simple-icons:swift', color: '#F05138' },
  { name: 'Objective-C', icon: 'simple-icons:apple', color: '#438EFF' },
  { name: 'C/C++', icon: 'simple-icons:cplusplus', color: '#00599C' },
  { name: 'Zig', icon: 'simple-icons:zig', color: '#F7A41D' },
  { name: 'Dart', icon: 'simple-icons:dart', color: '#0175C2' },
  { name: 'Perl', icon: 'simple-icons:perl', color: '#39457E' },
]

const row5: Language[] = [
  { name: 'R', icon: 'simple-icons:r', color: '#276DC3' },
  { name: 'Julia', icon: 'simple-icons:julia', color: '#9558B2' },
  { name: 'Vue', icon: 'simple-icons:vuedotjs', color: '#4FC08D' },
  { name: 'Svelte', icon: 'simple-icons:svelte', color: '#FF3E00' },
  { name: 'HTML', icon: 'simple-icons:html5', color: '#E34F26' },
  { name: 'CSS', icon: 'simple-icons:css3', color: '#1572B6' },
]

const row6: Language[] = [
  { name: 'SCSS', icon: 'simple-icons:sass', color: '#CC6699' },
  { name: 'SQL', icon: 'simple-icons:postgresql', color: '#4169E1' },
  { name: 'Shell', icon: 'simple-icons:gnubash', color: '#4EAA25' },
  { name: 'YAML', icon: 'simple-icons:yaml', color: '#CB171E' },
]

const rows = [
  { languages: row1, direction: 'left' },
  { languages: row2, direction: 'right' },
  { languages: row3, direction: 'left' },
  { languages: row4, direction: 'right' },
  { languages: row5, direction: 'left' },
  { languages: row6, direction: 'right' },
]

// Triple the items for seamless infinite scroll
function tripleArray(arr: Language[]): Language[] {
  return [...arr, ...arr, ...arr]
}
</script>

<template>
  <section class="py-24 lg:py-32 bg-white relative overflow-hidden">
    <!-- Background elements -->
    <div class="absolute inset-0">
      <!-- Subtle grid -->
      <div
        class="absolute inset-0 opacity-[0.4]"
        style="background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px); background-size: 40px 40px;"
      />
      <!-- Gradient orbs -->
      <!-- <div class="absolute top-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" /> -->
      <!-- <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" /> -->
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-6">
          <Icon name="ph:tree-structure-bold" class="w-4 h-4" />
          <span>Semantic Analysis</span>
        </div>
        <h2 class="text-3xl lg:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
          Deep understanding of
          <span class="text-blue-600 font-bold">33</span>
          languages
        </h2>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Our semantic analyzer uses tree-sitter to parse your code and extract functions, classes, imports, and dependencies for smarter reviews.
        </p>
      </div>

      <!-- Scrolling rows -->
      <div class="space-y-4 lg:space-y-6">
        <div
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
          class="relative"
        >
          <!-- Fade edges -->
          <div class="absolute left-0 top-0 bottom-0 w-24 lg:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div class="absolute right-0 top-0 bottom-0 w-24 lg:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <!-- Scrolling container -->
          <div class="overflow-hidden">
            <div
              class="flex gap-4 lg:gap-6"
              :class="row.direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'"
            >
              <div
                v-for="(lang, index) in tripleArray(row.languages)"
                :key="`${lang.name}-${index}`"
                class="group flex-shrink-0"
              >
                <div
                  class="relative flex items-center gap-3 px-5 py-3 lg:px-6 lg:py-4 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-sm hover:border-slate-300 hover:-translate-y-1 hover:scale-101"
                >
                  <!-- Hover glow -->
                  <div
                    class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
                    :style="{ backgroundColor: `${lang.color}10` }"
                  />

                  <!-- Icon container -->
                  <div
                    class="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    :style="{ backgroundColor: `${lang.color}15` }"
                  >
                    <Icon
                      :name="lang.icon"
                      class="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:scale-110"
                      :style="{ color: lang.color }"
                    />
                  </div>

                  <!-- Name -->
                  <span class="text-sm lg:text-base font-semibold text-slate-700 whitespace-nowrap">
                    {{ lang.name }}
                  </span>

                  <!-- Active indicator dot -->
                  <div
                    class="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    :style="{ backgroundColor: lang.color }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom stats -->
      <div class="mt-16 flex flex-wrap items-center justify-center gap-8 lg:gap-16">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Icon name="ph:function-bold" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900">Functions</div>
            <div class="text-sm text-slate-500">Extracted & analyzed</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
            <Icon name="ph:tree-structure-bold" class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900">Classes</div>
            <div class="text-sm text-slate-500">Methods & properties</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Icon name="ph:package-bold" class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900">Imports</div>
            <div class="text-sm text-slate-500">Dependencies mapped</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.333%);
  }
}

@keyframes scroll-right {
  0% {
    transform: translateX(-33.333%);
  }
  100% {
    transform: translateX(0);
  }
}

.animate-scroll-left {
  animation: scroll-left 30s linear infinite;
}

.animate-scroll-right {
  animation: scroll-right 30s linear infinite;
}

/* Pause animation on hover */
.animate-scroll-left:hover,
.animate-scroll-right:hover {
  animation-play-state: paused;
}
</style>

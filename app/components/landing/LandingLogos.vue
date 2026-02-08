<script setup lang="ts">
/**
 * Landing page trusted logos section 
 * Clean, minimal display of tech/company logos
 */

const technologies = [
  { name: 'PHP', icon: 'simple-icons:php' },
  { name: 'Laravel', icon: 'simple-icons:laravel' },
  { name: 'React', icon: 'simple-icons:react' },
  { name: 'Vue', icon: 'simple-icons:vuedotjs' },
  { name: 'TypeScript', icon: 'simple-icons:typescript' },
  { name: 'Python', icon: 'simple-icons:python' },
  { name: 'Go', icon: 'simple-icons:go' },
]
</script>

<template>
  <section class="py-12 lg:py-16 bg-[#0f0f12]">
    <div class="max-w-6xl mx-auto px-6">
      <p class="text-center text-xs uppercase tracking-[0.15em] text-zinc-600 mb-8">
        Works with your stack
      </p>
      <div class="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        <div
          v-for="tech in technologies"
          :key="tech.name"
          class="flex items-center gap-3 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Icon
            :name="tech.icon"
            class="w-8 h-8"
          />
          <span class="text-sm font-medium">{{ tech.name }}</span>
        </div>
        <span class="text-sm text-zinc-600 italic">and many more...</span>
      </div>
    </div>
  </section>
</template>

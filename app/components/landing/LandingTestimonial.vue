<script setup lang="ts">
/**
 * Featured quote with clean dark design
 */

const testimonials = [
  {
    quote: 'Sentinel caught a critical SQL injection vulnerability in our authentication flow. The review was fast, clear, and immediately actionable.',
    author: 'Oluwatobi Ishola',
    role: 'Engineering Lead',
    company: 'Blaaiz',
    initials: 'OI',
  },
  {
    quote: 'We deployed Sentinel across 12 repositories in under an hour. The consistency in review quality has been remarkable.',
    author: 'Gbenga Oni',
    role: 'Chief Technology Officer',
    company: 'Blaaiz',
    initials: 'GO',
  },
  {
    quote: 'The BYOK model was a game-changer for us. We control our AI spend while getting intelligent reviews on every PR.',
    author: 'Philips Akinleye',
    role: 'Chief Technology Officer',
    company: 'Payaza',
    initials: 'PA',
  },
]
</script>

<template>
  <section class="py-24 lg:py-32 bg-[#0f0f12] relative overflow-hidden">
    <div class="relative max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center mb-16">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
          Trusted by engineering teams
        </h2>
        <p class="mt-4 text-lg text-zinc-400">
          See what developers are saying about Sentinel.
        </p>
      </div>

      <!-- Testimonials grid -->
      <div class="grid md:grid-cols-3 gap-6">
        <div
          v-for="testimonial in testimonials"
          :key="testimonial.author"
          class="relative p-6 lg:p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Quote icon -->
          <Icon
            name="ph:quotes-bold"
            class="w-8 h-8 text-teal-500/50 mb-4"
          />

          <!-- Quote -->
          <blockquote class="text-zinc-300 leading-relaxed mb-6">
            "{{ testimonial.quote }}"
          </blockquote>

          <!-- Author -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center">
              <span class="text-xs font-semibold text-teal-400">{{ testimonial.initials }}</span>
            </div>
            <div>
              <div class="text-sm font-semibold text-white">
                {{ testimonial.author }}
              </div>
              <div class="text-xs text-zinc-500">
                {{ testimonial.role }}, {{ testimonial.company }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

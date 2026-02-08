<script setup lang="ts">
/**
 * Landing page FAQ section - Dark theme
 * Clean accordion with essential questions
 */

const faqs = [
  {
    question: 'How does Sentinel work?',
    answer: 'Sentinel automatically reviews your pull requests when they\'re opened or updated. It analyzes your code using AI, identifies potential issues, and posts findings directly to your PR.',
  },
  {
    question: 'What\'s the BYOK model?',
    answer: 'BYOK (Bring Your Own Key) means you provide your own API keys for AI providers like OpenAI or Anthropic. You maintain full control over your AI spend with complete transparency.',
  },
  {
    question: 'Which platforms are supported?',
    answer: 'Sentinel currently supports GitHub. GitLab and Bitbucket integrations are coming soon. Each integration is isolated to ensure consistent review quality.',
  },
  {
    question: 'Can I customize review policies?',
    answer: 'Yes. You can define custom guidelines at the workspace or repository level. Each review run captures a policy snapshot for complete audit visibility.',
  },
  {
    question: 'What happens when I hit my plan limit?',
    answer: 'Reviews are gracefully skipped when limits are reached. The system records the skip reason so your team always has clear visibility into what happened.',
  },
  {
    question: 'How secure is Sentinel?',
    answer: 'Sentinel only accesses the code in your pull requests. API keys are stored securely per workspace. We never store your source code beyond the review session.',
  },
] satisfies ReadonlyArray<{ question: string; answer: string }>
</script>

<template>
  <section
    id="faq"
    class="py-24 lg:py-32 bg-[#0f0f12] relative overflow-hidden"
  >
    <div class="relative max-w-3xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
          Frequently asked questions
        </h2>
        <p class="mt-4 text-lg text-zinc-400">
          Everything you need to know about Sentinel.
        </p>
      </div>

      <!-- FAQ items -->
      <div class="divide-y divide-zinc-800/50">
        <details
          v-for="faq in faqs"
          :key="faq.question"
          class="group py-5"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-white">
            <span>{{ faq.question }}</span>
            <Icon
              name="ph:plus-bold"
              class="w-5 h-5 text-zinc-500 transition-transform duration-200 group-open:rotate-45"
            />
          </summary>
          <p class="mt-4 text-zinc-400 leading-relaxed pr-12">
            {{ faq.answer }}
          </p>
        </details>
      </div>

      <!-- Contact CTA -->
      <div class="mt-12 text-center pt-8 border-t border-zinc-800/50">
        <p class="text-zinc-400 mb-4">
          Still have questions?
        </p>
        <a
          href="mailto:hello@usesentinel.ai"
          class="inline-flex items-center gap-2 text-teal-400 font-semibold hover:text-teal-300 transition-colors"
        >
          Get in touch
          <Icon
            name="ph:arrow-right-bold"
            class="w-4 h-4"
          />
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface Props {
  /**
   * Markdown content to render
   */
  content: string
  /**
   * Optional class to apply to the wrapper
   */
  class?: string
}

const props = defineProps<Props>()

// Configure marked options
marked.setOptions({
  breaks: true, // Enable GFM line breaks
  gfm: true, // Enable GitHub Flavored Markdown
  async: true, // Enable async mode for better performance with large documents
})

// Reactive state for async parsing
const html = ref<string>('')
const isLoading = ref(true)

// Track parsing requests to handle race conditions
let parseRequestId = 0

/**
 * Parse markdown content asynchronously and sanitize the output.
 * Uses request ID tracking to handle rapid content changes.
 */
async function parseMarkdown(content: string): Promise<void> {
  const requestId = ++parseRequestId
  isLoading.value = true

  try {
    const rawHtml = await marked.parse(content)

    // Only update if this is still the most recent request
    if (requestId === parseRequestId) {
      html.value = DOMPurify.sanitize(rawHtml as string)
    }
  } catch (error) {
    console.error('Markdown parsing error:', error)
    if (requestId === parseRequestId) {
      html.value = DOMPurify.sanitize(content)
    }
  } finally {
    if (requestId === parseRequestId) {
      isLoading.value = false
    }
  }
}

// Parse on mount
onMounted(() => {
  void parseMarkdown(props.content)
})

// Re-parse when content changes
watch(() => props.content, (newContent) => {
  void parseMarkdown(newContent)
})
</script>

<template>
  <div :class="['markdown-content', props.class]">
    <!-- Loading indicator for large documents -->
    <div
      v-if="isLoading && !html"
      class="flex items-center gap-2 text-text-muted py-4"
    >
      <Icon
        name="lucide:loader-2"
        class="w-4 h-4 animate-spin"
      />
      <span class="text-sm">Rendering content...</span>
    </div>

    <!-- Rendered markdown content -->
    <div
      v-else
      v-html="html"
    />
  </div>
</template>

<style scoped lang="postcss">
.markdown-content {
  @apply text-text-secondary leading-relaxed;
}

/* Headings */
.markdown-content :deep(h1) {
  @apply text-2xl font-bold text-text-primary mt-6 mb-4 first:mt-0;
}

.markdown-content :deep(h2) {
  @apply text-xl font-bold text-text-primary mt-5 mb-3 first:mt-0;
}

.markdown-content :deep(h3) {
  @apply text-lg font-semibold text-text-primary mt-4 mb-2 first:mt-0;
}

.markdown-content :deep(h4) {
  @apply text-base font-semibold text-text-primary mt-3 mb-2 first:mt-0;
}

.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  @apply text-sm font-semibold text-text-primary mt-2 mb-1 first:mt-0;
}

/* Paragraphs */
.markdown-content :deep(p) {
  @apply mb-4 last:mb-0;
}

/* Lists */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  @apply mb-4 pl-6 space-y-2;
}

.markdown-content :deep(ul) {
  @apply list-disc;
}

.markdown-content :deep(ol) {
  @apply list-decimal;
}

.markdown-content :deep(li) {
  @apply text-text-secondary;
}

.markdown-content :deep(li > p) {
  @apply mb-2;
}

/* Links */
.markdown-content :deep(a) {
  @apply text-accent hover:text-accent-hover underline transition-colors;
}

/* Code blocks */
.markdown-content :deep(pre) {
  @apply bg-bg-surface border border-border-subtle rounded-lg p-4 overflow-x-auto mb-4;
}

.markdown-content :deep(code) {
  @apply font-mono;
  font-size: .8rem;
}

.markdown-content :deep(pre code) {
  @apply bg-transparent border-0 p-0 text-text-primary;
}

/* Inline code */
.markdown-content :deep(p code),
.markdown-content :deep(li code),
.markdown-content :deep(td code) {
  @apply bg-bg-surface text-text-primary px-1.5 py-0.5 rounded border border-border-subtle;
}

/* Blockquotes */
.markdown-content :deep(blockquote) {
  @apply border-l-4 border-border-muted pl-4 py-2 my-4 italic text-text-muted;
}

/* Tables */
.markdown-content :deep(table) {
  @apply w-full border-collapse mb-4;
}

.markdown-content :deep(thead) {
  @apply bg-bg-surface;
}

.markdown-content :deep(th) {
  @apply border border-border-subtle px-4 py-2 text-left font-semibold text-text-primary;
}

.markdown-content :deep(td) {
  @apply border border-border-subtle px-4 py-2 text-text-secondary;
}

.markdown-content :deep(tr:hover) {
  @apply bg-bg-surface/50;
}

/* Horizontal rules */
.markdown-content :deep(hr) {
  @apply border-t border-border-subtle my-6;
}

/* Images */
.markdown-content :deep(img) {
  @apply max-w-full h-auto rounded-lg my-4;
}

/* Strong and emphasis */
.markdown-content :deep(strong) {
  @apply font-semibold text-text-primary;
}

.markdown-content :deep(em) {
  @apply italic;
}

/* Task lists (GitHub style) */
.markdown-content :deep(input[type="checkbox"]) {
  @apply mr-2;
}
</style>

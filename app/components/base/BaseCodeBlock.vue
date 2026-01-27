<script setup lang="ts">
import type { ThemeRegistrationRaw } from 'shiki'
import { CLIPBOARD_FEEDBACK_CODE } from '~/constants/animations'
import { useAppToast } from '~/composables/shared/useAppToast'

const toast = useAppToast()

interface Props {
  code: string
  label?: string
  language?: string
  maxPreviewLines?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  language: '',
  maxPreviewLines: 10,
})

const isCopied = ref(false)
const isExpanded = ref(false)

const normalizedCode = computed(() => props.code.replace(/\r\n/g, '\n'))

const codeLines = computed(() => normalizedCode.value.split('\n'))

const isCollapsible = computed(() => codeLines.value.length > props.maxPreviewLines)

const hiddenLineCount = computed(() => {
  if (!isCollapsible.value || isExpanded.value) return 0
  return Math.max(0, codeLines.value.length - props.maxPreviewLines)
})

const displayedCode = computed(() => {
  if (!isCollapsible.value || isExpanded.value) return normalizedCode.value
  return codeLines.value.slice(0, props.maxPreviewLines).join('\n')
})

const languageClass = computed(() => {
  if (!props.language) return ''
  return `language-${props.language}`
})

const shikiLanguage = computed(() => (props.language || 'text').toLowerCase())

// const sentinelShikiTheme: ThemeRegistrationRaw = {
//   name: 'sentinel',
//   settings: [
//     {
//       scope: ['comment', 'punctuation.definition.comment'],
//       settings: { foreground: 'var(--color-text-muted)' },
//     },
//     {
//       scope: ['keyword', 'storage.type', 'storage.modifier'],
//       settings: { foreground: 'var(--color-accent-primary)' },
//     },
//     {
//       scope: ['string', 'punctuation.definition.string'],
//       settings: { foreground: 'var(--color-text-secondary)' },
//     },
//     {
//       scope: ['constant.numeric'],
//       settings: { foreground: 'var(--color-text-secondary)' },
//     },
//     {
//       scope: ['entity.name.function', 'support.function'],
//       settings: { foreground: 'var(--color-text-secondary)' },
//     },
//     {
//       scope: ['entity.name.type', 'support.type'],
//       settings: { foreground: 'var(--color-text-secondary)' },
//     },
//   ],
//   type: 'light',
//   colors: {
//     'editor.background': 'transparent',
//     'editor.foreground': 'var(--color-text-primary)',
//   },
// }

const highlightedCode = ref<string>('')

let highlightRequestId = 0

async function highlightCode(code: string, lang: string): Promise<string> {
  const { codeToHtml } = await import('shiki/bundle/web')

  try {
    return await codeToHtml(code, {
      lang,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: 'light',
      structure: 'inline',
    })
  } catch {
    if (lang === 'text') throw new Error('Failed to highlight code')

    return codeToHtml(code, {
      lang: 'text',
      themes:
      {
        light: 'github-light',
        dark: 'github-dark'
      },
      defaultColor: 'light',
      structure: 'inline',
    })
  }
}

async function updateHighlight(code: string, lang: string): Promise<void> {
  if (!import.meta.client) return

  const requestId = ++highlightRequestId

  try {
    const html = await highlightCode(code, lang)

    if (requestId !== highlightRequestId) return

    highlightedCode.value = html
  } catch {
    if (requestId !== highlightRequestId) return

    highlightedCode.value = ''
  }
}

onMounted(() => {
  void updateHighlight(displayedCode.value, shikiLanguage.value)
})

watch([displayedCode, shikiLanguage], ([code, lang]: [string, string]) => {
  void updateHighlight(code, lang)
})

async function handleCopy(_: MouseEvent) {
  if (!import.meta.client) return

  let copySucceeded = false

  try {
    await navigator.clipboard.writeText(normalizedCode.value)
    copySucceeded = true
  } catch {
    // Fallback to textarea method for older browsers
    try {
      const textarea = document.createElement('textarea')
      textarea.value = normalizedCode.value
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.top = '0'
      textarea.style.left = '0'
      textarea.style.opacity = '0'

      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      copySucceeded = true
    } catch (fallbackError) {
      console.error('Failed to copy code:', fallbackError)
      toast.error('Failed to copy to clipboard')
    }
  }

  if (copySucceeded) {
    isCopied.value = true
    window.setTimeout(() => {
      isCopied.value = false
    }, CLIPBOARD_FEEDBACK_CODE)
  }
}

function toggleExpanded(_: MouseEvent) {
  isExpanded.value = !isExpanded.value
}

watch(
  () => props.code,
  () => {
    isExpanded.value = false
    isCopied.value = false
  }
)
</script>

<template>
  <div class="rounded-lg border border-border-subtle bg-bg-surface overflow-hidden">
    <div class="flex items-center justify-between gap-4 px-3 py-2 border-b border-border-subtle bg-bg-elevated/50">
      <div class="min-w-0 flex items-center gap-2">
        <span
          v-if="label"
          class="text-xs font-medium text-text-secondary truncate"
        >
          {{ label }}
        </span>

        <span
          v-if="language"
          class="text-[10px] font-mono text-text-muted"
        >
          {{ language }}
        </span>

        <span
          v-if="hiddenLineCount > 0"
          class="text-[10px] text-text-muted"
        >
          +{{ hiddenLineCount }} lines
        </span>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <BaseButton
          v-if="isCollapsible"
          variant="ghost"
          size="sm"
          class="px-2 py-1 text-xs"
          :aria-label="isExpanded ? 'Show less code' : 'Show more code'"
          @click="toggleExpanded"
        >
          <Icon
            :name="isExpanded ? 'lucide:chevrons-up' : 'lucide:chevrons-down'"
            class="w-3.5 h-3.5"
          />
          <span>{{ isExpanded ? 'Show less' : 'Show more' }}</span>
        </BaseButton>

        <BaseButton
          variant="ghost"
          size="sm"
          class="px-2 py-1 text-xs"
          :aria-label="isCopied ? 'Code copied' : 'Copy code'"
          @click="handleCopy"
        >
          <Icon
            :name="isCopied ? 'lucide:check' : 'lucide:copy'"
            class="w-3.5 h-3.5"
          />
          <span>{{ isCopied ? 'Copied' : 'Copy' }}</span>
        </BaseButton>
      </div>
    </div>

    <pre class="p-3 overflow-x-auto">
      <code
        v-if="highlightedCode"
        class="block whitespace-pre font-mono text-xs leading-relaxed text-text-primary"
        :class="languageClass"
        v-html="highlightedCode"
      />
      <code
        v-else
        class="block whitespace-pre font-mono text-xs leading-relaxed text-text-primary"
        :class="languageClass"
      >{{ displayedCode }}</code>
    </pre>
  </div>
</template>

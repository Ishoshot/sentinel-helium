import { createBundledHighlighter, createSingletonShorthands, guessEmbeddedLanguages } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

const bundledLanguages = {
  bash: () => import('shiki/langs/bash'),
  go: () => import('shiki/langs/go'),
  java: () => import('shiki/langs/java'),
  javascript: () => import('shiki/langs/javascript'),
  json: () => import('shiki/langs/json'),
  jsx: () => import('shiki/langs/jsx'),
  php: () => import('shiki/langs/php'),
  python: () => import('shiki/langs/python'),
  ruby: () => import('shiki/langs/ruby'),
  tsx: () => import('shiki/langs/tsx'),
  typescript: () => import('shiki/langs/typescript'),
  vue: () => import('shiki/langs/vue'),
  yaml: () => import('shiki/langs/yaml'),
} as const

const bundledThemes = {
  'github-dark': () => import('shiki/themes/github-dark'),
  'github-light': () => import('shiki/themes/github-light'),
} as const

type SupportedLanguage = keyof typeof bundledLanguages
type HighlightLanguage = SupportedLanguage | 'text'

const languageAliases: Record<string, SupportedLanguage> = {
  cjs: 'javascript',
  js: 'javascript',
  jsx: 'jsx',
  mjs: 'javascript',
  mts: 'typescript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  ts: 'typescript',
  tsx: 'tsx',
  vue: 'vue',
  yml: 'yaml',
}

const createHighlighter = createBundledHighlighter({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createJavaScriptRegexEngine(),
})

const { codeToHtml } = createSingletonShorthands(createHighlighter, { guessEmbeddedLanguages })

function resolveLanguage(language: string): HighlightLanguage {
  const normalizedLanguage = language.trim().toLowerCase()

  if (!normalizedLanguage) {
    return 'text'
  }

  if (normalizedLanguage in bundledLanguages) {
    return normalizedLanguage as SupportedLanguage
  }

  const aliasedLanguage = languageAliases[normalizedLanguage]

  return aliasedLanguage ?? 'text'
}

export async function highlightCodeHtml(code: string, language: string): Promise<string> {
  const resolvedLanguage = resolveLanguage(language)

  return codeToHtml(code, {
    lang: resolvedLanguage,
    themes: {
      dark: 'github-dark',
      light: 'github-light',
    },
    defaultColor: 'light',
    structure: 'inline',
  })
}

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default withNuxt(
  // Ignore generated directories
  {
    ignores: ['.nuxt/**', '.output/**', 'node_modules/**', 'dist/**'],
  },
  // Vue plugin configuration for standalone: false mode
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.mts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'vue/no-multiple-template-root': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'off',
      'vue/one-component-per-file': 'off',
      'vue/prefer-import-from-vue': 'off',
      'vue/no-v-html': ['warn', { ignorePattern: '^highlightedCode$' }],
    },
  }
)

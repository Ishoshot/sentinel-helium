declare module 'shiki/langs/*' {
  import type { LanguageRegistration, MaybeArray } from '@shikijs/types'

  const language: MaybeArray<LanguageRegistration>
  export default language
}

declare module 'shiki/themes/*' {
  import type { ThemeRegistrationAny } from '@shikijs/types'

  const theme: ThemeRegistrationAny
  export default theme
}

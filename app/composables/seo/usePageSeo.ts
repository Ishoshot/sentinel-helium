const SITE_URL = 'https://usesentinel.ai'
const SITE_NAME = 'Sentinel'

interface PageSeoOptions {
  title: string
  description: string
  path: string
  ogImage?: string
}

export function usePageSeo({ title, description, path, ogImage }: PageSeoOptions): void {
  const canonicalUrl = `${SITE_URL}${path}`
  const image = ogImage ?? `${SITE_URL}/og-image.png`

  const fullTitle = title === SITE_NAME
    ? `${SITE_NAME} - AI-Powered Code Reviews`
    : `${title} - ${SITE_NAME}`

  useSeoMeta({
    title: fullTitle,
    description,
    ogTitle: fullTitle,
    ogDescription: description,
    ogUrl: canonicalUrl,
    ogImage: image,
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: image,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
  })
}

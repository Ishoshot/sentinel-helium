import { hasToken } from '~/services/api'

/**
 * Auth middleware - protects routes that require authentication
 * Redirects to /login if user is not authenticated
 */
export default defineNuxtRouteMiddleware(() => {
  // Only check on client side
  if (import.meta.server) return

  if (!hasToken()) {
    return navigateTo('/login')
  }
})

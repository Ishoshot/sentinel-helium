import { hasToken } from '~/services/api'

/**
 * Guest middleware - protects routes that should only be accessible to unauthenticated users
 * Redirects to home if user is already authenticated
 */
export default defineNuxtRouteMiddleware(() => {
  // Only check on client side
  if (import.meta.server) return

  if (hasToken()) {
    return navigateTo('/')
  }
})

import type { ApiErrorResponse } from '~/types'

// Token storage key
const TOKEN_KEY = 'auth_token'

/**
 * Get the stored auth token
 */
export function getToken(): string | null {
  if (import.meta.server) return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Set the auth token
 */
export function setToken(token: string): void {
  if (import.meta.server) return
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Clear the auth token
 */
export function clearToken(): void {
  if (import.meta.server) return
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Check if user is authenticated
 */
export function hasToken(): boolean {
  return !!getToken()
}

/**
 * API error class for typed error handling
 */
export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

/**
 * Create the API client with authentication
 */
export function useApiClient() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  const $api = $fetch.create({
    baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    onRequest({ options }) {
      const token = getToken()
      if (token) {
        const headers = new Headers(options.headers as HeadersInit)
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
      }
    },
    onResponseError({ response }) {
      const data = response._data as ApiErrorResponse | undefined
      throw new ApiError(
        data?.message || 'An error occurred',
        response.status,
        data?.errors
      )
    },
  })

  return { $api, baseURL }
}

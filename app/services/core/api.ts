import type { ApiErrorResponse } from '~/types'
import { ErrorCategory, HttpStatus, StorageKey } from '~/types'

/**
 * Get the stored auth token
 */
export function getToken(): string | null {
  if (import.meta.server) return null
  return localStorage.getItem(StorageKey.AuthToken)
}

/**
 * Set the auth token
 */
export function setToken(token: string): void {
  if (import.meta.server) return
  localStorage.setItem(StorageKey.AuthToken, token)
}

/**
 * Clear the auth token
 */
export function clearToken(): void {
  if (import.meta.server) return
  localStorage.removeItem(StorageKey.AuthToken)
}

/**
 * Check if user is authenticated
 */
export function hasToken(): boolean {
  return !!getToken()
}

/**
 * Human-readable error messages by status code
 */
const ERROR_MESSAGES: Record<number, string> = {
  [HttpStatus.BadRequest]: 'The request was invalid. Please check your input.',
  [HttpStatus.Unauthorized]: 'Your session has expired. Please sign in again.',
  [HttpStatus.Forbidden]: 'You do not have permission to perform this action.',
  [HttpStatus.NotFound]: 'The requested resource was not found.',
  [HttpStatus.Conflict]: 'This action conflicts with the current state.',
  [HttpStatus.UnprocessableEntity]: 'Please check your input and try again.',
  [HttpStatus.TooManyRequests]: 'Too many requests. Please wait a moment and try again.',
  [HttpStatus.InternalServerError]: 'Something went wrong on our end. Please try again.',
  [HttpStatus.BadGateway]: 'Unable to connect to the server. Please try again.',
  [HttpStatus.ServiceUnavailable]: 'Service temporarily unavailable. Please try again later.',
}

/**
 * Get error category from status code
 */
export function getErrorCategory(status: number): ErrorCategory {
  if (status === HttpStatus.Unauthorized) return ErrorCategory.Auth
  if (status === HttpStatus.Forbidden) return ErrorCategory.Permission
  if (status === HttpStatus.NotFound) return ErrorCategory.NotFound
  if (status === HttpStatus.UnprocessableEntity) return ErrorCategory.Validation
  if (status === HttpStatus.TooManyRequests) return ErrorCategory.RateLimit
  if (status >= HttpStatus.InternalServerError) return ErrorCategory.Server
  return ErrorCategory.Unknown
}

/**
 * API error class for typed error handling
 */
export class ApiError extends Error {
  status: number
  category: ErrorCategory
  errors?: Record<string, string[]>
  isRetryable: boolean

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.category = getErrorCategory(status)
    this.errors = errors
    // 5xx errors and rate limits are retryable
    this.isRetryable = status >= HttpStatus.InternalServerError || status === HttpStatus.TooManyRequests
  }

  /**
   * Get the first validation error message
   */
  get firstError(): string | null {
    if (!this.errors) return null
    const firstField = Object.keys(this.errors)[0]
    if (!firstField) return null
    return this.errors[firstField]?.[0] ?? null
  }

  /**
   * Get all validation errors as a flat array
   */
  get allErrors(): string[] {
    if (!this.errors) return []
    return Object.values(this.errors).flat()
  }

  /**
   * Check if this is an authentication error
   */
  get isAuthError(): boolean {
    return this.category === ErrorCategory.Auth
  }

  /**
   * Check if this is a permission error
   */
  get isPermissionError(): boolean {
    return this.category === ErrorCategory.Permission
  }

  /**
   * Check if this is a validation error
   */
  get isValidationError(): boolean {
    return this.category === ErrorCategory.Validation
  }
}

/**
 * Network error class for connection issues
 */
export class NetworkError extends Error {
  category: ErrorCategory = ErrorCategory.Network
  isRetryable = true

  constructor(message = 'Unable to connect. Please check your internet connection.') {
    super(message)
    this.name = 'NetworkError'
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
    onRequestError() {
      // Network error - couldn't reach the server
      throw new NetworkError()
    },
    onResponseError({ response }) {
      const data = response._data as ApiErrorResponse | undefined

      // Use API message if available, otherwise use default message
      const message =
        data?.message ||
        ERROR_MESSAGES[response.status] ||
        'An unexpected error occurred'

      throw new ApiError(message, response.status, data?.errors)
    },
  })

  return { $api, baseURL }
}

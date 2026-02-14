type LogContext = unknown

type LogLevel = 'debug' | 'warn' | 'error' | 'silent'

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  warn: 20,
  error: 30,
  silent: 40,
}

const LOG_LEVEL_STORAGE_KEY = 'sentinel:log-level'
const DEFAULT_LOG_LEVEL: LogLevel = 'error'

function parseLogLevel(value: unknown): LogLevel | null {
  if (
    value === 'debug'
    || value === 'warn'
    || value === 'error'
    || value === 'silent'
  ) {
    return value
  }

  return null
}

function resolveLogLevel(): LogLevel {
  if (!import.meta.dev) {
    return 'silent'
  }

  const envLevel = parseLogLevel(import.meta.env.VITE_SENTINEL_LOG_LEVEL)

  if (envLevel) {
    return envLevel
  }

  if (typeof window !== 'undefined') {
    try {
      const storedLevel = parseLogLevel(window.localStorage.getItem(LOG_LEVEL_STORAGE_KEY))

      if (storedLevel) {
        return storedLevel
      }
    } catch {
      return DEFAULT_LOG_LEVEL
    }
  }

  return DEFAULT_LOG_LEVEL
}

function shouldLog(level: Exclude<LogLevel, 'silent'>): boolean {
  const activeLevel = resolveLogLevel()
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[activeLevel]
}

function isDebugEnabled(): boolean {
  return shouldLog('debug')
}

export function logDebug(message: string, context?: LogContext): void {
  if (!isDebugEnabled()) {
    return
  }

  if (context === undefined) {
    console.debug(`[Sentinel] ${message}`)
    return
  }

  console.debug(`[Sentinel] ${message}`, context)
}

export function logWarn(message: string, context?: LogContext): void {
  if (!shouldLog('warn')) {
    return
  }

  if (context === undefined) {
    console.warn(`[Sentinel] ${message}`)
    return
  }

  console.warn(`[Sentinel] ${message}`, context)
}

export function logError(message: string, context?: LogContext): void {
  if (!shouldLog('error')) {
    return
  }

  if (context === undefined) {
    console.error(`[Sentinel] ${message}`)
    return
  }

  console.error(`[Sentinel] ${message}`, context)
}

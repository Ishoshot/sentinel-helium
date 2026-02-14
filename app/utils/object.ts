/**
 * Safely access nested object properties using dot notation
 * @param obj The object to access
 * @param path The path to the property (e.g. 'metadata.user.name')
 * @param defaultValue Value to return if path doesn't exist
 */
export function getNestedValue(
  obj: unknown,
  path: string,
  defaultValue: unknown = undefined
): unknown {
  const keys = path.split('.')
  let result: unknown = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }

    if (typeof result !== 'object') {
      return defaultValue
    }

    result = (result as Record<string, unknown>)[key]
  }

  return result === undefined ? defaultValue : result
}

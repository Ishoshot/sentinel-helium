/**
 * Safely access nested object properties using dot notation
 * @param obj The object to access
 * @param path The path to the property (e.g. 'metadata.user.name')
 * @param defaultValue Value to return if path doesn't exist
 */
export function getNestedValue(
  obj: any,
  path: string,
  defaultValue: any = undefined
): any {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}

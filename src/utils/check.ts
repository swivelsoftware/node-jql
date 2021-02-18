/**
 * Check whether a value is null, or undefined
 * @param value [any]
 */
export function checkNull<T = null>(value: any): value is T {
  return !value && (value === undefined || value === null)
}

/**
 * Check if value is undefined
 * @param value [any]
 */
export function checkNull(value: any): boolean {
  return value === undefined || value === null
}

/**
 * Check if two arrays are equal
 * @param lhs [Array]
 * @param rhs [Array]
 */
export function equals<T>(lhs: T[], rhs: T[], equalFn = (l, r) => l === r): boolean {
  if (lhs.length !== rhs.length) return false
  for (const li of lhs) {
    if (!rhs.find(ri => equalFn(li, ri))) return false
  }
  return true
}

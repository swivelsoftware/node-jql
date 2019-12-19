import './expression/__init__'

/**
 * Syntax type for different databases
 */
export const dbType = 'mysql'

/**
 * Check whether this is an undefined value
 * @param value [any]
 */
export function isUndefined(value: any): boolean {
  return typeof value === 'undefined' || value === null
}

/**
 * Check whether this is a valid JSON
 * @param value [string]
 */
export function isJSON(value: string): boolean {
  try {
    JSON.parse(value)
    return true
  }
  catch (e) {
    return false
  }
}

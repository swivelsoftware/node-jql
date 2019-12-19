import { Expression } from '.'
import { isJSON } from '..'
import { ColumnExpression } from './column'
import { FunctionExpression } from './function'
import { Value } from './value'

/**
 * Formats for specific functions
 * Default format is '{0}, {1}, {2}, ...'
 */
export const formats = {
  mysql: {
    // String functions
    POSITION: '{0} IN {1}',

    // Date functions
    ADDDATE: '{0}, INTERVAL {1} {2}',
    DATE_ADD: '{0}, INTERVAL {1} {2}',
    DATE_SUB: '{0}, INTERVAL {1} {2}',
    EXTRACT: '{0} FROM {1}',
    SUBDATE: '{0}, INTERVAL {1} {2}',
    CAST: '{0} AS {1}',

    // JSON functions
    JSON_TABLE: '{0}, {1} {2}',
  },
}

/**
 * Validations for function arguments
 */
export const validations = {
  mysql: {
    JSON_TABLE(args: Expression[]): boolean {
      const $0 = args[0]
      if (
        !($0 instanceof Value && isJSON($0.value)) || // Simple JSON string
        !($0 instanceof ColumnExpression) ||          // A column with JSON string. Used after another table
        !($0 instanceof FunctionExpression)           // A function call returning JSON string
      ) {
        return false
      }
      const $2 = args[2]
      if (!($2 instanceof FunctionExpression && $2.name.toLocaleUpperCase() !== 'COLUMNS')) {
        return false
      }
      return true
    },
  },
}

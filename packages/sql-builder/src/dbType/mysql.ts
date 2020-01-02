import { isJSON } from '..'
import { register } from '../dbType'
import { Expression } from '../expression'
import { ColumnExpression } from '../expression/column'
import { FunctionExpression } from '../expression/function'
import { Value } from '../expression/value'

/**
 * Register mysql
 */
register('mysql', {
  functions: {
    formats: {
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
    validations: {
      JSON_TABLE(args: Expression[]): boolean {
        const $0 = args[0]
        if (!(
          ($0 instanceof Value && isJSON($0.value)) ||  // Simple JSON string
          ($0 instanceof ColumnExpression) ||           // A column with JSON string. Used after another table
          ($0 instanceof FunctionExpression)            // A function call returning JSON string
        )) {
          return false
        }
        const $1 = args[1]
        if (!($1 instanceof Value && typeof $1.value === 'string')) {
          return false
        }
        const $2 = args[2]
        if (!($2 instanceof FunctionExpression && $2.name.toLocaleUpperCase() === 'COLUMNS')) {
          return false
        }
        return true
      },
    },
  },
})

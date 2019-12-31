import './expression/__init__'

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

/**
 * Stringify the given value
 * @param value [any]
 */
export function stringify(value: any): string {
  switch (typeof value) {
    case 'object':
      if (value instanceof Date) {
        return value.toISOString()
      }
      else {
        return JSON.stringify(value)
      }
    case 'undefined':
      return 'NULL'
    case 'function':
    case 'symbol':
      throw new Error(`Invalid value type '${typeof value}'`)
    default:
      return JSON.stringify(value)
  }
}

export { CreateSchema } from './create/schema'
export { CreateTable, CreateTableSelect } from './create/table'
export { Column } from './column'
export { Constraint, PrimaryKeyConstraint } from './constraint'

export { Datasource, FromFunctionTable, FromTable, Query, ResultColumn } from './select'
export { Insert, InsertSelect } from './insert'

export { BetweenExpression } from './expression/between'
export { BinaryExpression } from './expression/binary'
export { CaseExpression } from './expression/case'
export { ColumnExpression } from './expression/column'
export { ExistsExpression } from './expression/exists'
export { FunctionExpression } from './expression/function'
export { GroupExpression } from './expression/group'
export { MathExpression } from './expression/math'
export { QueryExpression } from './expression/query'
export { Unknown } from './expression/unknown'
export { Value } from './expression/value'
export { Variable } from './expression/variable'

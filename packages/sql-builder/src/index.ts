import './expression/__init__'

/**
 * Syntax type for different databases
 */
export let dbType = 'mysql'

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

export { CreateSchema } from './create/schema'
export { CreateTable, CreateTableSelect } from './create/table'
export { Column } from './column'
export { Constraint, PrimaryKeyConstraint } from './constraint'

export { Datasource, FromFunctionTable, FromTable, Query, ResultColumn } from './select'

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

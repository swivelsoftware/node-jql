import * as $ from './dbType'
import './dbType/__init__'
import { stringify as jsonStringify } from './dbType/stringify'
import './expression/__init__'
import { IStringify, IType } from './index.if'

/**
 * Type
 */
export class Type implements IType, IStringify {
  public readonly name: string
  public readonly args: any[] = []

  constructor(name: string, ...args: any[])
  constructor(json: IType)
  constructor(...args: any[]) {
    if (typeof args[0] === 'string') {
      this.name = args[0]
      if (args.length > 1) this.args = args.slice(1)
    }
    else {
      const json = args[0] as IType
      this.name = json.name
      if (json.args) this.args = json.args
    }
  }

  // @override
  public toString(): string {
    return jsonStringify(Type.name, this)
  }

  // @override
  public toJson(): IType {
    const json: IType = {
      name: this.name,
    }
    if (this.args.length) json.args = this.args
    return json
  }
}

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

export default $

export { BetweenExpression } from './expression/between'
export { BinaryExpression } from './expression/binary'
export { CaseExpression } from './expression/case'
export { ColumnDefExpression } from './expression/column-def'
export { ColumnExpression } from './expression/column'
export { ExistsExpression } from './expression/exists'
export { FunctionExpression } from './expression/function'
export { GroupExpression } from './expression/group'
export { MathExpression } from './expression/math'
export { QueryExpression } from './expression/query'
export { Unknown } from './expression/unknown'
export { Value } from './expression/value'
export { Variable } from './expression/variable'

export { CreateSchema } from './create/schema'
export { CreateTable, CreateTableSelect } from './create/table'
export { Column } from './column'
export { Constraint, PrimaryKeyConstraint } from './constraint'

export { Delete } from './delete'

export { DropSchema } from './drop/schema'
export { DropTable } from './drop/table'

export { Datasource, FromFunctionTable, FromTable, Query, ResultColumn } from './select'
export { Insert, InsertSelect } from './insert'

export { Update } from './update'

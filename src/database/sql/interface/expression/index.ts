import squel = require('squel')

export type Parameter = IExpression | string | number | boolean

export abstract class Expression implements IExpression, IUnknownExpression {
  public classname?: string
  public symbol?: symbol
  public parameters?: Parameter[]

  constructor(json?: IExpression) {
    switch (typeof json) {
      case 'object':
        this.parameters = json.parameters
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public abstract toSquel(): squel.BaseBuilder

  public toString(): string {
    return this.toSquel().toString()
  }
}

export interface IExpression {
  classname?: string
  symbol?: symbol
  [key: string]: any
}

export interface IUnknownExpression {
  parameters?: any[]
}

export { BetweenExpression as $between, IBetweenExpression } from './between'
export { BinaryExpression as $binary, IBinaryExpression } from './binary'
export { CaseExpression as $case, ICaseExpression } from './case'
export { ColumnExpression as $column, IColumnExpression } from './column'
export { ExistsExpression as $exists, IExistsExpression } from './exists'
export { FunctionExpression as $function, IFunctionExpression } from './function'
export { AndGroupedExpression as $and, OrGroupedExpression as $or, IGroupedExpression } from './grouped'
export { InExpression as $in, InJson } from './in'
export { ValueExpression as $value, IValueExpression } from './value'

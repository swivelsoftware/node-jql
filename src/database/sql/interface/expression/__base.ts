import squel = require('squel')
import { JQLError } from '../../../../utils/error'

export type Parameter = IExpression | string | number | boolean | string[] | number[]

export function isIExpression(value: any): value is IExpression {
  return 'classname' in value
}

export abstract class Expression implements IExpression, IUnknownExpression {
  public classname?: string
  public symbol?: symbol
  public parameters?: Parameter[]

  constructor(json?: IExpression) {
    switch (typeof json) {
      case 'object':
        this.parameters = json.parameters ? [...json.parameters] : undefined
        break
      case 'undefined':
        break
      default:
        throw new JQLError(`invalid 'json' object`)
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

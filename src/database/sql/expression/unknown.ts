import { JQLError } from '../../../utils/error'
import { getType, Type } from '../../schema'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledExpression, Expression } from './core'

export interface IUnknownExpression {
  types?: Type[]|Type
}

export class UnknownExpression extends Expression implements IUnknownExpression {
  public readonly classname: string = 'UnknownExpression'
  public types?: Type[]

  constructor(json: IUnknownExpression) {
    super()
    this.types = json.types ? (Array.isArray(json.types) ? json.types : [json.types]) : undefined
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledUnknownExpression {
    return new CompiledUnknownExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

export class CompiledUnknownExpression extends CompiledExpression {
  private readonly types: Type[]
  private value_: any

  constructor(transaction: Transaction, options: ICompileSqlOptions<UnknownExpression>) {
    super(transaction, options)
    this.types = options.parent.types || []
  }

  get value(): any {
    return this.value_
  }

  set value(value: any) {
    if (this.types && this.types.indexOf('any') === -1 && !this.check(value, ...this.types)) {
      throw new JQLError(`Expects '${this.types}' but received '${getType(value)}'`)
    }
    this.value_ = value
  }

  private check(value: any, ...types: Type[]): boolean {
    if (types.length === 1) {
      switch (types[0]) {
        case 'any':
          return true
        case 'Date':
          return value instanceof Date
        case 'RegExp':
          return value instanceof RegExp
        default:
          return typeof value === types[0]
      }
    }
    return this.check(value, types[0]) || this.check(value, ...types.slice(1))
  }
}

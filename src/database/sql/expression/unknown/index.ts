import squel = require('squel')
import { JQLError } from '../../../../utils/error'
import { getType, Type } from '../../../schema/interface'
import { Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { CompiledExpression, Expression } from '../interface'
import { IUnknownExpression } from './interface'

/**
 * representing an unknown value
 */
export class UnknownExpression extends Expression implements IUnknownExpression {
  public readonly classname = 'UnknownExpression'
  public types?: Type[]

  constructor(json: IUnknownExpression) {
    super()
    this.types = json.types ? (Array.isArray(json.types) ? json.types : [json.types]) : undefined
  }

  // @override
  public validate() {
    // do nothing
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledUnknownExpression {
    return new CompiledUnknownExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr('?')
  }
}

/**
 * compiled `UnknownExpression`
 * able to assign a value to the instance
 */
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

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    unknowns.push(this)
  }

  // @override
  public evaluate(): any {
    return this.value
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

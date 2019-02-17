import { JQLError } from '../../../utils/error'
import { Type } from '../../schema'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledExpression, Expression } from './core'

export interface IValueExpression {
  value: any
  type?: Type
}

export class ValueExpression extends Expression implements IValueExpression {
  public readonly classname: string = 'ValueExpression'
  public value: any
  public type: Type

  constructor(json: IValueExpression) {
    super()
    try {
      const type = typeof json.value
      if (type === 'bigint' || type === 'undefined' || type === 'function') throw new JQLError(`Invalid type '${type}'`)

      this.value = json.value
      this.type = json.type || type
    }
    catch (e) {
      throw new JQLError('Fail to instantiate ValueExpression', e)
    }
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledValueExpression {
    return new CompiledValueExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

export class CompiledValueExpression extends CompiledExpression {
  public readonly value: any
  public readonly type: Type

  constructor(transaction: Transaction, options: ICompileSqlOptions<ValueExpression>) {
    super(transaction, options)
    this.value = options.parent.value
    this.type = options.parent.type
  }
}

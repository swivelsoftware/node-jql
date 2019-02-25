import squel = require('squel')
import { JQLError } from '../../../../utils/error'
import { Type } from '../../../schema/interface'
import { Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { CompiledExpression, Expression } from '../interface'
import { IValueExpression } from './interface'

/**
 * representing an assigned value
 */
export class ValueExpression extends Expression implements IValueExpression {
  public readonly classname = 'ValueExpression'
  public value: any
  public type: Type

  constructor(json: any|IValueExpression) {
    super()
    try {
      if (typeof json !== 'object') json = { value: json }
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
  public validate() {
    // do nothing
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledValueExpression {
    return new CompiledValueExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr('?', this.value)
  }
}

/**
 * compiled `ValueExpression`
 * readonly value
 */
export class CompiledValueExpression extends CompiledExpression {
  public readonly value: any
  public readonly type: Type

  constructor(transaction: Transaction, options: ICompileSqlOptions<ValueExpression>) {
    super(transaction, options)
    this.value = options.parent.value
    this.type = options.parent.type
  }

  // @override
  public register() {
    // do nothing
  }

  // @override
  public evaluate(): any {
    return this.value
  }
}

import { JQLError } from '../../../utils/error'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledQuery, IQuery, isIQuery, Query } from '../query/core'
import { CompiledExpression, Expression, IConditionalExpression } from './core'
import { parseExpression } from './utils'
import { CompiledValueExpression, ValueExpression } from './value'

export interface IInExpression {
  $not?: boolean
  left: any
  right: any|IQuery
}

export class InExpression extends Expression implements IConditionalExpression, IInExpression {
  public readonly classname = 'InExpression'
  public $not?: boolean
  public left: Expression
  public right: ValueExpression|Query

  constructor(json: IInExpression) {
    super()
    this.$not = json.$not
    try {
      this.left = parseExpression(json.left)
      if (json.right) {
        if (isIQuery(json.right)) {
          this.right = new Query(json.right)
        }
        else if (!Array.isArray(json.right)) {
          throw new JQLError('An array is preferred, instead of a single value')
        }
        else {
          this.right = parseExpression(json.right) as ValueExpression
        }
      }
    }
    catch (e) {
      throw new JQLError('Fail to instantiate InExpression', e)
    }
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledInExpression {
    return new CompiledInExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

export class CompiledInExpression extends CompiledExpression {
  public readonly $not?: boolean
  public readonly left: CompiledExpression
  public readonly right: CompiledValueExpression|CompiledQuery

  constructor(transaction: Transaction, options: ICompileSqlOptions<InExpression>) {
    super(transaction, options)
    this.$not = options.parent.$not
    try {
      this.left = options.parent.left.compile(transaction, options)
      this.right = options.parent.right.compile(transaction/* TODO , options */)
    }
    catch (e) {
      throw new JQLError('Fail to compile InExpression', e)
    }
  }
}

import { JQLError } from '../../../utils/error'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledExpression, Expression, IConditionalExpression } from './core'
import { parseExpression } from './utils'

export interface IIsNullExpression {
  $not?: boolean
  left: any
}

export class IsNullExpression extends Expression implements IConditionalExpression, IIsNullExpression {
  public readonly classname: string = 'IsNullExpression'
  public $not?: boolean
  public left: Expression

  constructor(json: IIsNullExpression) {
    super()
    this.$not = json.$not
    try {
      this.left = parseExpression(json.left)
    }
    catch (e) {
      throw new JQLError('Fail to instantiate IsNullExpression', e)
    }
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledIsNullExpression {
    return new CompiledIsNullExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

export class CompiledIsNullExpression extends CompiledExpression {
  public readonly $not?: boolean
  public readonly left: CompiledExpression

  constructor(transaction: Transaction, options: ICompileSqlOptions<IsNullExpression>) {
    super(transaction, options)
    try {
      this.$not = options.parent.$not
      this.left = options.parent.left.compile(transaction, options)
    }
    catch (e) {
      throw new JQLError('Fail to compile IsNullExpression', e)
    }
  }
}

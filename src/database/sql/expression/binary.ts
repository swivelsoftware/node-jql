import { JQLError } from '../../../utils/error'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledExpression, Expression, IConditionalExpression } from './core'
import { parseExpression } from './utils'

export type BinaryOperator = '='|'<>'|'<'|'<='|'>'|'>='

export interface IBinaryExpression {
  left: any
  operator: BinaryOperator
  right: any
}

export class BinaryExpression extends Expression implements IConditionalExpression, IBinaryExpression {
  public readonly classname: string = 'BinaryExpression'
  public left: Expression
  public operator: BinaryOperator
  public right: Expression

  constructor(json: IBinaryExpression) {
    super()
    try {
      this.left = parseExpression(json.left)
      this.operator = json.operator
      this.right = parseExpression(json.right)
    }
    catch (e) {
      throw new JQLError('Fail to instantiate BinaryExpression', e)
    }
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledBinaryExpression {
    return new CompiledBinaryExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

export class CompiledBinaryExpression extends CompiledExpression {
  public readonly left: CompiledExpression
  public readonly operator: BinaryOperator
  public readonly right: CompiledExpression

  constructor(transaction: Transaction, options: ICompileSqlOptions<BinaryExpression>) {
    super(transaction, options)
    try {
      this.left = options.parent.left.compile(transaction, options)
      this.operator = options.parent.operator
      this.right = options.parent.right.compile(transaction, options)
    }
    catch (e) {
      throw new JQLError('Fail to compile BinaryExpression', e)
    }
  }
}

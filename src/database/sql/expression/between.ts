import { JQLError } from '../../../utils/error'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledExpression, Expression, IConditionalExpression } from './core'
import { parseExpression } from './utils'

export interface IBetweenExpression {
  $not?: boolean
  left: any
  start: any
  end: any
}

export class BetweenExpression extends Expression implements IConditionalExpression, IBetweenExpression {
  public readonly classname: string = 'BetweenExpression'
  public $not?: boolean
  public left: Expression
  public start: Expression
  public end: Expression

  constructor(json: IBetweenExpression) {
    super()
    try {
      this.$not = json.$not
      this.left = parseExpression(json.left)
      this.start = parseExpression(json.start)
      this.end = parseExpression(json.end)
    }
    catch (e) {
      throw new JQLError('Fail to instantiate BetweenExpression', e)
    }
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledBetweenExpression {
    return new CompiledBetweenExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

export class CompiledBetweenExpression extends CompiledExpression {
  public readonly $not?: boolean
  public readonly left: CompiledExpression
  public readonly start: CompiledExpression
  public readonly end: CompiledExpression

  constructor(transaction: Transaction, options: ICompileSqlOptions<BetweenExpression>) {
    super(transaction, options)
    try {
      this.$not = options.parent.$not
      this.left = options.parent.left.compile(transaction, options)
      this.start = options.parent.start.compile(transaction, options)
      this.end = options.parent.end.compile(transaction, options)
    }
    catch (e) {
      throw new JQLError('Fail to compile BetweenExpression', e)
    }
  }
}

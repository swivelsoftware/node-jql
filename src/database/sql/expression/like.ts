import { JQLError } from '../../../utils/error'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledExpression, Expression, IConditionalExpression } from './core'
import { CompiledUnknownExpression, UnknownExpression } from './unknown'
import { parseExpression } from './utils'
import { CompiledValueExpression, ValueExpression } from './value'

export interface ILikeExpression {
  $not?: boolean
  left: any
  right?: string
}

export class LikeExpression extends Expression implements IConditionalExpression, ILikeExpression {
  public readonly classname: string = 'LikeExpression'
  public $not?: boolean
  public left: Expression
  public right?: string

  constructor(json: ILikeExpression) {
    super()
    try {
      this.$not = json.$not
      this.left = parseExpression(json.left)
      this.right = json.right
    }
    catch (e) {
      throw new JQLError('Fail to instantiate LikeExpression', e)
    }
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledLikeExpression {
    return new CompiledLikeExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

export class CompiledLikeExpression extends CompiledExpression {
  public readonly $not?: boolean
  public readonly left: CompiledExpression
  public readonly right: CompiledUnknownExpression|CompiledValueExpression

  constructor(transaction: Transaction, options: ICompileSqlOptions<LikeExpression>) {
    super(transaction, options)
    this.$not = options.parent.$not
    try {
      this.left = options.parent.left.compile(transaction, options)
      let right: UnknownExpression|ValueExpression
      if (options.parent.right) {
        right = new ValueExpression({
          value: new RegExp(options.parent.right),
          type: 'RegExp',
        })
      }
      else {
        right = new UnknownExpression({ types: 'string' })
      }
      this.right = right.compile(transaction, options)
    }
    catch (e) {
      throw new JQLError('Fail to compile LikeExpression', e)
    }
  }
}

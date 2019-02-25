import squel = require('squel')
import { parseExpression } from '..'
import { JQLError } from '../../../../utils/error'
import { ICursor } from '../../../cursor/interface'
import { Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { CompiledExpression, ConditionalExpression, Expression } from '../interface'
import { CompiledUnknownExpression } from '../unknown'
import { UnknownExpression } from '../unknown'
import { CompiledValueExpression } from '../value'
import { ValueExpression } from '../value'
import { ILikeExpression } from './interface'

export class LikeExpression extends ConditionalExpression implements ILikeExpression {
  public readonly classname = 'LikeExpression'
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
  public validate(tables: string[]) {
    this.left.validate(tables)
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledLikeExpression {
    return new CompiledLikeExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.Expression {
    const params = [this.left.toSquel()] as any[]
    if (this.right) params.push(this.right)
    return squel.expr()
      .and(
        `? ${this.$not ? 'NOT ' : ''}LIKE ?`,
        ...params,
      )
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

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    this.left.register(unknowns)
    this.right.register(unknowns)
  }

  // @override
  public evaluate(transaction: Transaction, cursor: ICursor): boolean {
    const left = this.left.evaluate(transaction, cursor)
    let right = this.right.evaluate() as RegExp|string
    if (!(right instanceof RegExp)) right = new RegExp(right)
    let result = right.test(left)
    if (this.$not) result = !result
    return result
  }
}

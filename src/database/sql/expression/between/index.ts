import squel = require('squel')
import { parseExpression } from '..'
import { JQLError } from '../../../../utils/error'
import { ICursor } from '../../../cursor/interface'
import { Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { CompiledExpression, ConditionalExpression, Expression } from '../interface'
import { CompiledUnknownExpression } from '../unknown'
import { IBetweenExpression } from './interface'

/**
 * expression `? BETWEEN ? AND ?`
 * ignore type checking
 */
export class BetweenExpression extends ConditionalExpression implements IBetweenExpression {
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
  public validate(tables: string[]) {
    this.left.validate(tables)
    this.start.validate(tables)
    this.end.validate(tables)
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledBetweenExpression {
    return new CompiledBetweenExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `? ${this.$not ? 'NOT ' : ''}BETWEEN ? AND ?`,
        this.left.toSquel(),
        this.start.toSquel(),
        this.end.toSquel(),
      )
  }
}

/**
 * compiled `BetweenExpression`
 */
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

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    this.left.register(unknowns)
    this.start.register(unknowns)
    this.end.register(unknowns)
  }

  // @override
  public evaluate(transaction: Transaction, cursor: ICursor): boolean {
    const left = this.left.evaluate(transaction, cursor)
    const start = this.start.evaluate(transaction, cursor)
    const end = this.end.evaluate(transaction, cursor)
    let result = start <= left && left <= end
    if (this.$not) result = !result
    return result
  }
}

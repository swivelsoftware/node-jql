import squel = require('squel')
import { parseExpression } from '..'
import { JQLError } from '../../../../utils/error'
import { ICursor } from '../../../cursor/interface'
import { Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { CompiledExpression, ConditionalExpression, Expression } from '../interface'
import { CompiledUnknownExpression } from '../unknown'
import { IIsNullExpression } from './interface'

/**
 * expression `? IS NULL`
 */
export class IsNullExpression extends ConditionalExpression implements IIsNullExpression {
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
  public validate(tables: string[]) {
    this.left.validate(tables)
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledIsNullExpression {
    return new CompiledIsNullExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `? IS ${this.$not ? 'NOT ' : ''}NULL`,
        this.left.toSquel(),
      )
  }
}

/**
 * compiled `IsNullExpression`
 */
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

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    this.left.register(unknowns)
  }

  // @override
  public evaluate(transaction: Transaction, cursor: ICursor): boolean {
    const left = this.left.evaluate(transaction, cursor)
    let result = left === null || left === undefined
    if (this.$not) result = !result
    return result
  }
}

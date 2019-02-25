import squel = require('squel')
import { parseExpression } from '..'
import { JQLError } from '../../../../utils/error'
import { ICursor } from '../../../cursor/interface'
import { Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { CompiledExpression, ConditionalExpression, Expression } from '../interface'
import { CompiledUnknownExpression } from '../unknown'
import { BinaryOperator, IBinaryExpression } from './interface'

/**
 * expression `? $operator ?`
 */
export class BinaryExpression extends ConditionalExpression implements IBinaryExpression {
  public readonly classname = 'BinaryExpression'
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
  public validate(tables: string[]) {
    this.left.validate(tables)
    this.right.validate(tables)
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledBinaryExpression {
    return new CompiledBinaryExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `? ${this.operator} ?`,
        this.left.toSquel(),
        this.right.toSquel(),
      )
  }
}

/**
 * compiled `BinaryExpression`
 */
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

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    this.left.register(unknowns)
    this.right.register(unknowns)
  }

  // @override
  public evaluate(transaction: Transaction, cursor: ICursor): boolean {
    const left = this.left.evaluate(transaction, cursor)
    const right = this.right.evaluate(transaction, cursor)
    switch (this.operator) {
      case '<':
        return left < right
      case '<=':
        return left <= right
      case '<>':
        return left !== right
      case '=':
        return left === right
      case '>':
        return left > right
      case '>=':
        return left >= right
    }
  }
}

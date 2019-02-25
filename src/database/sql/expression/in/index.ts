import squel = require('squel')
import { parseExpression } from '..'
import { JQLError } from '../../../../utils/error'
import { ICursor } from '../../../cursor/interface'
import { Sandbox, Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { Query } from '../../query'
import { CompiledQuery } from '../../query'
import { isQuery } from '../../query/interface'
import { CompiledExpression, ConditionalExpression, Expression } from '../interface'
import { CompiledUnknownExpression } from '../unknown'
import { ValueExpression } from '../value'
import { CompiledValueExpression } from '../value'
import { IInExpression } from './interface'

/**
 * expression `? IN ?`
 */
export class InExpression extends ConditionalExpression implements IInExpression {
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
        if (isQuery(json.right)) {
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
  public validate(tables: string[]) {
    this.left.validate(tables)
    this.right.validate(tables)
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledInExpression {
    return new CompiledInExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `? ${this.$not ? 'NOT ' : ''}IN ?`,
        this.left.toSquel(),
        this.right.toSquel(),
      )
  }
}

/**
 * compiled `InExpression`
 */
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

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    this.left.register(unknowns)
    this.right.register(unknowns)
  }

  // @override
  public evaluate(transaction: Transaction, cursor: ICursor): boolean {
    const left = this.left.evaluate(transaction, cursor)
    let right: any[]
    if (this.right instanceof CompiledQuery) {
      const resultset = new Sandbox(transaction, this.right).run()
      right = []
      while (resultset.next()) right.push(resultset.get(0))
    }
    else {
      right = this.right.value
    }
    return right.indexOf(left) > -1
  }
}

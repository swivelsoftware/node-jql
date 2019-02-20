import squel = require('squel')
import { JQLError } from '../../../../utils/error'
import { Sandbox, Transaction } from '../../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../../interface'
import { Query } from '../../query'
import { CompiledQuery } from '../../query'
import { CompiledExpression, ConditionalExpression } from '../interface'
import { CompiledUnknownExpression } from '../unknown'
import { IExistsExpression } from './interface'

/**
 * expression `EXISTS $query`
 */
export class ExistsExpression extends ConditionalExpression implements IExistsExpression {
  public readonly classname: string = 'ExistsExpression'
  public $not?: boolean
  public query: Query

  constructor(json: IExistsExpression) {
    super()
    this.$not = json.$not
    this.query = new Query(json.query)
  }

  // @override
  public validate(tables: string[]) {
    this.query.validate(tables)
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledExistsExpression {
    return new CompiledExistsExpression(transaction, {
      ...options,
      parent: this,
    })
  }

  // @override
  public toSquel(): squel.Expression {
    return squel.expr()
      .and(
        `${this.$not ? 'NOT ' : ''}EXISTS ?`,
        this.query.toSquel(),
      )
  }
}

/**
 * compiled `ExistsExpression`
 */
export class CompiledExistsExpression extends CompiledExpression {
  public readonly $not?: boolean
  public readonly query: CompiledQuery

  constructor(transaction: Transaction, options: ICompileSqlOptions<ExistsExpression>) {
    super(transaction, options)
    try {
      this.$not = options.parent.$not
      this.query = options.parent.query.compile(transaction/* TODO , options */)
    }
    catch (e) {
      throw new JQLError('Fail to compile ExistsExpression', e)
    }
  }

  // @override
  public register(unknowns: CompiledUnknownExpression[]) {
    this.query.register(unknowns)
  }

  // @override
  public evaluate(transaction: Transaction): boolean {
    let result = new Sandbox(transaction, this.query).run().length > 0
    if (this.$not) result = !result
    return result
  }
}

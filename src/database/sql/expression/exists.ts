import { JQLError } from '../../../utils/error'
import { Transaction } from '../../transaction'
import { ICompileOptions, ICompileSqlOptions } from '../query/base'
import { CompiledQuery, IQuery, Query } from '../query/core'
import { CompiledExpression, Expression, IConditionalExpression } from './core'

export interface IExistsExpression {
  $not?: boolean
  query: IQuery
}

export class ExistsExpression extends Expression implements IConditionalExpression, IExistsExpression {
  public readonly classname: string = 'ExistsExpression'
  public $not?: boolean
  public query: Query

  constructor(json: IExistsExpression) {
    super()
    this.$not = json.$not
    this.query = new Query(json.query)
  }

  // @override
  public compile(transaction: Transaction, options: ICompileOptions = {}): CompiledExistsExpression {
    return new CompiledExistsExpression(transaction, {
      ...options,
      parent: this,
    })
  }
}

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
}

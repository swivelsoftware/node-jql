import { JQL } from '..'
import { ColumnExpression } from '../expressions/column'
import { QueryExpression } from '../expressions/query'
import { IQuery } from './index.if'
import { ResultColumn } from './resultColumn'

/**
 * SELECT ... FROM ...
 */
export class Query extends JQL implements IQuery {
  // @override
  public readonly classname = Query.name

  // @override
  public $select: ResultColumn[] = [
    new ResultColumn().setExpression(new ColumnExpression().setColumn('*')),
  ]

  constructor(json?: IQuery) {
    super()

    if (json) {
      // TODO
    }
  }

  // @override
  public toJson(): IQuery {
    // TODO
  }

  // @override
  public toString(): string {
    // TODO
  }

  /**
   * convert to Expression
   */
  public toExpression(): QueryExpression {
    return new QueryExpression(this)
  }
}

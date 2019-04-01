import { ConditionalExpression, IConditionalExpression } from '../expression'
import { BinaryExpression } from '../expression/binary'
import { ColumnExpression } from '../expression/column'
import { AndExpressions } from '../expression/grouped'
import { parse } from '../expression/parse'
import { JQLError } from '../utils/error'
import { ITableOrSubquery, TableOrSubquery } from './tableOrSubquery'

export type JoinOperator = 'INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL'

export interface IJoinClause {
  operator?: JoinOperator
  tableOrSubquery: ITableOrSubquery|[string, string]|string
  $on?: IConditionalExpression[]|IConditionalExpression
}

export class JoinClause implements IJoinClause {
  public operator: JoinOperator
  public tableOrSubquery: TableOrSubquery
  public $on?: ConditionalExpression

  constructor(json: IJoinClause) {
    try {
      this.operator = json.operator || 'INNER'
      if (typeof json.tableOrSubquery === 'string') json.tableOrSubquery = { table: json.tableOrSubquery }
      this.tableOrSubquery = new TableOrSubquery(json.tableOrSubquery)
      if (json.$on) this.$on = Array.isArray(json.$on) ? new AndExpressions({ expressions: json.$on }) : parse(json.$on) as ConditionalExpression
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate JoinClause', e)
    }
  }
}

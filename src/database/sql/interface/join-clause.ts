import { JQLError } from '../../../utils/error'
import { $and, Expression, IExpression } from './expression'
import { create } from './expression/__create'
import { ITableOrSubquery, TableOrSubquery } from './table-or-subquery'

type JoinType = 'INNER'|'LEFT'|'RIGHT'|'FULL'

interface IJoinOperator {
  $natural?: boolean
  type: JoinType
}

export interface IJoinClause {
  operator?: IJoinOperator
  tableOrSubquery: ITableOrSubquery
  $on?: IExpression[]|IExpression
  $using?: string[]|string
}

export class JoinClause implements IJoinClause {
  public operator: IJoinOperator
  public tableOrSubquery: TableOrSubquery
  public $on?: Expression
  public $using?: string[]

  constructor(json?: IJoinClause) {
    switch (typeof json) {
      case 'object':
        try {
          this.operator = json.operator || { type: 'INNER' }
          this.tableOrSubquery = new TableOrSubquery(json.tableOrSubquery)
          if (json.$on) this.$on = Array.isArray(json.$on) ? new $and({ expressions: json.$on }) : create(json.$on)
          if (json.$using) this.$using = Array.isArray(json.$using) ? json.$using : [json.$using]
        }
        catch (e) {
          throw new JQLError('fail to create JoinClause block', e)
        }
        break
      case 'undefined':
        break
      default:
        throw new JQLError(`invalid 'json' object`)
    }
  }
}

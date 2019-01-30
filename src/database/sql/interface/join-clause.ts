import { create } from './expression/create'
import { $and, Expression, IExpression } from './expression/index'
import { ITableOrSubquery, TableOrSubquery } from './table-or-subquery'

type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS'

interface IJoinOperator {
  $natural?: boolean
  type: JoinType
}

export interface IJoinClause {
  operator?: IJoinOperator
  tableOrSubquery: ITableOrSubquery
  $on?: IExpression[] | IExpression
  $using?: string[] | string
}

export class JoinClause implements IJoinClause {
  public operator: IJoinOperator
  public tableOrSubquery: TableOrSubquery
  public $on?: Expression
  public $using?: string[]

  constructor(json?: IJoinClause) {
    switch (typeof json) {
      case 'object':
        this.operator = json.operator || { type: 'INNER' }
        this.tableOrSubquery = new TableOrSubquery(json.tableOrSubquery)
        if (json.$on) this.$on = Array.isArray(json.$on) ? new $and({ expressions: json.$on }) : create(json.$on)
        if (json.$using) this.$using = Array.isArray(json.$using) ? json.$using : [json.$using]
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }
}

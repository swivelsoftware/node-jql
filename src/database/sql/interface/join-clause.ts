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

  constructor(joinClause?: IJoinClause) {
    switch (typeof joinClause) {
      case 'object':
        this.operator = joinClause.operator || { type: 'INNER' }
        this.tableOrSubquery = new TableOrSubquery(joinClause.tableOrSubquery)
        if (joinClause.$on) this.$on = Array.isArray(joinClause.$on) ? new $and({ expressions: joinClause.$on }) : create(joinClause.$on)
        if (joinClause.$using) this.$using = Array.isArray(joinClause.$using) ? joinClause.$using : [joinClause.$using]
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'joinClause' object`)
    }
  }
}

import { TableOrSubquery } from "./table-or-subquery";
import { Expression } from "./expression/index";
import { create } from "./expression/__create";

type JoinType = 'LEFT' | 'LEFT OUTER' | 'INNER' | 'CROSS'

interface JoinOperator {
  $natural?: boolean
  type: JoinType
}

interface JoinClauseJson {
  operator: JoinOperator
  tableOrSubquery: TableOrSubquery
  $on?: Expression[] | Expression
  $using?: string[] | string
}

export class JoinClause implements JoinClauseJson {
  operator: JoinOperator
  tableOrSubquery: TableOrSubquery
  $on?: Expression
  $using?: string[]

  constructor (joinClause?: JoinClauseJson) {
    switch (typeof joinClause) {
      case 'object':
        this.operator = joinClause.operator
        this.tableOrSubquery = new TableOrSubquery(joinClause.tableOrSubquery)
        if (joinClause.$on) this.$on = Array.isArray(joinClause.$on) ? create({ classname: '$and', expressions: joinClause.$on }) : create(joinClause.$on)
        if (joinClause.$using) this.$using = Array.isArray(joinClause.$using) ? joinClause.$using : [joinClause.$using]
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'joinClause' object`)
    }
  }
}
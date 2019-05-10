import { IQuery, Query } from '.'
import { ConditionalExpression, IConditionalExpression } from '../expression'
import { AndExpressions } from '../expression/grouped'
import { parse } from '../expression/parse'
import { InstantiateError } from '../utils/error/InstantiateError'

export interface ITableOrSubquery {
  database?: string
  table: string|IQuery
  $as?: string
}

export class TableOrSubquery implements ITableOrSubquery {
  public database?: string
  public table: string|Query
  public $as?: string

  constructor(json: [string, string]|ITableOrSubquery) {
    try {
      if (Array.isArray(json)) {
        json = {
          table: json[0],
          $as: json[1],
        }
      }
      if (typeof json.table === 'string' && !json.database) {
        this.table = json.table
      }
      else {
        if (!!json.$as) throw new SyntaxError(`Missing alias for ${this.table}`)
        this.database = json.database
        this.table = typeof json.table === 'string' ? json.table : new Query(json.table)
      }
      this.$as = json.$as
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate TableOrSubquery', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'TableOrSubquery'
  }

  public validate(availableTables: string[]): string[] {
    if (typeof this.table !== 'string') this.table.validate(availableTables)
    const table = this.$as ? this.$as : this.table as string
    if (availableTables.indexOf(table) > -1) throw new SyntaxError(`Ambiguous table '${table}'`)
    return [table]
  }

  public toJson(): ITableOrSubquery {
    const result: ITableOrSubquery = { table: this.table }
    if (this.database) result.database = this.database
    if (this.$as) result.$as = this.$as
    return result
  }
}

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
      throw new InstantiateError('Fail to instantiate JoinClause', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'JoinClause'
  }

  public toJson(): IJoinClause {
    const result: IJoinClause = {
      operator: this.operator,
      tableOrSubquery: this.tableOrSubquery.toJson(),
    }
    if (this.$on) result.$on = this.$on.toJson()
    return result
  }
}

export function isJoinedTableOrSubquery(value: ITableOrSubquery): value is IJoinedTableOrSubquery {
  return 'joinClauses' in value
}

export interface IJoinedTableOrSubquery extends ITableOrSubquery {
  joinClauses: IJoinClause[]|IJoinClause
}

export class JoinedTableOrSubquery extends TableOrSubquery implements IJoinedTableOrSubquery {
  public joinClauses: JoinClause[] = []

  constructor(json: IJoinedTableOrSubquery) {
    super(json)
    try {
      let joinClauses = json.joinClauses
      if (!Array.isArray(joinClauses)) joinClauses = [joinClauses]
      this.joinClauses = joinClauses.map(joinClause => new JoinClause(joinClause))
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate JoinedTableOrSubquery', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'JoinedTableOrSubquery'
  }

  // @override
  public validate(availableTables: string[] = []): string[] {
    let tables = super.validate(availableTables)
    for (const joinClause of this.joinClauses) {
      tables = tables.concat(joinClause.tableOrSubquery.validate([...availableTables, ...tables]))
    }
    return tables
  }

  // @override
  public toJson(): IJoinedTableOrSubquery {
    return {
      joinClauses: this.joinClauses.map(joinClause => joinClause.toJson()),
      ...super.toJson(),
    }
  }
}

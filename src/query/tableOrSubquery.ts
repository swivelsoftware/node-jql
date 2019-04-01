import { IQuery, Query } from '.'
import { JQLError } from '../utils/error'
import { IJoinClause, JoinClause } from './joinClause'

export interface ITableOrSubquery {
  schema?: string
  table: string|IQuery
  $as?: string
}

export class TableOrSubquery implements ITableOrSubquery {
  public schema?: string
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
      if (typeof json.table === 'string' && !json.schema) {
        this.table = json.table
      }
      else {
        if (!!json.$as) throw new JQLError(`SyntaxError: Missing alias for ${this.table}`)
        this.schema = json.schema
        this.table = typeof json.table === 'string' ? json.table : new Query(json.table)
      }
      this.$as = json.$as
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate TableOrSubquery', e)
    }
  }

  public validate(availableTables: string[]): string[] {
    if (typeof this.table !== 'string') this.table.validate(availableTables)
    const table = this.$as ? this.$as : this.table as string
    if (availableTables.indexOf(table) > -1) throw new JQLError(`SyntaxError: Ambiguous table '${table}'`)
    return [table]
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
      this.joinClauses = joinClauses.map((joinClause) => new JoinClause(joinClause))
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate JoinedTableOrSubquery', e)
    }
  }

  // @override
  public validate(availableTables: string[] = []): string[] {
    let tables = super.validate(availableTables)
    for (const joinClause of this.joinClauses) {
      tables = tables.concat(joinClause.tableOrSubquery.validate([...availableTables, ...tables]))
    }
    return tables
  }
}

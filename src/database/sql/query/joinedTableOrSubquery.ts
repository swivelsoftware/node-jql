import { JQLError } from '../../../utils/error'
import { RealTable, TemporaryTable } from '../../schema'
import { Transaction } from '../../transaction'
import { BinaryExpression } from '../expression/binary'
import { ColumnExpression } from '../expression/column'
import { CompiledExpression, Expression } from '../expression/core'
import { AndExpressions } from '../expression/grouped'
import { parseExpression } from '../expression/utils'
import { ICompileOptions, ICompileSqlOptions } from './base'
import { CompiledTableOrSubquery, ITableOrSubquery, TableOrSubquery } from './tableOrSubquery'

type JoinOperator = 'INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL'

export interface IJoinClause {
  operator?: JoinOperator
  tableOrSubquery: ITableOrSubquery
  $on?: any[]|any
  $using?: string[]|string
}

export class JoinClause implements IJoinClause {
  public operator: JoinOperator
  public tableOrSubquery: TableOrSubquery
  public $on?: Expression

  constructor(leftTable: JoinedTableOrSubquery, json: IJoinClause) {
    try {
      this.operator = json.operator || 'INNER'
      this.tableOrSubquery = new TableOrSubquery(json.tableOrSubquery)
      if (json.$using && json.$on) throw new JQLError('Either $on or $using should be used, but not both')
      if (json.$using) json.$on = Array.isArray(json.$using) ? json.$using.map((name) => this.createColumnExpression(leftTable, name)) : this.createColumnExpression(leftTable, name)
      if (json.$on) this.$on = Array.isArray(json.$on) ? new AndExpressions({ expressions: json.$on }) : parseExpression(json.$on)
    }
    catch (e) {
      throw new JQLError('Fail to instantiate JoinClause', e)
    }
  }

  private createColumnExpression(leftTable: TableOrSubquery, name: string): BinaryExpression {
    return new BinaryExpression({
      left: new ColumnExpression({ table: leftTable.$as || leftTable.table as string, name }),
      operator: '=',
      right: new ColumnExpression({ table: this.tableOrSubquery.$as || this.tableOrSubquery.table as string, name }),
    })
  }
}

export class CompiledJoinClause {
  public readonly operator: JoinOperator
  public readonly tableOrSubquery: CompiledTableOrSubquery
  public readonly $on?: CompiledExpression

  constructor(transaction: Transaction, joinClause: JoinClause, leftTable: RealTable, options: ICompileOptions) {
    this.operator = joinClause.operator
    this.tableOrSubquery = new CompiledTableOrSubquery(transaction, {
      ...options,
      parent: joinClause.tableOrSubquery,
    })
    if (joinClause.$on) {
      const tables: RealTable[] = [leftTable, this.tableOrSubquery.compiledSchema]
      this.$on = joinClause.$on.compile(transaction, {
        ...options,
        tables,
      })
    }
  }
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
      this.joinClauses = joinClauses.map((joinClause) => new JoinClause(this, joinClause))
    }
    catch (e) {
      throw new JQLError('Fail to instantiate JoinedTableOrSubquery', e)
    }
  }
}

export class CompiledJoinedTableOrSubquery extends CompiledTableOrSubquery {
  public readonly compiledSchema: TemporaryTable
  public readonly joinClauses: CompiledJoinClause[]

  constructor(transaction: Transaction, options: ICompileSqlOptions<JoinedTableOrSubquery>) {
    super(transaction, options)
    try {
      this.joinClauses = options.parent.joinClauses.map((joinClause) => new CompiledJoinClause(transaction, joinClause, super.compiledSchema, options))

      // update compiled table schema
      const tables = this.joinClauses.map((joinClause) => joinClause.tableOrSubquery.compiledSchema)
      this.compiledSchema = this.$as
        ? new TemporaryTable(transaction, super.compiledSchema.merge(this.$as, ...tables))
        : new TemporaryTable(transaction, super.compiledSchema.merge(...tables))
    }
    catch (e) {
      throw new JQLError('Fail to compile JoinedTableOrSubquery', e)
    }
  }
}

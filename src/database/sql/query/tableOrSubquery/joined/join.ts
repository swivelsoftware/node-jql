import { JoinedTableOrSubquery } from '.'
import { CompiledTableOrSubquery, TableOrSubquery } from '..'
import { JQLError } from '../../../../../utils/error'
import { RealTable } from '../../../../schema/table'
import { Transaction } from '../../../../transaction'
import { parseExpression } from '../../../expression'
import { BinaryExpression } from '../../../expression/binary'
import { ColumnExpression } from '../../../expression/column'
import { AndExpressions } from '../../../expression/grouped'
import { CompiledExpression, ConditionalExpression } from '../../../expression/interface'
import { ICompileOptions } from '../../../interface'
import { IJoinClause, JoinOperator } from '../interface'

export class JoinClause implements IJoinClause {
  public operator: JoinOperator
  public tableOrSubquery: TableOrSubquery
  public $on?: ConditionalExpression

  constructor(leftTable: JoinedTableOrSubquery, json: IJoinClause) {
    try {
      this.operator = json.operator || 'INNER'
      if (typeof json.tableOrSubquery === 'string') json.tableOrSubquery = { table: json.tableOrSubquery }
      this.tableOrSubquery = new TableOrSubquery(json.tableOrSubquery)
      if (json.$using && json.$on) throw new JQLError('Either $on or $using should be used, but not both')
      if (json.$using) json.$on = Array.isArray(json.$using) ? json.$using.map((name) => this.createColumnExpression(leftTable, name)) : this.createColumnExpression(leftTable, name)
      if (json.$on) this.$on = Array.isArray(json.$on) ? new AndExpressions({ expressions: json.$on }) : parseExpression(json.$on) as ConditionalExpression
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

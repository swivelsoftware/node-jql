import { JQL } from '../..'
import { ConditionalExpression } from '../../expressions'
import { IConditionalExpression } from '../../expressions/index.if'
import { parse } from '../../expressions/parse'
import { IDatabaseTable, IFromTable, IJoinClause, IRemoteTable, ISelectTable, ITable, JoinOperator } from './index.if'
import { DatabaseTable, RemoteTable, SelectTable, Table } from './table'

/**
 * Join clauses for table
 */
export class JoinClause extends JQL implements IJoinClause {
  // @override
  public readonly classname = JoinClause.name

  // @override
  public operator: JoinOperator = 'INNER'

  // @override
  public table: Table

  // @override
  public $on: ConditionalExpression

  constructor(json?: IJoinClause) {
    super()

    if (json) {
      if (json.operator) this.setOperator(json.operator)
      this.setTable(json.table, json.$on)
    }
  }

  /**
   * set JOIN type
   * @param operator [JoinOperator]
   */
  public setOperator(operator: JoinOperator): JoinClause {
    this.operator = operator
    return this
  }

  /**
   * set join table
   * @param table [ITable]
   * @param $on [IConditionalExpression]
   */
  public setTable(table: ITable, $on: IConditionalExpression): JoinClause {
    switch (table.classname) {
      case 'DatabaseTable':
        this.table = new DatabaseTable(table as IDatabaseTable)
        break
      case 'SelectTable':
        this.table = new SelectTable(table as ISelectTable)
        break
      case 'RemoteTable':
        this.table = new RemoteTable(table as IRemoteTable)
        break
      default:
        throw new SyntaxError(`Unknown table type '${table.classname}'`)
    }
    this.$on = parse($on)
    return this
  }

  // @override
  public toJson(): IJoinClause {
    this.check()
    return {
      classname: this.classname,
      operator: this.operator,
      table: this.table.toJson(),
      $on: this.$on.toJson(),
    }
  }

  // @override
  public toString(): string {
    this.check()
    return `${this.operator} JOIN ${this.table.toString()} ON ${this.$on.toString()}`
  }

  protected check(): void {
    if (!this.table) throw new Error('Table is not defined')
  }
}

export class FromTable<Table extends ITable = DatabaseTable> extends JQL implements IFromTable {
  // @override
  public readonly classname = FromTable.name

  // @override
  public table: Table

  // @override
  public joinClauses: JoinClause[] = []
}

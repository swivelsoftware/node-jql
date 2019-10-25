import { JQL } from '../..'
import { ConditionalExpression } from '../../expressions'
import { IConditionalExpression } from '../../expressions/index.if'
import { parse } from '../../parse'
import { IFromTable, IJoinClause, ITable, JoinOperator } from './index.if'
import { Table } from './table'

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
    this.table = parse(table)
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

  // @override
  protected check(): void {
    if (!this.table) throw new SyntaxError('Table is not defined')
  }
}

/**
 * Retrieve data from table
 */
export class FromTable extends JQL implements IFromTable {
  // @override
  public readonly classname = FromTable.name

  // @override
  public table: Table

  // @override
  public joinClauses: JoinClause[] = []

  constructor(json?: IFromTable) {
    super()

    if (json) {
      this.setTable(json.table)
      if (json.joinClauses) {
        for (const joinClause of json.joinClauses) this.addJoinClause(joinClause)
      }
    }
  }

  /**
   * set table
   * @param table [ITable]
   */
  public setTable(table: ITable): FromTable {
    this.table = parse(table)
    return this
  }

  /**
   * Add join clause
   * @param joinClause [IJoinClause]
   */
  public addJoinClause(joinClause: IJoinClause): FromTable {
    this.joinClauses.push(new JoinClause(joinClause))
    return this
  }

  // @override
  public toJson(): IFromTable {
    this.check()
    return {
      classname: this.classname,
      table: this.table.toJson(),
      joinClauses: this.joinClauses.map(j => j.toJson()),
    }
  }

  // @override
  public toString(): string {
    this.check()
    let result = this.table.toString()
    if (this.joinClauses.length) {
      for (const j of this.joinClauses) result += ' ' + j.toString()
    }
    return result
  }

  // @override
  protected check(): void {
    if (!this.table) throw new SyntaxError('Table is not defined')
  }
}

import { AxiosRequestConfig } from 'axios'
import squel = require('squel')
import { IQuery, Query } from '.'
import { IJQL, JQL } from '..'
import { Type } from '../../type'
import { ConditionalExpression, IConditionalExpression } from '../expr'
import { AndExpressions } from '../expr/expressions/AndExpressions'
import { parse } from '../expr/parse'

/**
 * Join operator for table
 */
export type JoinOperator = 'INNER'|'CROSS'|'LEFT'|'RIGHT'|'FULL'

/**
 * Raw JQL defining join clause
 */
export interface IJoinClause extends IJQL {
  /**
   * Join operator
   */
  operator?: JoinOperator

  /**
   * Table for joining
   */
  table: IFromTable|string

  /**
   * Joining condition
   */
  $on: IConditionalExpression[]|IConditionalExpression
}

/**
 * JQL class defining join clause
 */
export class JoinClause extends JQL implements IJoinClause {
  public operator: JoinOperator
  public table: FromTable
  public $on: ConditionalExpression

  /**
   * @param json [IFromTable]
   */
  constructor(json: IJoinClause)

  /**
   * @param operator [JoinOperator]
   * @param table [IFromTable|string]
   * @param $on [Array<ConditionalExpression>] optional
   */
  constructor(operator: JoinOperator, table: IFromTable|string, ...$on: IConditionalExpression[])

  constructor(...args: any[]) {
    super()

    // parse args
    let operator: JoinOperator, table: IFromTable|string, $on: IConditionalExpression[]
    if (args.length === 1) {
      const json = args[0] as IJoinClause
      operator = json.operator || 'LEFT'
      table = json.table
      $on = Array.isArray(json.$on) ? json.$on : [json.$on]
    }
    else {
      operator = args[0]
      table = args[1]
      $on = args.slice(2)
    }

    // set args
    this.operator = operator
    this.table = typeof table === 'string' ? new FromTable(table) : new FromTable(table)
    if ($on) this.$on = $on.length > 1 ? new AndExpressions($on) : parse($on[0])
  }

  private get joinMethod(): string {
    switch (this.operator) {
      case 'CROSS':
        return 'cross_join'
      case 'FULL':
        return 'outer_join'
      case 'INNER':
        return 'join'
      case 'LEFT':
        return 'left_join'
      case 'RIGHT':
        return 'right_join'
    }
  }

  // @override
  get [Symbol.toStringTag](): string {
    return FromTable.name
  }

  /**
   * Apply join clause to query builder
   * @param builder [squel.Select]
   */
  public apply(builder: squel.Select): squel.Select {
    const { database, table, $as } = this.table
    if (typeof table === 'string') {
      return builder[this.joinMethod](`${database ? `${database}.` : ''}${table}`, $as, this.$on && this.$on.toSquel())
    }
    else if (table instanceof Query) {
      return builder[this.joinMethod](table.toSquel(), $as, this.$on && this.$on.toSquel())
    }
    else {
      return builder[this.joinMethod](`${table.method || 'GET'}(${table.url})`, $as, this.$on && this.$on.toSquel())
    }
  }

  // @override
  public validate(availableTables: string[]): void {
    this.table.validate([])
    this.$on.validate(availableTables)
  }

  // @override
  public toSquel(): squel.QueryBuilder {
    return this.apply(squel.select({}, [new squel.cls.JoinBlock()]) as squel.Select)
  }

  // @override
  public toJson(): IJoinClause {
    return {
      operator: this.operator,
      table: this.table.toJson(),
      $on: this.$on.toJson(),
    }
  }
}

/**
 * Raw JQL defining tables for query
 */
export interface IFromTable extends IJQL {
  /**
   * Database where the table is in
   */
  database?: string

  /**
   * Table definition
   */
  table: string|IQuery|IRemoteTable

  /**
   * Alias table name
   */
  $as?: string

  /**
   * Join clauses
   */
  joinClauses?: IJoinClause[]|IJoinClause
}

/**
 * Raw JQL defining remote table through API
 */
export interface IRemoteTable extends AxiosRequestConfig {
  /**
   * Result structure
   */
  columns: Array<{ name: string, type?: Type }>
}

/**
 * JQL class defining tables for query
 */
export class FromTable extends JQL implements IFromTable {
  public database?: string
  public table: string|Query|IRemoteTable
  public $as?: string
  public joinClauses: JoinClause[] = []

  /**
   * @param json [IFromTable]
   */
  constructor(json: IFromTable)

  /**
   * @param table [string|IQuery|IRemoteTable||Array<string>]
   * @param joinClauses [Array<IJoinClause>] optional
   */
  constructor(table: string|IQuery|IRemoteTable|[string, string], ...joinClauses: IJoinClause[])

  /**
   * @param table [string|IQuery|IRemoteTable|Array<string>]
   * @param $as [string]
   * @param joinClauses [Array<IJoinClause>] optional
   */
  constructor(table: string|IQuery|IRemoteTable|[string, string], $as: string, ...joinClauses: IJoinClause[])

  constructor(...args: any[]) {
    super()

    // parse args
    let database: string|undefined, table: string|IQuery|IRemoteTable, $as: string|undefined, joinClauses: IJoinClause[]
    if (args.length === 1 && typeof args[0] === 'object') {
      const json = args[0] as IFromTable
      database = json.database
      table = json.table
      $as = json.$as
      json.joinClauses = json.joinClauses || []
      joinClauses = Array.isArray(json.joinClauses) ? json.joinClauses : [json.joinClauses]
    }
    else if (typeof args[1] === 'string') {
      database = Array.isArray(args[0]) ? args[0][0] : undefined
      table = Array.isArray(args[0]) ? args[0][1] : args[0]
      $as = args[1]
      joinClauses = args.slice(2)
    }
    else {
      database = Array.isArray(args[0]) && args[0].length === 2 ? args[0][0] : undefined
      table = Array.isArray(args[0]) ? args[0].length === 2 ? args[0][1] : args[0][0] : args[0]
      joinClauses = args.slice(1)
    }

    // check args
    if (Array.isArray(table)) throw new SyntaxError(`Invalid table ${JSON.stringify(table)}`)
    if (typeof table !== 'string' && !$as) throw new SyntaxError('Missing alias name')

    // set args
    this.database = database
    this.table = typeof table === 'string' || 'columns' in table ? table : new Query(table)
    this.$as = $as
    if (joinClauses.length > 0) this.joinClauses = joinClauses.map(json => new JoinClause(json))
  }

  get isJoined(): boolean {
    return this.joinClauses.length > 0
  }

  // @override
  get [Symbol.toStringTag](): string {
    return FromTable.name
  }

  /**
   * Apply table to query builder
   * @param builder [squel.Select]
   */
  public apply(builder: squel.Select): squel.Select {
    if (typeof this.table === 'string') {
      builder = builder.from(`${this.database ? `${this.database}.` : ''}${this.table}`, this.$as)
    }
    else if (this.table instanceof Query) {
      builder = builder.from(this.table.toSquel(), this.$as)
    }
    else {
      builder = builder.from(`${this.table.method || 'GET'}(${this.table.url})`, this.$as)
    }
    for (const joinClause of this.joinClauses) joinClause.apply(builder)
    return builder
  }

  // @override
  public validate(availableTables: string[]): void {
    if (typeof this.table !== 'string' && 'validate' in this.table) this.table.validate(availableTables)
    const table = this.$as ? this.$as : this.table as string
    if (availableTables.indexOf(table) > -1) throw new SyntaxError(`Ambiguous table '${table}'`)
    availableTables.push(table)
    for (const { table } of this.joinClauses) table.validate(availableTables)
  }

  // @override
  public toSquel(): squel.QueryBuilder {
    return this.apply(squel.select({}, [new squel.cls.FromTableBlock(), new squel.cls.JoinBlock()]) as squel.Select)
  }

  // @override
  public toJson(): IFromTable {
    const result: IFromTable = { table: this.table }
    if (this.database) result.database = this.database
    if (this.$as) result.$as = this.$as
    return result
  }
}

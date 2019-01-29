import _ = require('lodash')
import { Logger } from '../../utils/logger'
import { functions } from '../functions'
import { Database } from '../index'
import { Table } from '../metadata/table'
import { $and, $between, $binary, $case, $column, $exists, $function, $in, $or, $value, DefineStatement, Expression, Query, Sql } from '../sql/index'
import { ICursor } from './cursor'
import { ResultSet } from './resultset'

const logger = new Logger(__dirname)

class IntermediateCursor implements ICursor {
  private readonly indices: number[] = []
  private current: any = undefined

  constructor(private readonly sandbox: Sandbox, private readonly tables: Table[]) {
  }

  public count(): number {
    return this.tables.reduce((result, table) => result + table.count, 0)
  }

  public get<T>(p: string|number|symbol): T {
    if (!this.current) throw new Error(this.reachEnd() ? 'cursor reaches the end' : 'call cursor.next() first')
    return this.current[p]
  }

  public next(): boolean {
    // check end
    if (this.reachEnd()) {
      this.current = undefined
      return false
    }

    // current row
    const row = this.current = {}
    for (let i = 0, length = this.tables.length; i < length; i += 1) {
      const index = this.indices[i] || 0
      const table = this.tables[i]
      const row_ = this.sandbox.context[table.symbol][index]
      for (const { name, symbol } of table.columns) {
        row[symbol] = row_[symbol] || row_[name]
      }
    }

    // move indices
    for (let i = this.tables.length - 1, carry = 1; carry > 0 && i >= 0; i -= 1) {
      const count = this.tables[i].count
      let index = this.indices[i] || 0
      index += carry--
      if (index === count) {
        index = 0
        carry = 1
      }
      this.indices[i] = index
    }

    return true
  }

  public reachEnd(): boolean {
    for (let i = 0, length = this.tables.length; i < length; i += 1) {
      const table = this.tables[i], index = this.indices[i] || 0
      if (index < this.sandbox.context[table.symbol].length) return false
    }
    return true
  }
}

export class Sandbox {
  public readonly context: any = {}
  private readonly defined: { [key: string]: symbol } = {}

  constructor(private readonly database: Database, sandbox?: Sandbox) {
    if (sandbox) this.context = _.cloneDeep(sandbox.context)
  }

  public run <T>(sql: Sql): ResultSet<T>|undefined {
    if (sql instanceof DefineStatement) {
      // update sandbox context
      const { name, symbol, $ifNotExists, value, function: function_, query } = sql
      if (this.defined[name] && (!$ifNotExists || !this.database.metadata.checkOverridable)) throw new Error(`'${name}' is already defined`)
      this.context[symbol] = value || function_ || this.runQuery(query as Query)
      this.defined[name] = symbol
      return undefined
    }
    else if (sql instanceof Query) {
      // retrieve results from database
      return this.runQuery(sql)
    }
    else {
      throw new Error(`'${sql.constructor.name}' is not yet supported`)
    }
  }

  private runQuery <T>(query: Query): ResultSet<T> {
    // create sandbox
    const sandbox_ = new Sandbox(this.database, this)

    // clone query for further manipulation
    query = new Query(query)

    // cache tables to be used
    const tables: Table[] = []
    for (const { name, query: query_, $as } of query.$from) {
      let table: Table, content: any
      if (query_) {
        if (!$as) throw new Error('[FATAL] missing alias. an alias is a must if using query in TableOrSubquery')
        const resultset = sandbox_.runQuery(query_)
        if (!resultset.table /* === !resultset.length */) return new ResultSet()
        table = resultset.table
        content = resultset
      }
      else {
        if (!name) throw new Error('[FATAL] missing table name')
        table = this.database.metadata.table(name)
        if ($as) table = table.clone(Symbol($as))
        content = this.database.database[name]
        if (this.database.metadata.checkTable && !content) throw new Error(`table '${name}' not exists`)
        else if (!table) logger.warn(`table '${name}' not exists'`)
      }
      sandbox_.context[table.symbol] = content || []
      tables.push(table)
    }

    // TODO join

    // prepare result set
    const table = new Table('$result')
    const columnMappings: { [key in symbol]: Expression } = {}
    for (const { expression, $as } of query.$select) {
      const name = $as || expression.toString()
      const symbol = Symbol(name)
      table.addColumn(name, true, symbol)
      columnMappings[symbol] = expression
    }
    const resultset = new ResultSet<T>(table)

    // TODO limit

    // iterate rows
    const cursor = new IntermediateCursor(sandbox_, tables)
    while (cursor.next()) {
      // TODO where

      const row = {} as T
      for (const { symbol } of table.columns) {
        const expression = columnMappings[symbol]
        row[symbol] = this.evaluateExpression(cursor, expression, tables)
      }
      resultset.push(row)
    }

    // TODO group by

    // TODO order by

    return resultset
  }

  private evaluateExpression(cursor: ICursor, expression: Expression, tables: Table[]): any {
    if (expression instanceof $between) {
      // TODO
    }
    else if (expression instanceof $binary) {
      // TODO
    }
    else if (expression instanceof $case) {
      // TODO
    }
    else if (expression instanceof $column) {
      const { table: tableName, name } = expression
      if (!tableName && tables.length > 1) throw new Error(`ambiguous column '${name}'`)
      const table = tableName ? tables.find((table) => table.name === tableName) : tables[0]
      if (this.database.metadata.checkTable && !table) throw new Error(`table '${name}' not exists`)
      if (!table) {
        logger.warn(`table '${name}' not exists`)
        return undefined
      }
      const column = table.columns.find((column) => column.name === name)
      if (this.database.metadata.checkColumn && !column) throw new Error(`column '${expression.toString()}' not exists`)
      if (!column) {
        logger.warn(`column '${expression.toString()}' not exists`)
        return undefined
      }
      return cursor.get(column.symbol)
    }
    else if (expression instanceof $exists) {
      // TODO
    }
    else if (expression instanceof $function) {
      const { name, parameters = [] } = expression
      let function_: Function = functions[name]
      if (!function_) {
        const symbol = this.defined[name]
        if (!symbol) throw new Error(`'${name}' is not defined`)
        function_ = this.context[symbol]
        if (typeof function_ !== 'function') throw new Error(`'${name}' is not a function`)
      }
      return function_(...parameters)
    }
    else if (expression instanceof $and || expression instanceof $or) {
      // TODO
    }
    else if (expression instanceof $in) {
      // TODO
    }
    else if (expression instanceof $value) {
      return expression.value
    }
    else {
      throw new Error(`invalid expression '${expression.classname}'`)
    }
  }
}

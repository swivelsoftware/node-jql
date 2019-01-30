import _ = require('lodash')
import { Logger } from '../../utils/logger'
import { functions } from '../functions'
import { Database } from '../index'
import { Column, Type } from '../metadata/column'
import { Table } from '../metadata/table'
import { $and, $between, $binary, $case, $column, $exists, $function, $in, $or, $value, DefineStatement, Expression, JoinClause, Query, ResultColumn, Sql, TableOrSubquery } from '../sql/index'
import { ICursor } from './cursor'
import { ResultSet } from './resultset'

const logger = new Logger(__dirname)

class ResultSetTable extends Table {
  public readonly mappings: { [key in symbol]: Expression } = {}

  constructor(name: string = 'Result', table?: Table) {
    super(name, table)
    for (const column of this.columns) if (column.isPrereserved) this.forceRemoveColumn(column.name)
  }

  public addColumn(column: Column): Table
  public addColumn(name: string, type: Type[] | Type | boolean, symbol?: symbol): Table
  public addColumn(...args: any[]): Table {
    let table: string|undefined, name: string, type: Type[] | Type | boolean, symbol: symbol
    if (args.length === 1 && args[0] instanceof Column) {
      const column: Column = args[0]
      table = column.table
      name = column.name
      type = column.type
      symbol = column.symbol || Symbol(name)
    }
    else {
      name = args[0]
      type = args[1] || true
      symbol = args[2] || Symbol(name)
    }
    const column = table ? new Column(table, name, symbol, type) : new Column(name, symbol, type)
    name = column.toString()
    if (!this.columns_[name]) {
      this.columns_[name] = column
      this.columnOrders_.push(name)
    }
    return this
  }

  public removeColumn(name: string): Column | undefined {
    logger.warn('you cannot remove column from ResultSetTable')
    return undefined
  }

  public validate(value: any): boolean {
    return true
  }

  private forceRemoveColumn(name: string) {
    const index = this.columnOrders_.indexOf(name)
    if (index > -1) this.columnOrders_.splice(index, 1)
    delete this.columns_[name]
  }
}

class IntermediateCursor implements ICursor {
  private index: number = -1
  private current: any = undefined

  constructor(private readonly sandbox: Sandbox, private readonly tables: Table[]) {
  }

  public count(): number {
    return this.tables.reduce((result, table) => (result || 1) * table.count, 0)
  }

  public get<T>(p: symbol): T {
    if (!this.current) throw new Error(this.reachEnd() ? 'cursor reaches the end' : 'call cursor.next() first')
    return this.current[p]
  }

  public next(): boolean {
    // move indices
    this.index += 1

    // check end
    if (this.reachEnd()) {
      this.current = undefined
      return false
    }

    // break indices
    const indices: number[] = []
    for (let i = this.tables.length - 1, base = 1; i >= 0; i -= 1) {
      const count = this.tables[i].count
      indices[i] = Math.floor(this.index / base) % count
      base *= count
    }

    // current row
    const row = this.current = {}
    for (let i = 0, length = this.tables.length; i < length; i += 1) {
      const index = indices[i]
      const table = this.tables[i]
      const row_ = this.sandbox.context[table.symbol][index]
      for (const { name, symbol, isPrereserved } of table.columns) {
        if (isPrereserved && name === 'index') {
          row[symbol] = index
        }
        else {
          row[symbol] = row_[symbol] || row_[name]
        }
      }
    }

    return true
  }

  public reachEnd(): boolean {
    return this.index === this.count()
  }
}

export class Sandbox {
  public readonly context: any = {}
  private readonly defined: { [key: string]: symbol } = {}

  constructor(private readonly database: Database, sandbox?: Sandbox) {
    if (sandbox) this.context = _.cloneDeep(sandbox.context)
  }

  public run <T>(sql: Sql): ResultSet<T> {
    if (sql instanceof DefineStatement) {
      // update sandbox context
      const { name, symbol, $ifNotExists, value, function: function_, query } = sql
      if (this.defined[name] && (!$ifNotExists || !this.database.metadata.checkOverridable)) throw new Error(`'${name}' is already defined`)
      this.context[symbol] = value || function_ || this.runQuery(query as Query)
      this.defined[name] = symbol
      return new ResultSet<T>(new ResultSetTable())
    }
    else if (sql instanceof Query) {
      // retrieve results from database
      this.validateQuery(sql)
      return this.runQuery(sql)
    }
    else {
      throw new Error(`'${sql.constructor.name}' is not yet supported`)
    }
  }

  private validateQuery(query: Query, tableAliases: { [key: string]: Table } = {}) {
    // dummy sandbox
    const sandbox = new Sandbox(this.database, this)

    // $from
    for (const { name, query: query_, $as } of query.$from) {
      let table
      if (query_) {
        this.validateQuery(query_)
        table = this.prepareResultSet(query_.$select, sandbox.prepareTables(query_.$from, query_.$join))
      }
      else if (name) {
        table = this.database.metadata.table(name)
      }
      if (!table) throw new Error(`table '${name}' not exists`)
      tableAliases[($as || name) as string] = table
    }

    // $select
    for (const { expression } of query.$select) {
      this.validateExpression(expression, tableAliases)
    }

    // TODO $join
    // TODO $where
    // TODO $group
    // TODO $order
    // TODO $limit
  }

  private validateExpression(expression: Expression, tableAliases: { [key: string]: Table } = {}) {
    if (expression instanceof $between) {
      const { left, start, end } = expression
      this.validateExpression(left)
      if (start) this.validateExpression(start)
      if (end) this.validateExpression(end)
    }
    else if (expression instanceof $binary) {
      const { left, right } = expression
      this.validateExpression(left)
      if (right) this.validateExpression(right)
    }
    else if (expression instanceof $case) {
      const { cases, $else } = expression
      for (const { $when, $then } of cases) {
        this.validateExpression($when)
        this.validateExpression($then)
      }
      if ($else) this.validateExpression($else)
    }
    else if (expression instanceof $column) {
      const { table: tableName, name } = expression
      if (name !== '*') {
        if (tableName) {
          const table = tableAliases[tableName]
          if (!table) throw new Error(`table '${tableName}' not exists`)
          if (!table.columns.find((column) => column.name === name)) throw new Error(`unknown column \`${tableName}\`.\`${name}\``)
        }
        else {
          const columns = Object.keys(tableAliases).reduce<Column[]>((result, key) => {
            if (result.length > 1) throw new Error(`column '${name}' in field list is ambiguous`)
            const table = tableAliases[key]
            const column = table.columns.find((column) => column.name === name)
            if (column) result.push(column)
            return result
          }, [])
          if (!columns.length) throw new Error(`unknown column '${name}'`)
        }
      }
    }
    else if (expression instanceof $exists) {
      const { query } = expression
      this.validateQuery(query, tableAliases)
    }
    else if (expression instanceof $function) {
      const { name } = expression
      let function_: Function = functions[name]
      if (!function_) {
        const symbol = this.defined[name]
        if (!symbol) throw new Error(`function '${name}' is not defined`)
        function_ = this.context[symbol]
        if (typeof function_ !== 'function') throw new Error(`'${name}' is not a function`)
      }
    }
    else if (expression instanceof $and || expression instanceof $or) {
      for (const expression_ of expression.expressions) {
        this.validateExpression(expression_)
      }
    }
    else if (expression instanceof $in) {
      const { left, query } = expression
      this.validateExpression(left)
      this.validateQuery(query, tableAliases)
    }
    else if (expression instanceof $value) {
      // do nothing
    }
    else {
      throw new Error(`invalid expression '${expression.classname}'`)
    }
  }

  private prepareTables(tableOrSubqueries: TableOrSubquery[], joinClauses?: JoinClause[]): Table[] {
    const tables: Table[] = []

    // $from
    for (const { name, query: query_, $as } of tableOrSubqueries) {
      let table: Table, content: any
      if (query_) {
        const resultset = this.runQuery(query_)
        if (!resultset.metadata /* === !resultset.length */) return new ResultSet(new ResultSetTable())
        table = new ResultSetTable($as as string, resultset.metadata)
        content = resultset
      }
      else {
        if (!name) throw new Error('[FATAL] missing table name')
        table = this.database.metadata.table(name)
        if ($as) table = table.clone($as)
        content = this.database.database[table.symbol]
        if (this.database.metadata.checkTable && !content) throw new Error(`table '${name}' not exists`)
        else if (!table) logger.warn(`table '${name}' not exists'`)
      }
      this.context[table.symbol] = content || []
      tables.push(table)
    }

    // TODO $join

    return tables
  }

  private prepareResultSet <T>(resultColumns: ResultColumn[], tables: Table[]): ResultSet<T> {
    // prepare result set
    const resultsetTable = new ResultSetTable()

    function register(expression: Expression, $as?: string) {
      const name = $as || expression.toString()
      const symbol = Symbol(name)
      if (expression instanceof $column) {
        if (!expression.table) {
          // check ambiguous column
          const ambiguous = tables.reduce<number>((result, table) => {
            if (result < 2 && table.columns.find((column) => column.name === name)) {
              result += 1
            }
            return result
          }, 0) > 1
          if (ambiguous) throw new Error(`ambiguous column '${name}'`)

          resultsetTable.addColumn(new Column(expression.name, symbol))
        }
        else {
          resultsetTable.addColumn(new Column(expression.table, expression.name, symbol))
        }
      }
      else {
        resultsetTable.addColumn(name, true, symbol)
      }
      resultsetTable.mappings[symbol] = expression
    }

    for (const { expression, $as } of resultColumns) {
      if (expression instanceof $column && expression.name === '*') {
        // wildcard
        if (expression.table) {
          // target table
          const table = tables.find((table) => table.name === expression.table)
          if (!table) throw new Error(`table '${expression.name}' not exists`)
          for (const column of table.columns) {
            register(new $column({ table: table.name, name: column.name }))
          }
        }
        else {
          // all tables
          for (const table of tables) {
            for (const column of table.columns) {
              register(new $column({ table: table.name, name: column.name }))
            }
          }
        }
      }
      else {
        // target expression
        register(expression, $as)
      }
    }
    return new ResultSet<T>(resultsetTable)
  }

  private runQuery <T>(query: Query, ...args: any[]): ResultSet<T> {
    // create sandbox
    const sandbox = new Sandbox(this.database, this)

    // clone query for further manipulation
    query = new Query(query)

    // cache tables to be used
    const tables = sandbox.prepareTables(query.$from, query.$join)

    // create result set
    const resultset = sandbox.prepareResultSet<T>(query.$select, tables)
    const resultsetTable = resultset.metadata as ResultSetTable

    // iterate rows
    const cursor = new IntermediateCursor(sandbox, tables)
    while (cursor.next()) {
      // TODO where

      const row = {} as T
      for (const { symbol } of resultsetTable.columns) {
        const expression = resultsetTable.mappings[symbol]
        row[symbol] = this.evaluateExpression(cursor, expression, tables)
      }
      resultset.push(row)
    }

    // TODO group by

    // TODO order by

    // TODO limit

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
        function_ = this.context[symbol]
      }
      return function_(...parameters)
    }
    else if (expression instanceof $and) {
      let result: boolean = true
      for (const expression_ of expression.expressions) {
        if (result = result && !!this.evaluateExpression(cursor, expression_, tables)) {
          return false
        }
      }
      return result
    }
    else if (expression instanceof $or) {
      let result: boolean = false
      for (const expression_ of expression.expressions) {
        if (result = result || !!this.evaluateExpression(cursor, expression_, tables)) {
          return true
        }
      }
      return result
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

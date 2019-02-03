import _ = require('lodash')
import { Database } from '..'
import { JQLError } from '../../utils/error'
import { Logger } from '../../utils/logger'
import { functions } from '../functions'
import { JQLFunction } from '../functions/__base'
import { Column, Type } from '../metadata/column'
import { Table } from '../metadata/table'
import { $and, $between, $binary, $case, $column, $exists, $function, $in, $isNull, $or, $value, DefineStatement, Expression, JoinClause, Query, ResultColumn, Sql, TableOrSubquery, OrderingTerm } from '../sql'
import { ICursor } from './cursor'
import { ResultSet } from './resultset'

const logger = new Logger(__dirname)

class ResultSetTable extends Table {
  public readonly mappings: { [key in symbol]: Expression } = {}

  constructor(name: string = 'Result', table?: Table) {
    super(name, table)
    for (const column of this.columns) if (column['isPrereserved']) this.forceRemoveColumn(column.name)
  }

  public addColumn(column: Column): Table
  public addColumn(name: string, type: Type, symbol?: symbol): Table
  public addColumn(...args: any[]): Table {
    let table: string|undefined, name: string, type: Type, symbol: symbol
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

  public addTemporaryColumn(name: string, type: Type, symbol: symbol = Symbol(name)) {
    const column = this.columns_[name] = new Column(name, symbol, type)
    column['temporary'] = true
    this.columnOrders_.push(name)
  }

  public validate(value: any) {
    // do nothing
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
    if (this.current === undefined) throw new JQLError(this.reachEnd() ? 'cursor reaches the end' : 'call cursor.next() first')
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
      for (const column of table.columns) {
        const { name, symbol } = column
        if (column['isPrereserved'] && name === 'index') {
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

class IntermediateResultSet extends ResultSet<any> {
  constructor(readonly metadata: Table, ...args: any[]) {
    super(metadata, ...args)
  }

  public commit<T>(): ResultSet<T> {
    const resultset = new ResultSet<T>(this.metadata)
    for (const row of this) {
      const row_ = {} as T
      for (const column of this.metadata.columns) {
        row_[column.symbol] = column.denormalize(row[column.symbol])
      }
      resultset.push(row_)
    }
    return resultset
  }
}

export class Sandbox {
  public readonly context: any = {}
  private readonly defined: { [key: string]: symbol } = {}

  constructor(private readonly database: Database, sandbox?: Sandbox) {
    if (sandbox) this.context = _.cloneDeep(sandbox.context)
  }

  public run <T>(sql: Sql, ...args: any[]): ResultSet<T> {
    if (sql instanceof DefineStatement) {
      // update sandbox context
      const { name, symbol, $ifNotExists, value, function_, query } = sql
      if (this.defined[name] && (!$ifNotExists || !this.database.metadata.checkOverridable)) throw new JQLError(`'${name}' is already defined`)
      this.context[symbol] = value || function_ || this.runQuery(query as Query)
      this.defined[name] = symbol
      return new ResultSet<T>(new ResultSetTable())
    }
    else if (sql instanceof Query) {
      // retrieve results from database
      this.validateQuery(sql)
      return this.runQuery(sql, ...args)
    }
    else {
      throw new JQLError(`'${sql.constructor.name}' is not yet supported`)
    }
  }

  private validateQuery(query: Query, tableAliases: { [key: string]: Table } = {}) {
    // sandbox for validation
    const sandbox = new Sandbox(this.database, this)

    // $from
    if (query.$from) {
      for (const { name, query: query_, $as } of query.$from) {
        let table
        if (query_) {
          this.validateQuery(query_)
          table = this.prepareResultSet(query_.$select, sandbox.prepareTables(query_.$from || [], query_.$join))
        }
        else if (name) {
          table = this.database.metadata.table(name)
        }
        if (!table) throw new JQLError(`table '${name}' not exists`)
        tableAliases[($as || name) as string] = table
      }
    }

    // $select
    for (const { expression } of query.$select) {
      this.validateExpression(expression, tableAliases)
    }

    // $where
    if (query.$where) {
      this.validateExpression(query.$where, tableAliases)
    }

    // TODO $join
    // TODO $group
    // TODO $order
    // TODO $limit
  }

  private validateExpression(expression: Expression, tableAliases: { [key: string]: Table } = {}) {
    if (expression instanceof $between) {
      const { left, start, end } = expression
      this.validateExpression(left, tableAliases)
      if (start) this.validateExpression(start, tableAliases)
      if (end) this.validateExpression(end, tableAliases)
    }
    else if (expression instanceof $binary) {
      const { left, right } = expression
      this.validateExpression(left, tableAliases)
      if (right) this.validateExpression(right, tableAliases)
    }
    else if (expression instanceof $case) {
      const { cases, $else } = expression
      for (const { $when, $then } of cases) {
        this.validateExpression($when, tableAliases)
        this.validateExpression($then, tableAliases)
      }
      if ($else) this.validateExpression($else, tableAliases)
    }
    else if (expression instanceof $column) {
      const { table: tableName, name } = expression
      if (name !== '*') {
        if (tableName) {
          const table = tableAliases[tableName]
          if (!table) throw new JQLError(`table '${tableName}' not exists`)
          if (!table.columns.find((column) => column.name === name)) throw new JQLError(`unknown column \`${tableName}\`.\`${name}\``)
        }
        else {
          const columns = Object.keys(tableAliases).reduce<Column[]>((result, key) => {
            if (result.length > 1) throw new JQLError(`column '${name}' in field list is ambiguous`)
            const table = tableAliases[key]
            const column = table.columns.find((column) => column.name === name)
            if (column) result.push(column)
            return result
          }, [])
          if (columns.length === 0) throw new JQLError(`unknown column '${name}'`)
        }
      }
    }
    else if (expression instanceof $exists) {
      const { query } = expression
      this.validateQuery(query, tableAliases)
    }
    else if (expression instanceof $function) {
      const { name } = expression
      let function_: JQLFunction<any> = functions[name.toLocaleLowerCase()]
      if (!function_) {
        const symbol = this.defined[name]
        if (!symbol) throw new JQLError(`function '${name}' is not defined`)
        function_ = this.context[symbol]
        if (typeof function_ !== 'function') throw new JQLError(`'${name}' is not a function`)
      }
    }
    else if (expression instanceof $and || expression instanceof $or) {
      for (const expression_ of expression.expressions) {
        this.validateExpression(expression_, tableAliases)
      }
    }
    else if (expression instanceof $in) {
      const { left, right } = expression
      this.validateExpression(left, tableAliases)
      if (right) {
        if (right instanceof Expression) {
          this.validateExpression(right, tableAliases)
        }
        else {
          this.validateQuery(right, tableAliases)
        }
      }
    }
    else if (expression instanceof $isNull) {
      const { left } = expression
      this.validateExpression(left, tableAliases)
    }
    else if (expression instanceof $value) {
      // do nothing
    }
  }

  private prepareTables(tableOrSubqueries: TableOrSubquery[], joinClauses?: JoinClause[]): Table[] {
    const tables: Table[] = []

    // $from
    for (const { name, query: query_, $as } of tableOrSubqueries) {
      let table: Table, content: any[]
      if (query_) {
        const resultset = this.runQuery(query_)
        table = new ResultSetTable($as as string, resultset.metadata)
        content = resultset
      }
      else {
        if (!name) throw new JQLError('[FATAL] missing table name')
        table = this.database.metadata.table(name)
        if ($as) table = table.clone($as)
        content = this.database.database[table.symbol]
        if (!table) throw new JQLError(`table '${name}' not exists`)
        else content = content || []
      }
      if (content.length === 0) return new ResultSet(new ResultSetTable())
      this.context[table.symbol] = content
      tables.push(table)
    }

    // TODO $join

    return tables
  }

  private prepareResultSet <T>(resultColumns: ResultColumn[], orderingTerms: OrderingTerm[] = [], tables: Table[]): IntermediateResultSet {
    // prepare result set
    const resultsetTable = new ResultSetTable()
    const sandbox = this

    function register(column: Column, $as?: string)
    function register(expression: Expression, $as?: string)
    function register(expression: Expression, column: Column, $as?: string)
    function register(...args: any[]) {
      let column: Column, expression: Expression, $as: string
      switch (args.length) {
        case 2:
          $as = args[1]
        case 1:
          if (args[0] instanceof Column) {
            column = args[0]
          }
          else {
            expression = args[0]
          }
          break
        case 3:
          
          break
      }
    }

    /* function register(expression: Expression, $as?: string, column?: Column) {
      $as = $as || expression.toString()
      const symbol = Symbol($as)
      if (expression instanceof $column) {
        if (column) {
          column = new Column(expression.name, symbol, column.type)
        }
        else if (!expression.table) {
          // check ambiguous column
          const columns = tables.reduce<Column[]>((result, table) => {
            let column: Column|undefined
            if (result.length < 2 && (column = table.columns.find((column) => column.name === name))) result.push(column)
            return result
          }, [])
          if (columns.length > 1) throw new JQLError(`ambiguous column '${name}'`)
          column = new Column(expression.name, symbol, columns[0].type)
        }
        else {
          const table = tables.find((table) => table.name === expression.table) as Table
          const column_ = table.columns.find((column) => column.name === expression.name) as Column
          column = new Column(expression.table, expression.name, symbol, column_.type)
        }
      }
      if (column) {
        resultsetTable.addColumn(column)
      }
      else if (expression instanceof $function) {
        let function_: JQLFunction<any> = functions[$as.toLocaleLowerCase()]
        if (!function_) {
          const symbol = sandbox.defined[$as]
          function_ = sandbox.context[symbol]
        }
        resultsetTable.addColumn($as, function_.type, symbol)
      }
      else if (expression instanceof $value) {
        resultsetTable.addColumn(name, expression.type, symbol)
      }
      else {
        resultsetTable.addColumn(name, 'boolean', symbol)
      }
      resultsetTable.mappings[symbol] = expression
    } */

    // $select
    for (const { expression, $as } of resultColumns) {
      if (expression instanceof $column && expression.name === '*') {
        // wildcard
        if (expression.table) {
          // target table
          const table = tables.find((table) => table.name === expression.table)
          if (!table) throw new JQLError(`table '${expression.name}' not exists`)
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

    // $order
    for (const { expression } of orderingTerms) {
      register(expression)
    }

    return new IntermediateResultSet(resultsetTable)
  }

  private runQuery <T>(query: Query, ...args: any[]): ResultSet<T> {
    // create sandbox
    const sandbox = new Sandbox(this.database, this)

    // clone query for further manipulation
    query = new Query(query)
    for (let i = 0, length = args.length; i < length; i += 1) query.setParam(i, args[i])

    // cache tables to be used
    const tables = sandbox.prepareTables(query.$from || [], query.$join)

    // create result set
    let resultset = sandbox.prepareResultSet<T>(query.$select, tables)
    const resultsetTable = resultset.metadata as ResultSetTable

    // iterate rows
    const cursor = new IntermediateCursor(sandbox, tables)
    while (cursor.next()) {
      if (!query.$where || this.evaluateExpression(cursor, query.$where, tables, sandbox)) {
        const row = {} as T
        for (const { symbol } of resultsetTable.columns) {
          const expression = resultsetTable.mappings[symbol]
          row[symbol] = this.evaluateExpression(cursor, expression, tables, sandbox)
        }
        resultset.push(row)
      }
    }

    // TODO order by
    resultset = resultset.sort((l: any, r: any): number => {

    })

    // TODO group by

    // TODO limit

    return resultset.commit<T>()
  }

  private evaluateExpression(cursor: ICursor, expression: Expression, tables: Table[], sandbox: Sandbox = this): any {
    if (expression instanceof $between) {
      const { left, $not, start, end } = expression
      const parameters = [...(expression.parameters || [])]
      const leftValue = this.evaluateExpression(cursor, left, tables, sandbox)
      const startValue = start ? this.evaluateExpression(cursor, start, tables, sandbox) : parameters.shift()
      const endValue = end ? this.evaluateExpression(cursor, end, tables, sandbox) : parameters.shift()
      if (left instanceof $column) {
        // TODO based column type
      }
      else {
        const result = leftValue >= startValue && leftValue <= endValue
        return $not ? !result : result
      }
    }
    else if (expression instanceof $binary) {
      const { left, operator, right } = expression
      const parameters = [...(expression.parameters || [])]
      const leftValue = this.evaluateExpression(cursor, left, tables, sandbox)
      const rightValue = right ? this.evaluateExpression(cursor, right, tables, sandbox) : parameters.shift()
      switch (operator) {
        case '=':
          return leftValue === rightValue
        case '<>':
          return leftValue !== rightValue
        case '<':
          return leftValue < rightValue
        case '<=':
          return leftValue <= rightValue
        case '>':
          return leftValue > rightValue
        case '>=':
          return leftValue >= rightValue
        case 'LIKE':
          return new RegExp(rightValue).test(leftValue)
        case 'NOT LIKE':
          return !new RegExp(rightValue).test(leftValue)
      }
    }
    else if (expression instanceof $case) {
      for (const { $when, $then } of expression.cases) {
        if (sandbox.evaluateExpression(cursor, $when, tables, sandbox)) {
          return sandbox.evaluateExpression(cursor, $then, tables, sandbox)
        }
      }
      if (expression.$else) return sandbox.evaluateExpression(cursor, expression.$else, tables, sandbox)
    }
    else if (expression instanceof $column) {
      const column = this.findColumn(expression, tables)
      return cursor.get(column.symbol)
    }
    else if (expression instanceof $exists) {
      const { $not, query } = expression
      const resultset = sandbox.runQuery<any>(query)
      return $not ? resultset.length === 0 : resultset.length > 0
    }
    else if (expression instanceof $function) {
      const { name, parameters = [] } = expression
      let function_: JQLFunction<any> = functions[name.toLocaleLowerCase()]
      if (!function_) {
        const symbol = sandbox.defined[name]
        function_ = sandbox.context[symbol]
      }
      return function_.run(...parameters)
    }
    else if (expression instanceof $and) {
      let result: boolean = true
      for (const expression_ of expression.expressions) {
        if (result = result && !!sandbox.evaluateExpression(cursor, expression_, tables, sandbox)) {
          return false
        }
      }
      return result
    }
    else if (expression instanceof $or) {
      let result: boolean = false
      for (const expression_ of expression.expressions) {
        if (result = result || !!this.evaluateExpression(cursor, expression_, tables, sandbox)) {
          return true
        }
      }
      return result
    }
    else if (expression instanceof $in) {
      let { left, $not, right, parameters } = expression
      if (!right) {
        if (!parameters || parameters[0] === undefined) throw new JQLError(`missing parameter 'right' for $in`)
        right = new $value({ value: parameters[0] })
      }
      let values: any[]
      if (right instanceof Expression) {
        let values_ = sandbox.evaluateExpression(cursor, right, tables, sandbox)
        if (!Array.isArray(values_)) values_ = [values_]
        values = values_
      }
      else {
        const resultset = sandbox.runQuery(right)
        values = []
        while (resultset.next()) values.push(resultset.get(0))
      }
      const value = sandbox.evaluateExpression(cursor, left, tables, sandbox)
      return $not ? values.indexOf(value) === -1 : values.indexOf(value) > -1
    }
    else if (expression instanceof $isNull) {
      const { left, $not } = expression
      const leftValue = this.evaluateExpression(cursor, left, tables, sandbox)
      const result = leftValue === undefined
      return $not ? !result : result
    }
    else if (expression instanceof $value) {
      return expression.value
    }
    else {
      throw new JQLError(`invalid expression '${expression.classname}'`)
    }
  }

  private findColumn(expression: $column, tables: Table[]): Column {
    const { table: tableName, name } = expression
    const table = tableName ? tables.find((table) => table.name === tableName) : tables[0]
    if (!table) throw new JQLError(`table '${name}' not exists`)
    const column = table.columns.find((column) => column.name === name)
    if (!column) throw new JQLError(`column '${expression.toString()}' not exists`)
    return column
  }
}

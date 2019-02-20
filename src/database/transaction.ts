import _ = require('lodash')
import uuid = require('uuid/v4')
import { Database } from '.'
import { JQLError } from '../utils/error'
import { Logger } from '../utils/logger'
import { IntermediateResultSet, ResultSet } from './cursor/resultset'
import { FromCursor, TableCursor } from './cursor/table'
import { functions, JQLFunction } from './function'
import { DataSource, RawRow, Row, Variable, VariableDef } from './interface'
import { Schema } from './schema'
import { RealTable, Table } from './schema/table'
import { Query } from './sql/query'
import { CompiledQuery } from './sql/query'

/**
 * a set of database operations
 * updates should be applied only when the transaction is committed
 */
export class Transaction {
  public static count = 0

  public readonly id: number = ++Transaction.count
  protected readonly logger: Logger = new Logger(`[Transaction#${this.id}]`)

  // this is readonly context
  protected readonly database: Database
  protected defaultSchema: Schema|undefined

  // this is the temporary variables defined
  protected readonly varDefinitions: { [key in string]: VariableDef } = {}
  protected readonly variables: { [key in symbol]: Variable } = {}

  // this is the context to be updated
  private readonly dirtySchemas: { [key in symbol]: Schema } = {}
  private readonly dirtyDatasource: DataSource = {}

  constructor(transaction: Transaction)
  constructor(database: Database, schemaName?: string)
  constructor(...args: any[]) {
    let database: Database, schemaName: string|undefined
    if (args[0] instanceof Transaction) {
      const transaction = args[0] as Transaction
      database = transaction.database
      if (transaction.defaultSchema) schemaName = transaction.defaultSchema.name
      for (const key of Object.keys(transaction.varDefinitions)) this.varDefinitions[key] = transaction.varDefinitions[key]
      for (const symbol of Object.getOwnPropertySymbols(transaction.variables)) this.variables[symbol] = transaction.variables[symbol]
    }
    else {
      database = args[0]
      schemaName = args[1]
    }

    this.database = database
    if (schemaName) this.useSchema(schemaName, true)
  }

  // get generated table schema of the given table or query
  public getTable(tableOrQuery: string|Query|CompiledQuery, $as?: string, schema?: string|Schema): RealTable {
    if (typeof tableOrQuery === 'string') {
      if (!schema) throw new JQLError(`No target schema is specified for table '${tableOrQuery}'`)
      if (typeof schema === 'string') schema = this.database.getSchema(schema)
      return schema.getTable(tableOrQuery).clone($as)
    }
    else {
      return tableOrQuery.compile(this, { defaultSchema: this.defaultSchema, $as }).resultsetSchema
    }
  }

  // get datasource of the required schema
  public getContext(name: string): { [key in symbol]: Row[] } {
    return this.database.getContext(name)
  }

  // get temporary variable by name
  public getVariable(name: string): Variable {
    const varDefinition = this.varDefinitions[name]
    if (!varDefinition) throw new JQLError(`Unknown variable '${name}'`)
    const variable = this.variables[varDefinition.symbol] as Variable
    return variable
  }

  // get function by name
  public getFunction(name: string): JQLFunction {
    // predefined functions
    if (functions[name.toLocaleLowerCase()]) return functions[name.toLocaleLowerCase()]

    // user-defined functions
    let variable: JQLFunction
    try {
      const variable_: Variable = this.getVariable(name)
      if (!(variable_ instanceof JQLFunction)) throw new JQLError(`Unknown function '${name}'`)
      variable = variable_
    }
    catch (e) {
      throw new JQLError(`Unknown function '${name}'`)
    }
    return variable
  }

  // set default schema
  public useSchema(name: string, noLog?: boolean): Transaction {
    this.defaultSchema = this.database.getSchema(name)
    if (!noLog) this.logger.info(`USE \`${name}\` #${this.id}`)
    return this
  }

  // define temporary variable
  public defineVariable(name: string, value: Variable): Transaction {
    const varDefinition = new VariableDef(name)
    this.varDefinitions[name] = varDefinition
    this.variables[varDefinition.symbol] = value
    this.logger.info(`DEFINE \`${name}\` = ${value.toString()}`)
    return this
  }

  // create a new table
  public createTable(table: Table, ifNotExists?: boolean): Transaction
  public createTable(schemaName: string, table: Table, ifNotExists?: boolean): Transaction
  public createTable(...args: any[]): Transaction {
    let schemaName: string, table: Table, ifNotExists: boolean = false
    if (typeof args[0] === 'string') {
      schemaName = args[0]
      table = args[1]
      ifNotExists = args[2] || ifNotExists
    }
    else {
      if (!this.defaultSchema) throw new JQLError('No default schema is selected')
      schemaName = this.defaultSchema.name
      table = args[0]
      ifNotExists = args[1] || ifNotExists
    }

    // create table
    let schema = this.database.getSchema(schemaName)
    if (!this.dirtySchemas[schema.symbol]) {
      this.dirtySchemas[schema.symbol] = schema.clone()
    }
    schema = this.dirtySchemas[schema.symbol]
    schema.createTable(table, ifNotExists)

    // add to context
    const context = this.dirtyDatasource[schema.symbol] = this.dirtyDatasource[schema.symbol] || {}
    context[table.symbol] = []

    this.logger.info(`CREATE TABLE ${ifNotExists ? 'IF NOT EXISTS ' : ''}\`${schema.name}\`.\`${table.name}\``)
    return this
  }

  // drop an existing table
  public dropTable(tableName: string, ifExists?: boolean): Transaction
  public dropTable(schemaName: string, tableName: string, ifExists?: boolean): Transaction
  public dropTable(...args: any[]): Transaction {
    let schemaName: string, tableName: string, ifExists: boolean = false
    if (typeof args[1] === 'string') {
      schemaName = args[0]
      tableName = args[1]
      ifExists = args[2] || ifExists
    }
    else {
      if (!this.defaultSchema) throw new JQLError('No default schema is selected')
      schemaName = this.defaultSchema.name
      tableName = args[0]
      ifExists = args[1] || ifExists
    }

    // drop table
    let schema = this.database.getSchema(schemaName)
    if (!this.dirtySchemas[schema.symbol]) {
      this.dirtySchemas[schema.symbol] = schema.clone()
    }
    schema = this.dirtySchemas[schema.symbol]
    const table = schema.dropTable(tableName, ifExists)
    if (!table) return this
    this.dirtySchemas[schema.symbol] = schema

    // drop from context
    const context = this.dirtyDatasource[schema.symbol] = this.dirtyDatasource[schema.symbol] || {}
    context[table.symbol] = undefined

    this.logger.info(`DROP TABLE ${ifExists ? 'IF EXISTS ' : ''}\`${schema.name}\`.\`${table.name}\``)
    return this
  }

  // compile and run the given query
  public run(query: Query|CompiledQuery): ResultSet {
    query = query.compile(this, { defaultSchema: this.defaultSchema })
    const resultset = new Sandbox(this, query).run()
    this.logger.info(query.toString())
    return resultset
  }

  // insert rows
  public insert(tableName: string, ...rows: RawRow[]): Transaction
  public insert(schemaName: string, tableName: string, ...rows: RawRow[]): Transaction
  public insert(...args: any[]): Transaction {
    let schemaName: string, tableName: string, rows: RawRow[]
    if (typeof args[1] === 'string') {
      schemaName = args[0]
      tableName = args[1]
      rows = args.slice(2)
    }
    else {
      if (!this.defaultSchema) throw new JQLError('No default schema is selected')
      schemaName = this.defaultSchema.name
      tableName = args[0]
      rows = args.slice(1)
    }

    // find table
    let schema = this.database.getSchema(schemaName)
    if (!this.dirtySchemas[schema.symbol]) {
      this.dirtySchemas[schema.symbol] = schema.clone()
    }
    schema = this.dirtySchemas[schema.symbol]
    const table = schema.getTable(tableName)
    const rows_ = rows.map((row) => table.validate(row))

    // insert into context
    if (!this.dirtyDatasource[schema.symbol]) {
      this.dirtyDatasource[schema.symbol] = {}
    }
    if (!this.dirtyDatasource[schema.symbol][table.symbol]) {
      this.dirtyDatasource[schema.symbol][table.symbol] = _.cloneDeep(this.database.getContext(schema.name)[table.symbol])
    }
    const dirtyContext = this.dirtyDatasource[schema.symbol][table.symbol] as Row[]
    dirtyContext.push(...rows_)

    this.logger.info(`INSERT INTO \`${table.name}\` VALUES (\n${rows.map((row) => JSON.stringify(row)).join('\n')}\n)`)
    return this
  }

  // close without commit
  public close() {
    this.logger.info('CLOSE')
  }

  // commit changes
  public end() {
    this.database.updateSchemas(this.dirtySchemas)
    this.database.updateDatasource(this.dirtyDatasource)
    this.logger.info(`COMMIT`)
  }
}

/**
 * handle SELECT operation
 */
export class Sandbox extends Transaction {
  constructor(transaction: Transaction, private query: CompiledQuery) {
    super(transaction)
  }

  public defineVariable(name: string, value: Variable|CompiledQuery): Sandbox {
    if (value instanceof CompiledQuery) {
      value = super.run(value)
    }
    super.defineVariable(name, value)
    return this
  }

  public run(): ResultSet {
    const cursor = new FromCursor(this.query.$from.map((tableOrSubquery) => new TableCursor(this, tableOrSubquery)))

    const $order = this.query.$order
    const resultset = new IntermediateResultSet()
    while (cursor.next()) {
      if (!this.query.$where || this.query.$where.evaluate(this, cursor)) {
        // add row
        resultset.nextRow()

        // columns to be shown
        for (const { expression, symbol } of this.query.$select) {
          resultset.set(symbol, expression.evaluate(this, cursor))
        }

        // columns for ordering
        if ($order) {
          for (const { expression, symbol } of $order) {
            // TODO check if symbol set
            resultset.set(symbol, expression.evaluate(this, cursor))
          }
        }
      }
    }

    // TODO group by

    // order by
    if ($order) {
      resultset.sort((l, r) => {
        for (const { order, symbol } of $order) {
          if (l[symbol] < r[symbol]) return order === 'DESC' ? 1 : -1
          if (l[symbol] > r[symbol]) return order === 'DESC' ? -1 : 1
        }
        return 0
      })
    }

    return resultset.commit(this.query.resultsetSchema, this.query.$limit)
  }
}

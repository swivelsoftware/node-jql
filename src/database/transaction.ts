import uuid = require('uuid/v4')
import { JQLError } from '../utils/error'
import { Logger } from '../utils/logger'
import { Database, Datasource, Row } from './core'
import { ResultSet } from './cursor/resultset'
import { predefinedFunctions } from './function'
import { JQLFunction } from './function/base'
import { Sandbox } from './sandbox'
import { RealTable, Schema, Table } from './schema'
import { CompiledQuery, Query } from './sql/query/core'

const logger = new Logger(__filename)

export type Variable = string|Query|ResultSet

export class VarDefinition {
  public symbol: symbol

  constructor(readonly name: string) {
    this.symbol = Symbol(name)
  }
}

export class Transaction {
  public readonly id: string = uuid()

  // this is readonly context
  protected readonly database: Database
  protected defaultSchema: Schema|undefined

  // this is the temporary variables defined
  protected readonly varDefinitions: { [key in string]: VarDefinition } = {}
  protected readonly variables: { [key in symbol]: Variable } = {}

  // this is the context to be updated
  private readonly dirtySchemas: { [key in symbol]: Schema } = {}
  private readonly dirtyDatabase: Datasource = {}

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
    if (schemaName) this.useSchema(schemaName)
  }

  public getVariable(name: string): Variable {
    const varDefinition = this.varDefinitions[name]
    if (!varDefinition) throw new JQLError(`Unknown variable '${name}'`)
    const variable = this.variables[varDefinition.symbol] as Variable
    return variable
  }

  public getFunction(name: string): JQLFunction {
    // predefined functions
    if (predefinedFunctions[name.toLocaleLowerCase()]) return predefinedFunctions[name.toLocaleLowerCase()]

    // user-defined functions
    let variable
    try {
      variable = this.getVariable(name)
    }
    catch (e) {
      throw new JQLError(`Unknown function '${name}'`, e)
    }
    if (!(variable instanceof JQLFunction)) throw new JQLError(`Unknown function '${name}'`)
    return variable
  }

  // generate metadata of the resultset of the given query
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

  public getContext(name: string): { [key in symbol]: Row[] } {
    return this.database.getContext(name)
  }

  // set default schema
  public useSchema(name: string): Transaction {
    this.defaultSchema = this.database.getSchema(name).clone()
    logger.info(`[Transaction#${this.id}] Transaction.useSchema(${name})`)
    return this
  }

  public defineVariable(name: string, value: Variable): Transaction {
    const varDefinition = new VarDefinition(name)
    this.varDefinitions[name] = varDefinition
    this.variables[varDefinition.symbol] = value
    logger.info(`[Transaction#${this.id}] Transaction.defineVariable(${name})`)
    return this
  }

  public createTable(table: Table): Transaction {
    if (!this.defaultSchema) throw new JQLError('No default schema is selected')
    this.defaultSchema.createTable(table)
    this.dirtySchemas[this.defaultSchema.symbol] = this.defaultSchema
    this.dirtyDatabase[table.symbol] = []
    logger.info(`[Transaction#${this.id}] Transaction.createTable(${table.name})`)
    return this
  }

  public dropTable(name: string): Transaction {
    if (!this.defaultSchema) throw new JQLError('No default schema is selected')
    const table = this.defaultSchema.dropTable(name)
    this.dirtySchemas[this.defaultSchema.symbol] = this.defaultSchema
    delete this.dirtyDatabase[table.symbol]
    logger.info(`[Transaction#${this.id}] Transaction.dropTable(${name})`)
    return this
  }

  public runQuery(query: Query|CompiledQuery): ResultSet {
    return new Sandbox(this, query.compile(this, { defaultSchema: this.defaultSchema })).runQuery()
  }

  // commit changes
  public endTransaction() {
    this.database.updateSchemas(this.dirtySchemas)
    this.database.updateDatasource(this.dirtyDatabase)
    logger.info(`[Transaction#${this.id}] Transaction.endTransaction()`)
  }
}

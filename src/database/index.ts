import { setEnv } from '../utils/env'
import { JQLError } from '../utils/error'
import { Logger } from '../utils/logger'
import { DataSource, defaultOptions, defaultProdOptions, IDatebaseOptions, Row } from './interface'
import { Schema } from './schema'
import { Transaction } from './transaction'

const logger = new Logger(__filename)

// database core
export class Database {
  private readonly schemas: { [key in symbol]: Schema } = {}
  private readonly datasource: DataSource = {}

  constructor(options: IDatebaseOptions = {}) {
    const baseOptions = process.env.NODE_ENV === 'production' ? defaultProdOptions : defaultOptions
    options = Object.assign({}, baseOptions, options)
    for (const key of Object.keys(options)) setEnv(key, options[key])
  }

  // create a new database
  public createDatabase(name: string, ifNotExists = false) {
    try {
      this.getSchema(name)
      if (ifNotExists) return
      throw new JQLError(`Database '${name}' already exists`)
    }
    catch (e) { /* do nothing */ }
    const schema = new Schema(this, name)
    this.schemas[schema.symbol] = schema
    this.datasource[schema.symbol] = {}
    logger.info(`CREATE DATABASE ${ifNotExists ? 'IF NOT EXISTS ' : ''}\`${name}\``)
  }

  // drop an existing database
  public dropDatabase(name: string, ifExists = false) {
    try {
      const schema = this.getSchema(name)
      delete this.schemas[schema.symbol]
      delete this.datasource[schema.symbol]
      logger.info(`DROP DATABASE ${ifExists ? 'IF EXISTS ' : ''}\`${name}\``)
    }
    catch (e) {
      if (ifExists) return
      throw new JQLError(`Database '${name}' not exists`)
    }
  }

  // start a new transaction
  public beginTransaction(schemaName?: string): Transaction {
    return new Transaction(this, schemaName)
  }

  // get database schema by name
  public getSchema(name: string): Schema {
    const schema = Object.getOwnPropertySymbols(this.schemas)
      .map<Schema>((symbol) => this.schemas[symbol])
      .find((schema) => schema.name === name)
    if (!schema) throw new JQLError(`Database '${name}' not exists`)
    return schema
  }

  // update modified schemas
  public updateSchemas(dirtySchemas: { [key in symbol]: Schema }) {
    const symbols = Object.getOwnPropertySymbols(dirtySchemas)
    if (symbols.length) Object.assign(this.schemas, dirtySchemas)
  }

  // get datasource of the required schema
  public getContext(name: string): { [key in symbol]: Row[] } {
    const schema = this.getSchema(name)
    return this.datasource[schema.symbol]
  }

  // update modified datasource
  public updateDatasource(dirtyDatasource: DataSource) {
    const symbols = Object.getOwnPropertySymbols(dirtyDatasource)
    if (symbols.length) {
      for (const symbol of symbols) {
        this.datasource[symbol] = Object.assign(this.datasource[symbol] || {}, dirtyDatasource[symbol])
        for (const symbol_ of Object.getOwnPropertySymbols(this.datasource[symbol])) {
          if (this.datasource[symbol][symbol_] === undefined) {
            delete this.datasource[symbol][symbol_]
          }
        }
      }
    }
  }
}

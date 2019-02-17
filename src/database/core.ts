import { JQLError } from '../utils/error'
import { Logger } from '../utils/logger'
import { Schema } from './schema'
import { Transaction } from './transaction'

const logger = new Logger(__filename)

export type Row = { [key in symbol]: any }

// datasource structure
export type Datasource = {
  [key in symbol]: {  // database-level
    [key in symbol]:  // table-level
      Row[]           // rows
  }
}

// database core
export class Database {
  private readonly schemas: { [key in symbol]: Schema } = {}
  private readonly datasource: Datasource = {}

  public createDatabase(name: string) {
    if (this.getSchema(name)) throw new JQLError(`Database '${name}' already exists`)
    const schema = new Schema(this, name)
    this.schemas[schema.symbol] = schema
    this.datasource[schema.symbol] = {}
    logger.info(`Database.createDatabase(${name})`)
  }

  public dropDatabase(name: string) {
    const schema = this.getSchema(name)
    if (!schema) throw new JQLError(`Database '${name}' not exists`)
    delete this.schemas[schema.symbol]
    delete this.datasource[schema.symbol]
    logger.info(`Database.createDatabase(${name})`)
  }

  public beginTransaction(schemaName?: string): Transaction {
    return new Transaction(this, schemaName)
  }

  public getSchema(name: string): Schema {
    const schema = Object.getOwnPropertySymbols(this.schemas)
      .map<Schema>((symbol) => this.schemas[symbol])
      .find((schema) => schema.name === name)
    if (!schema) throw new JQLError(`Database '${name}' not exists`)
    return schema
  }

  public getContext(name: string): { [key in symbol]: Row[] } {
    const schema = this.getSchema(name)
    return this.datasource[schema.symbol]
  }

  public updateSchemas(dirtySchemas: { [key in symbol]: Schema }) {
    Object.assign(this.schemas, dirtySchemas)
    logger.info(`Database.updateSchemas(${Object.getOwnPropertySymbols(dirtySchemas)})`)
  }

  public updateDatasource(dirtyDatasource: Datasource) {
    for (const symbol of Object.getOwnPropertySymbols(dirtyDatasource)) {
      Object.assign(this.datasource[symbol], dirtyDatasource[symbol])
    }
    logger.info(`Database.updateDatasource(${Object.getOwnPropertySymbols(dirtyDatasource).map((symbol) => [symbol, ...Object.getOwnPropertySymbols(symbol)])})`)
  }
}

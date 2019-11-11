import { DatabaseEngine } from '..'
import { MemoryDatabaseEngine } from '../engine/memory'
import { JQL } from '../jql'
import { CreateFunctionJQL } from '../jql/create/function'
import { CreateSchemaJQL } from '../jql/create/schema'
import { DropSchemaJQL } from '../jql/drop/schema'
import { Query } from '../jql/select'
import { SetVariableJQL } from '../jql/set'
import { ERROR_CODES, JQLError } from './error'
import { ReadWriteLock } from './lock'
import { IEngineOptions } from './options'

/**
 * Database main application
 */
export class Database extends DatabaseEngine {
  /**
   * Default database engine used
   */
  protected defaultEngine: string

  /**
   * Supported database engines
   */
  protected readonly engines: { [key: string]: DatabaseEngine } = {}

  /**
   * Record the engine for each table
   * `schemas[schema][table] = engine`
   */
  protected readonly schemas: { [key: string]: { [key: string]: string } } = {}

  /**
   * ReadWriteLock for each schema
   */
  protected readonly schemaLocks: { [key: string]: ReadWriteLock } = {}

  constructor(
    /**
     * Database options
     */
    protected readonly options: IEngineOptions = {},
  ) {
    super()

    // support MemoryDatabaseEngine
    this.register(MemoryDatabaseEngine, true)
  }

  /**
   * Supported database engine
   * @param engine [Constructor<DatabaseEngine>]
   */
  public register(engine: new (...args) => DatabaseEngine, defaultEngine = false): Database {
    this.engines[engine.name] = new engine(this.options[engine.name] || {})
    if (defaultEngine) this.defaultEngine = engine.name
    return this
  }

  // @override
  public async query<T>(tid: string, query: Query): Promise<T> {
    // TODO
    throw new Error('Not Implemented')
  }

  // @override
  public async update(tid: string, jql: JQL): Promise<number> {
    // Create schema
    if (jql instanceof CreateSchemaJQL) {
      if (!jql.$ifNotExists && this.schemas[jql.name]) throw new JQLError(ERROR_CODES.ALREADY_EXISTS, `Schema '${jql.name}' already exists`)
      if (!this.schemas[jql.name]) {
        this.schemas[jql.name] = {}
        this.schemaLocks[jql.name] = new ReadWriteLock(this.options)
      }
      return 1
    }
    else if (jql instanceof DropSchemaJQL) {
      if (!jql.$ifExists && !this.schemas[jql.name]) throw new JQLError(ERROR_CODES.NOT_EXISTS, `Schema '${jql.name}' not exists`)
      if (this.schemas[jql.name]) {
        if (!this.schemaLocks[jql.name]) throw new JQLError(ERROR_CODES.FATAL, `Server Error: Schema lock '${jql.name}' not exists`)
        await this.schemaLocks[jql.name].close(tid, () => { throw new JQLError(ERROR_CODES.CANCELED) })
        delete this.schemaLocks[jql.name]
        delete this.schemas[jql.name]
      }
      return 1
    }
    else if (jql instanceof CreateFunctionJQL) {
      if (jql.engine && !this.engines[jql.engine]) throw new JQLError(ERROR_CODES.NOT_SUPPORTED, `Engine '${jql.engine}' not supported`)
      // TODO
    }
    // TODO
    throw new Error('Not Implemented')
  }

  /**
   * Whether the given query handles data from different database engine
   * @param query [Query]
   */
  protected multiEngineInvolved(query: Query): boolean {
    // TODO
    return false
  }
}

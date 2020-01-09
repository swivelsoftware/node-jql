import { CreateFunction, CreateSchema, CreateTable, DropFunction, DropSchema, DropTable, ISQL, parse, Query } from '@node-jql/sql-builder'
import uuid from 'uuid/v4'
import { Engine } from './engine'
import { IApplicationOptions, IQueryOptions, IQueryResult, IUpdateOptions, IUpdateResult } from './index.if'
import { ConsoleLogger, Logger } from './logger'
import { MemoryEngine } from './memory'
import { CreateTableJQL } from './memory/jql/create/table'
import { DropTableJQL } from './memory/jql/drop/table'
import { ExtendTask, PromiseTask, Task } from './task'

/**
 * Supported table engines
 */
export const engines: { [key: string]: Engine } = {}

/**
 * Global logger
 */
export let logger: Logger

/**
 * Global application
 */
export let app: CoreApplication

/**
 * Main application
 */
export class CoreApplication {
  private readonly tableEngines: { [key: string]: { [key: string]: Engine } } = {}

  constructor(public readonly options: IApplicationOptions = {}) {
    if (!app) {
      this.logWith(ConsoleLogger)
      this.register(MemoryEngine)
      app = this
    }
    return app
  }

  /**
   * Set Console class
   * @param consoleClass [Class<T extends Logger>]
   */
  public logWith(loggerClass: new (logLevel?: string) => Logger): CoreApplication {
    logger = new loggerClass(this.options.logLevel || 'warn')
    return this
  }

  /**
   * Register table engine
   * @param engineClass [Class<T extends Engine>]
   */
  public register(engineClass: new (options?: IApplicationOptions) => Engine): CoreApplication {
    engines[engineClass.name] = new engineClass(this.options)
    return this
  }

  /**
   * Create session
   */
  public async createSession(): Promise<string> {
    const sessionId = uuid()
    await Promise.all(Object.keys(engines).map(name => engines[name].createSession(sessionId)))
    return sessionId
  }

  /**
   * Kill session
   * @param sessionId [string]
   */
  public async killSession(sessionId: string) {
    await Promise.all(Object.keys(engines).map(name => engines[name].killSession(sessionId)))
  }

  /**
   * Execute query
   * @param query [Query]
   * @param options [IQueryOptions]
   */
  public query(query: Query, options: IQueryOptions): Task<IQueryResult> {
    // TODO
    throw new Error(`Unknown query '${query.toString()}'`)
  }

  /**
   * Execute update statements
   * @param sql [ISQL]
   * @param options [IUpdateOptions]
   */
  public update(sql: ISQL, options: IUpdateOptions): Task<IUpdateResult> {
    sql = parse(sql)
    if (sql instanceof CreateSchema) {
      const start = Date.now()
      return new ExtendTask<Partial<IUpdateResult>, IUpdateResult>(
        this.createSchema(sql.name, sql.ifNotExists),
        result => ({
          elpased: Date.now() - start,
          sql: sql.toString(),
          rowsAffected: result.rowsAffected || 0,
        }),
      ).run()
    }
    else if (sql instanceof CreateTable) {
      const start = Date.now()
      const jql = new CreateTableJQL(sql, options)
      const engine = engines[jql.engine]
      return new ExtendTask<Partial<IUpdateResult>, IUpdateResult>(
        engine.createTable(jql, options.sessionId),
        result => {
          this.tableEngines[jql.schema][jql.name] = engine
          return {
            elpased: Date.now() - start,
            sql: sql.toString(),
            rowsAffected: result.rowsAffected || 0,
          }
        },
      ).run()
    }
    else if (sql instanceof CreateFunction) {
      const start = Date.now()
      const engine = engines[options.engine || 'MemoryEngine']
      return new ExtendTask<Partial<IUpdateResult>, IUpdateResult>(
        engine.createFunction(sql),
        result => ({
          elpased: Date.now() - start,
          sql: sql.toString(),
          rowsAffected: result.rowsAffected || 0,
        }),
      ).run()
    }
    else if (sql instanceof DropTable) {
      const start = Date.now()
      const jql = new DropTableJQL(sql, options)
      const engine = this.tableEngines[jql.schema][jql.name]
      return new ExtendTask<Partial<IUpdateResult>, IUpdateResult>(
        engine.dropTable(jql, options.sessionId),
        result => {
          delete this.tableEngines[jql.schema][jql.name]
          return {
            elpased: Date.now() - start,
            sql: sql.toString(),
            rowsAffected: result.rowsAffected || 0,
          }
        },
      ).run()
    }
    else if (sql instanceof DropSchema) {
      const start = Date.now()
      return new ExtendTask<Partial<IUpdateResult>, IUpdateResult>(
        this.dropSchema(sql.name, sql.ifExists),
        result => ({
          elpased: Date.now() - start,
          sql: sql.toString(),
          rowsAffected: result.rowsAffected || 0,
        }),
      ).run()
    }
    // TODO
    throw new Error(`Unknown statement '${sql.toString()}'`)
  }

  private createSchema(name: string, ifNotExists: boolean = false): Task<Partial<IUpdateResult>> {
    return new PromiseTask(async task => {
      if (this.tableEngines[name]) {
        if (ifNotExists) return { rowsAffected: 0 }
        throw new Error(`Schema '${name}' already exists`)
      }
      else {
        this.tableEngines[name] = {}
        return { rowsAffected: 1 }
      }
    })
  }

  private dropSchema(name: string, ifExists: boolean = false): Task<Partial<IUpdateResult>> {
    return new PromiseTask(async task => {
      if (!this.tableEngines[name]) {
        if (ifExists) return { rowsAffected: 0 }
        throw new Error(`Schema '${name}' does not exist`)
      }
      else {
        delete this.tableEngines[name]
        return { rowsAffected: 1 }
      }
    })
  }
}

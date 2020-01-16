import { CreateFunction, CreateSchema, CreateTable, DropFunction, DropSchema, DropTable, Insert, ISQL, parse, Query } from '@node-jql/sql-builder'
import uuid from 'uuid/v4'
import { Engine } from './engine'
import { IApplicationOptions, IQueryOptions, IQueryResult, IUpdateOptions, IUpdateResult } from './index.if'
import { ConsoleLogger, Logger } from './logger'
import { MemoryEngine } from './memory'
import { ExtendTask, PromiseTask, Task } from './task'
import { getEngine, getSchema } from './utils'

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
    query = parse(query)
    this.checkEngine(query)
    logger.debug({ tag: 'app.ts', sessionId: options.sessionId, msg: [`Query (${query.toString()})`] })
    // TODO
    throw new Error(`Not implemented`)
  }

  /**
   * Execute update statements
   * @param sql [ISQL]
   * @param options [IUpdateOptions]
   */
  public update(sql: ISQL, options: IUpdateOptions): Task<IUpdateResult> {
    sql = parse(sql)
    logger.debug({ tag: 'app.ts', sessionId: options.sessionId, msg: [`Execute (${sql.toString()})`] })
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
      const sql_ = new CreateTable({
        ...sql.toJson(),
        schema: getSchema(sql, options),
      })
      const engine = engines[getEngine(sql_, options)]
      if (!engine) throw new SyntaxError(`Unknown engine '${engine}'`)
      return new ExtendTask<Partial<IUpdateResult>, IUpdateResult>(
        engine.createTable(sql_, options.sessionId),
        result => {
          this.tableEngines[sql_.schema as string][sql_.name] = engine
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
      const sql_ = new DropTable({
        ...sql.toJson(),
        schema: getSchema(sql, options),
      })
      const engine = this.tableEngines[sql_.schema as string][sql_.name]
      return new ExtendTask<Partial<IUpdateResult>, IUpdateResult>(
        engine.dropTable(sql_, options.sessionId),
        result => {
          delete this.tableEngines[sql_.schema as string][sql_.name]
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
        this.dropSchema(options.sessionId, sql.name, sql.ifExists),
        result => ({
          elpased: Date.now() - start,
          sql: sql.toString(),
          rowsAffected: result.rowsAffected || 0,
        }),
      ).run()
    }
    else if (sql instanceof DropFunction) {
      const start = Date.now()
      const engine = engines[options.engine || 'MemoryEngine']
      return new ExtendTask<Partial<IUpdateResult>, IUpdateResult>(
        engine.dropFunction(sql),
        result => ({
          elpased: Date.now() - start,
          sql: sql.toString(),
          rowsAffected: result.rowsAffected || 0,
        }),
      ).run()
    }
    else if (sql instanceof Insert) {
      const start = Date.now()
      const sql_ = new Insert({
        ...sql.toJson(),
        schema: getSchema(sql, options),
      })
      const engine = this.tableEngines[sql_.schema as string][sql_.name]
      return new ExtendTask<Partial<IUpdateResult>, IUpdateResult>(
        engine.insert(sql),
        result => ({
          elpased: Date.now() - start,
          sql: sql.toString(),
          rowsAffected: result.rowsAffected || 0,
        }),
      ).run()
    }
    throw new Error(`Unknown statement '${sql.toString()}'`)
  }

  /**
   * Check if multiple engines are involved
   */
  private checkEngine(sql: Query|ISQL) {
    if (sql instanceof Query) {
      // TODO
    }
  }

  /**
   * CREATE SCHEMA
   * @param name [string]
   * @param ifNotExists [boolean]
   */
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

  /**
   * DROP SCHEMA, and delete the schema created in engines
   * @param sessionId [string]
   * @param name [string]
   * @param ifExists [boolean]
   */
  private dropSchema(sessionId: string, name: string, ifExists: boolean = false): Task<Partial<IUpdateResult>> {
    return new PromiseTask(async task => {
      if (!this.tableEngines[name]) {
        if (ifExists) return { rowsAffected: 0 }
        throw new Error(`Schema '${name}' does not exist`)
      }
      else {
        const engineNames = Object.keys(engines)
        await Promise.all(engineNames.map(engine => engines[engine].dropSchema(name, sessionId)))
        delete this.tableEngines[name]
        return { rowsAffected: 1 }
      }
    })
  }
}

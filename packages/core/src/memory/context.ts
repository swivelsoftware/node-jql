import uuid from 'uuid/v4'
import { logger } from '../app'
import { JQLFunction } from './function'
import { CreateFunctionJQL } from './jql/create/function'
import { TableLock } from './lock'
import { Table } from './table'

/**
 * Global session ID
 * Used in case a session ID is required but none is provided
 */
export const DEFAULT_SESSION_ID = uuid()

/**
 * Memory context
 * Read-only if session ID is provided
 */
class Context {
  public readonly functions: { [key: string]: JQLFunction } = {}
  public readonly tables: { [key: string]: { [key: string]: Table } } = {}
  public readonly data: { [key: string]: { [key: string]: any[] } } = {}
  public readonly locks: { [key: string]: { [key: string]: TableLock } } = {}

  constructor(public readonly sessionId?: string, public readonly isReadonly = false) {
    if (sessionId && isReadonly) {
      this.merge(globalContext, sessionContexts[sessionId])
    }
  }

  /**
   * Get table lock
   * @param schema [string]
   * @param name [string]
   */
  public getLock(schema: string, name: string): TableLock {
    return this.locks[schema][name]
  }

  /**
   * Check schema exists
   * @param name [string]
   */
  public hasSchema(name: string): boolean {
    return !!this.tables[name]
  }

  /**
   * Create schema context
   * @param name [string]
   */
  public createSchema(name: string) {
    this.checkReadonly()
    if (!this.tables[name]) this.tables[name] = {}
    if (!this.data[name]) this.data[name] = {}
    if (!this.locks[name]) this.locks[name] = {}
    logger.debug({ tag: 'context.ts', sessionId: this.sessionId || 'global', msg: [`Schema '${name}' created`] })
  }

  /**
   * Drop schema context
   * @param name [string]
   */
  public dropSchema(name: string) {
    this.checkReadonly()
    delete this.tables[name]
    delete this.data[name]
    delete this.locks[name]
    logger.debug({ tag: 'context.ts', sessionId: this.sessionId || 'global', msg: [`Schema '${name}' dropped`] })
  }

  /**
   * Check table exists
   * @param table [Table]
   */
  public hasTable(schema: string, name: string): boolean {
    return this.hasSchema(schema) && !!this.tables[schema][name]
  }

  /**
   * Create table context
   * @param table [Table]
   */
  public createTable(table: Table) {
    this.checkReadonly()
    const { schema, name } = table
    if (!this.hasSchema(table.schema)) this.createSchema(schema)
    this.tables[schema][name] = table
    this.data[schema][name] = []
    this.locks[schema][name] = new TableLock(name)
    logger.debug({ tag: 'context.ts', sessionId: this.sessionId || 'global', msg: [`Table '${name}' created`] })
  }

  /**
   * Drop table context
   * @param schema [string]
   * @param name [string]
   */
  public dropTable(schema: string, name: string) {
    this.checkReadonly()
    delete this.tables[schema][name]
    delete this.data[schema][name]
    delete this.locks[schema][name]
    logger.debug({ tag: 'context.ts', sessionId: this.sessionId || 'global', msg: [`Table '${name}' dropped`] })
  }

  /**
   * Check function exists
   * @param name [string]
   */
  public hasFunction(name: string): boolean {
    return !!this.functions[name]
  }

  /**
   * Create function
   * @param jql [CreateFunctionJQL]
   */
  public createFunction(jql: CreateFunctionJQL) {
    this.checkReadonly()
    if (this.hasFunction(jql.name)) throw new Error(`Function '${jql.name}' already exists`)
    this.functions[jql.name] = new JQLFunction(jql)
    logger.debug({ tag: 'context.ts', sessionId: this.sessionId || 'global', msg: [`Function '${jql.name}' created`] })
  }

  /**
   * Merge multiple contexts
   * @param contexts [Array<Context>]
   */
  private merge(...contexts: Context[]) {
    for (const { functions, tables, data, locks } of contexts) {
      const schemas = Object.keys(tables)
      for (const schema of schemas) {
        if (!this.tables[schema]) this.tables[schema] = {}
        if (!this.data[schema]) this.data[schema] = {}
        if (!this.locks[schema]) this.locks[schema] = {}
        Object.assign(this.tables[schema], tables[schema] || {})
        Object.assign(this.data[schema], data[schema] || {})
        Object.assign(this.locks[schema], locks[schema] || {})
      }
      Object.assign(this.functions, functions)
    }
  }

  /**
   * Check if context is read-only
   */
  private checkReadonly() {
    if (this.isReadonly) throw new Error('Context is read-only')
  }
}

/**
 * Global context (exists throughout the whole application life)
 */
export const globalContext = new Context()

/**
 * Session context (exists until the session is closed)
 */
export const sessionContexts: { [key: string]: Context } = {}

/**
 * Useful function for getting memory context
 * @param sessionId [string]
 * @param mode [string]
 * @param action [string]
 */
export function getContext(sessionId: string, mode: 'readonly'|'global'|'session', action?: 'create'|'delete'): Context {
  switch (mode) {
    case 'readonly':
      return new Context(sessionId, true)
    case 'global':
      return globalContext
    case 'session':
      let context = sessionContexts[sessionId]
      if (!context && action !== 'create') throw new Error(`Session '${sessionId}' is not available`)
      switch (action) {
        case 'create':
          context = sessionContexts[sessionId] = new Context(sessionId)
          logger.debug({ tag: 'context.ts', sessionId, msg: [`Context created`] })
          break
        case 'delete':
          delete sessionContexts[sessionId]
          logger.debug({ tag: 'context.ts', sessionId, msg: [`Context deleted`] })
          break
      }
      return context
  }
}

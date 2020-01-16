import { logger } from '../app'
import { JQLFunction } from './function'
import { CreateFunctionJQL } from './jql/create/function'
import { TableLock } from './lock'
import { Table } from './table'

/**
 * Memory context
 */
export class Context {
  public readonly functions: { [key: string]: JQLFunction } = {}
  public readonly tables: { [key: string]: { [key: string]: Table } } = {}
  public readonly data: { [key: string]: { [key: string]: any[] } } = {}
  public readonly locks: { [key: string]: { [key: string]: TableLock } } = {}

  constructor(public readonly isReadonly?: boolean, public readonly sessionId?: string) {
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
    logger.debug({ tag: 'context.ts', sessionId: 'global', msg: [`Function '${jql.name}' created`] })
  }

  /**
   * Drop function
   * @param name [string]
   */
  public dropFunction(name: string) {
    this.checkReadonly()
    if (!this.hasFunction(name)) throw new Error(`Function '${name}' does not exist`)
    delete this.functions[name]
    logger.debug({ tag: 'context.ts', sessionId: 'global', msg: [`Function '${name}' dropped`] })
  }

  /**
   * Merge multiple contexts
   * @param contexts [Array<Context>]
   */
  public merge(...contexts: Context[]): Context {
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
    return this
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
const globalContext = new Context()

/**
 * Session context (exists until the session is closed)
 */
const sessionContexts: { [key: string]: Context } = {}

/**
 * Useful function for getting memory context
 * @param sessionId [string]
 * @param mode [string]
 * @param action [string]
 */
export function getContext(mode: 'global'): Context
export function getContext(mode: 'session', sessionId: string, action?: 'create'|'delete'): Context
export function getContext(mode: 'readonly', sessionId: string): Context
export function getContext(mode: 'global'|'session'|'readonly', sessionId?: string, action?: 'create'|'delete'): Context {
  switch (mode) {
    case 'global':
      return globalContext
    case 'session': {
      let context = sessionContexts[sessionId as string]
      if (!context && action !== 'create') throw new Error(`Session '${sessionId}' is not available`)
      switch (action) {
        case 'create':
          context = sessionContexts[sessionId as string] = new Context(false, sessionId)
          logger.debug({ tag: 'context.ts', sessionId, msg: [`Context created`] })
          break
        case 'delete':
          delete sessionContexts[sessionId as string]
          logger.debug({ tag: 'context.ts', sessionId, msg: [`Context deleted`] })
          break
      }
      return context
    }
    case 'readonly':
      const context = new Context(true)
      context.merge(globalContext, getContext('session', sessionId as string))
      return context
  }
}

/**
 * Memory context. Changes will not be applied at once
 */
export class DirtyContext extends Context {
  private readonly funcsDeleted: string[] = []
  private readonly tablesDeleted: Array<[string, string]> = []

  constructor(sessionId: string) {
    super(false, sessionId)
  }

  // @override
  public dropTable(schema: string, name: string) {
    this.tablesDeleted.push([schema, name])
  }

  /**
   * Apply changes to the target context
   * @param context [Context]
   */
  public applyTo(context: Context): Context {
    const schemas = Object.keys(this.tables)
    for (const schema of schemas) {
      // apply tables
      if (!context.tables[schema]) context.tables[schema] = {}
      if (!context.data[schema]) context.data[schema] = {}
      if (!context.locks[schema]) context.locks[schema] = {}
      Object.assign(context.tables[schema], this.tables[schema] || {})
      Object.assign(context.data[schema], this.data[schema] || {})

      // add missing locks
      const tables = Object.keys(this.tables[schema])
      for (const name of tables) {
        if (!context.locks[schema][name]) context.locks[schema][name] = new TableLock(name)
      }
    }

    // delete tables
    for (const [schema, name] of this.tablesDeleted) {
      context.dropTable(schema, name)
    }

    // functions created within a sandbox will not be applied

    // delete functions
    for (const name of this.funcsDeleted) context.dropFunction(name)

    return context
  }
}

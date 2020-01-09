import uuid from 'uuid/v4'
import { JQLFunction } from './function'
import { CreateFunctionJQL } from './jql/create/function'
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
export class Context {
  public readonly isReadonly: boolean = false
  public readonly functions: { [key: string]: JQLFunction } = {}
  public readonly tables: { [key: string]: { [key: string]: Table } } = {}
  public readonly data: { [key: string]: { [key: string]: any[] } } = {}

  constructor(sessionId?: string) {
    if (sessionId) {
      this.merge(globalContext, sessionContexts[sessionId])
      this.isReadonly = true
    }
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
    const { schema: schema, name } = table
    if (!this.tables[schema]) this.createSchema(schema)
    this.tables[schema][name] = table
    this.data[schema][name] = []
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
  }

  /**
   * Merge multiple contexts
   * @param contexts [Array<Context>]
   */
  private merge(...contexts: Context[]) {
    for (const { functions, tables, data } of contexts) {
      const schemas = Object.keys(this.tables)
      for (const schema of schemas) {
        if (!this.tables[schema]) this.tables[schema] = {}
        if (!this.data[schema]) this.data[schema] = {}
        Object.assign(this.tables[schema], tables[schema])
        Object.assign(this.data[schema], data[schema])
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
      return new Context(sessionId)
    case 'global':
      return globalContext
    case 'session':
      let context = sessionContexts[sessionId]
      if (!context && action !== 'create') throw new Error(`Session '${sessionId}' is not available`)
      switch (action) {
        case 'create':
          context = sessionContexts[sessionId] = new Context()
          break
        case 'delete':
          delete sessionContexts[sessionId]
          break
      }
      return context
  }
}

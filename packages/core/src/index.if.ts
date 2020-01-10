/**
 * Application config options
 */
export interface IApplicationOptions {
  /**
   * Logging level. Default to be 'warn'
   */
  logLevel?: string

  /**
   * Default engine to be used. Default to be 'MemoryEngine'
   */
  defaultEngine?: string

  /**
   * Tick interval for lock checking. Default to be 100ms
   */
  lockCheckInterval?: number
}

/**
 * Options for query and update actions
 */
export interface IJQLOptions {
  sessionId: string
  schema?: string
  engine?: string
}

/**
 * Options for update actions
 */
export interface IUpdateOptions extends IJQLOptions {
}

/**
 * Options for query actions
 */
export interface IQueryOptions extends IJQLOptions {
}

/**
 * Result interface
 */
interface IResult {
  sql: string
  elpased: number
}

/**
 * Result of Application.update(ISQL)
 */
export interface IUpdateResult extends IResult {
  rowsAffected: number
}

/**
 * Result of Application.query(IQuery)
 */
export interface IQueryResult extends IResult {
}

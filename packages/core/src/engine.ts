import { CreateFunction } from '@node-jql/sql-builder'
import { IUpdateResult } from './index.if'
import { CreateTableJQL } from './memory/jql/create/table'
import { DropTableJQL } from './memory/jql/drop/table'
import { Task } from './task'

/**
 * Table engine
 */
export abstract class Engine {
  /**
   * Create session
   */
  public abstract async createSession(sessionId: string)

  /**
   * Kill session
   */
  public abstract async killSession(sessionId: string)

  /**
   * CREATE TABLE
   * @param jql [CreateTableJQL]
   */
  public abstract createTable(jql: CreateTableJQL, sessionId: string): Task<Partial<IUpdateResult>>

  /**
   * CREATE FUNCTION
   * @param sql [CreateFunction]
   */
  public abstract createFunction(sql: CreateFunction): Task<Partial<IUpdateResult>>

  /**
   * DROP TABLE
   * @param jql [DropTableJQL]
   */
  public abstract dropTable(jql: DropTableJQL, sessionId: string): Task<Partial<IUpdateResult>>

  /**
   * CREATE SCHEMA when creating table
   * @param name [string]
   */
  protected abstract async createSchema(name: string, sessionId: string)
}

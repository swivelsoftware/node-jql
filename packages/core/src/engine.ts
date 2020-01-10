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
   * @param sessionId [string]
   */
  public abstract async createSession(sessionId: string)

  /**
   * Kill session
   * @param sessionId [string]
   */
  public abstract async killSession(sessionId: string)

  /**
   * CREATE TABLE
   * @param jql [CreateTableJQL]
   * @param sessionId [string]
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
   * @param sessionId [string]
   */
  public abstract dropTable(jql: DropTableJQL, sessionId: string): Task<Partial<IUpdateResult>>

  /**
   * DROP SCHEMA
   * @param name [string]
   * @param sessionId [string]
   */
  public abstract async dropSchema(name: string, sessionId: string)

  /**
   * CREATE SCHEMA when creating table
   * @param name [string]
   * @param sessionId [string]
   */
  protected abstract async createSchema(name: string, sessionId: string)
}

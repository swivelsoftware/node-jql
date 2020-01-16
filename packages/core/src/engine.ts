import { CreateFunction, CreateTable, DropFunction, DropTable, Insert } from '@node-jql/sql-builder'
import { IUpdateResult } from './index.if'
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
   * @param sql [CreateTable]
   * @param sessionId [string]
   */
  public abstract createTable(sql: CreateTable, sessionId: string): Task<Partial<IUpdateResult>>

  /**
   * CREATE FUNCTION
   * @param sql [CreateFunction]
   */
  public abstract createFunction(sql: CreateFunction): Task<Partial<IUpdateResult>>

  /**
   * DROP TABLE
   * @param sql [DropTable]
   * @param sessionId [string]
   */
  public abstract dropTable(sql: DropTable, sessionId: string): Task<Partial<IUpdateResult>>

  /**
   * DROP SCHEMA
   * @param name [string]
   * @param sessionId [string]
   */
  public abstract async dropSchema(name: string, sessionId: string)

  /**
   * DROP FUNCTION
   * @param sql [DropFunction]
   */
  public abstract dropFunction(sql: DropFunction): Task<Partial<IUpdateResult>>

  /**
   * INSERT INTO
   * @param sql [Insert]
   */
  public abstract insert(sql: Insert): Task<Partial<IUpdateResult>>

  /**
   * CREATE SCHEMA when creating table
   * @param name [string]
   * @param sessionId [string]
   */
  protected abstract async createSchema(name: string, sessionId: string)
}

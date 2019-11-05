import { JQL } from '../jql'
import { Query } from '../jql/select'

/**
 * Database engine
 */
export abstract class DatabaseEngine {
  /**
   * Run query
   * @param tid [string]
   * @param query [Query]
   */
  public abstract async query<T>(tid: string, query: Query): Promise<T>

  /**
   * Execute non-query JQL
   * @param tid [string]
   * @param jql [JQL]
   */
  public abstract async update(tid: string, jql: JQL): Promise<number>
}

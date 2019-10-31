import { TableDef } from './table'

/**
 * Database context
 */
export class Context {
  /**
   * Tables declared
   */
  public tables: { [key: string]: TableDef } = {}

  /**
   * Variables declared
   */
  public variables: { [key: string]: any } = {}

  // TODO functions

  /**
   * Table data
   */
  public data: { [key: string]: any[] } = {}
}

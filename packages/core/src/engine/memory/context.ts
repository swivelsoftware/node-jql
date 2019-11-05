import { TableDef } from './table'

/**
 * Engine context
 */
export class Context {
  /**
   * Tables declared
   */
  public readonly tables: { [key: string]: TableDef } = {}

  /**
   * Variables declared
   */
  public readonly variables: { [key: string]: any } = {}

  // TODO functions

  /**
   * Table data
   */
  public readonly data: { [key: string]: any[] } = {}
}

import { ReadWriteLock } from '../../main/lock'
import { TableDef } from './table'

/**
 * Engine context
 */
export class Context {
  /**
   * Tables declared
   * `tables[schema][table] = TableDef`
   */
  public readonly tables: { [key: string]: { [key: string]: TableDef } } = {}

  /**
   * Table locks
   * `tableLocks[schema][table] = ReadWriteLock`
   */
  public readonly tableLocks: { [key: string]: { [key: string]: ReadWriteLock } } = {}

  /**
   * Table data
   * `data[schema][table] = any[]`
   */
  public readonly data: { [key: string]: { [key: string]: any[] } } = {}
}

import squel from '@swivel-admin/squel'
import { IJQL } from './interface'

/**
 * Abstract JQL class
 */
export abstract class JQL implements IJQL {
  /**
   * Convert to SQL string
   * @param type [squel.Flavour]
   * @param options [any]
   */
  public toString(type: squel.Flavour = 'mysql', options?: any): string {
    return this.toSquel(type, options).toString()
  }

  /**
   * Check whether the JQL is valid
   * @param availableTables [Array<string>]
   */
  public abstract validate(availableTables?: string[]): void

  /**
   * Convert to raw JQL
   */
  public abstract toJson(): IJQL

  /**
   * Convert to squel builder
   * @param type [squel.Flavour]
   * @param options [any]
   */
  public abstract toSquel(type?: squel.Flavour, options?: any): squel.BaseBuilder
}

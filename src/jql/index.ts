import squel from 'squel'
import { IJQL } from './interface'

/**
 * Abstract JQL class
 */
export abstract class JQL implements IJQL {
  // @override
  get [Symbol.toStringTag](): string {
    return JQL.name
  }

  // @override
  public toString(): string {
    return this.toSquel().toString()
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
   */
  public abstract toSquel(): squel.BaseBuilder
}

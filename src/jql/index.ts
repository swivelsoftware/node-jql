import squel from 'squel'

/**
 * Raw JQL
 */
export interface IJql {}

/**
 * Abstract JQL class
 */
export abstract class Jql implements IJql {
  // @override
  get [Symbol.toStringTag]() {
    return Jql.name
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
  public abstract toJson(): IJql

  /**
   * Convert to squel builder
   */
  public abstract toSquel(): squel.BaseBuilder
}

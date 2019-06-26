import squel from 'squel'

/**
 * Raw JQL
 */
export interface ISql {}

/**
 * Abstract JQL class
 */
export abstract class Sql implements ISql {
  // @override
  get [Symbol.toStringTag]() {
    return Sql.name
  }

  // @override
  public toString(): string {
    return this.toSquel().toString()
  }

  /**
   * Check whether the SQL is valid
   * @param availableTables [Array<string>]
   */
  public abstract validate(availableTables?: string[]): void

  /**
   * Convert to raw JQL
   */
  public abstract toJson(): ISql

  /**
   * Convert to squel builder
   */
  public abstract toSquel(): squel.BaseBuilder
}

import squel = require('squel')

export abstract class Sql {
  public abstract validate(availableTables?: string[]): void
  public abstract toSquel(): squel.BaseBuilder

  // @override
  get [Symbol.toStringTag]() {
    return 'Sql'
  }

  // @override
  public toString(): string {
    return this.toSquel().toString()
  }
}

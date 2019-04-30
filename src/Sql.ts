import squel = require('squel')

export abstract class Sql {
  // @override
  get [Symbol.toStringTag]() {
    return 'Sql'
  }

  public abstract validate(availableTables?: string[]): void
  public abstract toSquel(): squel.BaseBuilder

  // @override
  public toString(): string {
    return this.toSquel().toString()
  }

  public abstract toJson(): any
}

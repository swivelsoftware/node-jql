import squel = require('squel')

export interface ISql {
}

export abstract class Sql implements ISql {
  constructor(json?: ISql) {
    switch (typeof json) {
      case 'object':
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public abstract validate(): boolean

  public abstract toSquel(): squel.BaseBuilder

  public toString(): string {
    return this.toSquel().toString()
  }
}

export { DefineStatement } from './define'
export { Query } from './query'

export * from './interface/expression/index'
export * from './interface/group-by'
export * from './interface/join-clause'
export * from './interface/limit'
export * from './interface/ordering-term'
export * from './interface/result-column'
export * from './interface/table-or-subquery'

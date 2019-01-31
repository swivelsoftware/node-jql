import squel = require('squel')
import { JQLError } from '../../utils/error'

export interface ISql {
}

export abstract class Sql implements ISql {
  constructor(json?: ISql) {
    switch (typeof json) {
      case 'object':
      case 'undefined':
        break
      default:
        throw new JQLError(`invalid 'json' object`)
    }
  }

  public abstract isValid(): boolean

  public abstract toSquel(): squel.BaseBuilder

  public toString(): string {
    return this.toSquel().toString()
  }
}

export { DefineStatement, IDefineStatement } from './define'
export { Query, IQuery } from './query'
export * from './interface/index'

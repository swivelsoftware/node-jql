import { IQuery, Query } from '../query'

export interface ITableOrSubquery {
  name?: string
  query?: IQuery
  $as?: string
}

export class TableOrSubquery implements ITableOrSubquery {
  public name?: string
  public query?: Query
  public $as?: string

  constructor(json?: ITableOrSubquery) {
    switch (typeof json) {
      case 'object':
        this.name = json.name
        if (json.query) this.query = new Query(json.query)
        this.$as = json.$as
        if (this.query && !this.$as) throw new Error(`every derived table must have its own alias`)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }
}

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

  constructor(tableOrSubquery?: ITableOrSubquery) {
    switch (typeof tableOrSubquery) {
      case 'object':
        this.name = tableOrSubquery.name
        if (tableOrSubquery.query) this.query = new Query(tableOrSubquery.query)
        this.$as = tableOrSubquery.$as
        if (this.query && !this.$as) throw new Error(`missing alias. an alias is a must if using query in TableOrSubquery`)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'tableOrSubquery' object`)
    }
  }
}

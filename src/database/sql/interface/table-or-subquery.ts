import { Query } from "../query";

interface TableOrSubqueryJson {
  name?: string
  query?: Query
  $as?: string
}

export class TableOrSubquery implements TableOrSubqueryJson {
  name?: string
  query?: Query
  $as?: string

  constructor (tableOrSubquery?: TableOrSubqueryJson) {
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
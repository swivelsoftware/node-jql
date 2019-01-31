import { JQLError } from '../../../utils/error'
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
        try {
          this.name = json.name
          if (json.query) this.query = new Query(json.query)
          this.$as = json.$as
          if (this.query && !this.$as) throw new JQLError('every derived table must have its own alias')
        }
        catch (e) {
          throw new JQLError('fail to create TableOrSubquery block', e)
        }
        break
      case 'undefined':
        break
      default:
        throw new JQLError(`invalid 'json' object`)
    }
  }
}

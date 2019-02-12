import { JQLError } from '../../../utils/error'
import { IQuery, Query } from '../query'
import { IJoinClause, JoinClause } from './join-clause'

export interface ITableOrSubquery {
  name?: string
  query?: IQuery
  $as?: string
  $join?: IJoinClause[] | IJoinClause | undefined
}

export class TableOrSubquery implements ITableOrSubquery {
  public name?: string
  public query?: Query
  public $as?: string
  public $join?: JoinClause[]

  constructor(json?: ITableOrSubquery) {
    switch (typeof json) {
      case 'object':
        try {
          this.name = json.name
          if (json.query) this.query = new Query(json.query)
          this.$as = json.$as
          if (this.query && !this.$as) throw new JQLError('every derived table must have its own alias')
          if (json.$join) this.$join = Array.isArray(json.$join) ? json.$join.map((joinClause) => new JoinClause(joinClause)) : [new JoinClause(json.$join)]
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

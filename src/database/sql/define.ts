import squel = require('squel')
import { Sql } from '.'
import { createFunction } from '../../utils/createFunction'
import { JQLError } from '../../utils/error'
import { JQLFunction } from '../functions/__base'
import { IQuery, Query } from './query'

export interface IDefineStatement {
  name: string
  $ifNotExists?: boolean
  value?: string | number | boolean
  function?: string
  query?: IQuery
}

export class DefineStatement extends Sql implements IDefineStatement {
  public name: string
  public symbol: symbol
  public $ifNotExists?: boolean
  public value?: string | number | boolean
  public function_?: JQLFunction<any>
  public query?: Query

  constructor(json?: IDefineStatement) {
    super(json)
    if (json) {
      this.symbol = Symbol(this.name = json.name)
      this.$ifNotExists = json.$ifNotExists
      this.value = json.value
      if (!this.value && json.function) {
        const function_ = createFunction(json.function)
        this.function_ = new JQLFunction<any>(true, (...args: any[]) => function_(...args))
      }
      if (!this.value && !this.function_) this.query = json.query ? new Query(json.query) : json.query
      if (!this.value && !this.function_ && !this.query) throw new JQLError(`nothing is defined in DefineStatement`)
    }
  }

  public isValid(): boolean {
    return !this.query || this.query.isValid()
  }

  public toSquel(): squel.BaseBuilder {
    return squel.rstr(`DEFINE ${this.$ifNotExists ? 'IF NOT EXISTS ' : ''}${this.name} = ?`, this.value || this.function_ || this.query)
  }
}

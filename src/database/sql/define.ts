import squel = require('squel')
import { createFunction } from '../../utils/createFunction'
import { Sql } from './index'
import { IQuery, Query } from './query'

export interface IDefineStatement {
  name: string
  $ifNotExists?: boolean
  value?: string | number | boolean
  function?: Function | string
  query?: IQuery
}

export class DefineStatement extends Sql implements IDefineStatement {
  public name: string
  public symbol: symbol
  public $ifNotExists?: boolean
  public value?: string | number | boolean
  public function?: Function
  public query?: Query

  constructor(json?: DefineStatement) {
    super(json)
    if (json) {
      this.symbol = Symbol(this.name = json.name)
      this.$ifNotExists = json.$ifNotExists
      this.value = json.value
      if (!this.value) this.function = typeof json.function === 'string' ? createFunction(json.function) : json.function
      if (!this.value && !this.function) this.query = json.query ? new Query(json.query) : json.query
      if (!this.value && !this.function && !this.query) throw new Error(`nothing is defined in DefineStatement`)
    }
  }

  public validate(): boolean {
    return !this.query || this.query.validate()
  }

  public toSquel(): squel.BaseBuilder {
    return squel.str(`DEFINE ${this.$ifNotExists ? 'IF NOT EXISTS ' : ''}${this.name} = ?`, this.value || this.function || this.query)
  }
}

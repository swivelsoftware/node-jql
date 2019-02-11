import { JQLError } from '../../../utils/error'
import { create } from './expression/__create'

export interface ILimit {
  value: number
  $offset?: number
}

const allow = ['$case', '$function', '$value']

export class Limit implements ILimit {
  public value: number
  public $offset?: number

  constructor(json?: ILimit) {
    switch (typeof json) {
      case 'object':
        this.value = json.value
        if (json.$offset) this.$offset = json.$offset
        break
      case 'undefined':
        break
      default:
        throw new JQLError(`invalid 'json' object`)
    }
  }
}

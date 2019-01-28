import { create } from './expression/create'
import { IExpression } from './expression/index'

export interface ILimit {
  expression: IExpression
  $offset?: IExpression
}

const allow = ['$case', '$function', '$value']

export class Limit implements ILimit {
  public expression: IExpression
  public $offset?: IExpression

  constructor(limit?: ILimit) {
    switch (typeof limit) {
      case 'object':
        this.expression = create(limit.expression, { allow })
        if (limit.$offset) { this.$offset = create(limit.$offset, { allow }) }
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'limit' object`)
    }
  }
}

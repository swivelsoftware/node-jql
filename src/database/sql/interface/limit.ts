import { create } from './expression/create'
import { Expression, IExpression } from './expression/index'

export interface ILimit {
  expression: IExpression
  $offset?: IExpression
}

const allow = ['$case', '$function', '$value']

export class Limit implements ILimit {
  public expression: Expression
  public $offset?: Expression

  constructor(json?: ILimit) {
    switch (typeof json) {
      case 'object':
        this.expression = create(json.expression, { allow })
        if (json.$offset) this.$offset = create(json.$offset, { allow })
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }
}

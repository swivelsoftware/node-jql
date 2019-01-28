import { create } from './create'
import { IExpression, IUnknownExpression } from './index'

type GroupedType = 'AND' | 'OR'

export interface IGroupedExpression extends IExpression, IUnknownExpression {
  expressions: IExpression[]
}

abstract class GropuedExpression implements IGroupedExpression {
  public classname = '$and'
  public parameters?: string[]
  public expressions: IExpression[]

  constructor(readonly type: GroupedType, json?: IGroupedExpression) {
    switch (typeof json) {
      case 'object':
        this.parameters = json.parameters
        this.expressions = json.expressions.map((expression) => create(expression))
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public toString(): string {
    return `(${this.expressions.map((expression) => expression.toString()).join(` ${this.type} `)})`
  }
}

export class AndGroupedExpression extends GropuedExpression {
  public readonly classname = '$and'

  constructor(json?: IGroupedExpression) {
    super('AND', json)
  }
}

export class OrGroupedExpression extends GropuedExpression {
  public readonly classname = '$or'

  constructor(json?: IGroupedExpression) {
    super('OR', json)
  }
}

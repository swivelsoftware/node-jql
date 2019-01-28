import { create } from './create'
import { IExpression, IUnknownExpression } from './index'

type ExprOperator = '=' | '<>' | '<' | '<=' | '>' | '>=' | 'IS' | 'IS NULL' | 'IS NOT NULL'

export interface IBinaryExpression extends IExpression, IUnknownExpression {
  left: IExpression
  operator: ExprOperator
  right?: IExpression
}

export class BinaryExpression implements IBinaryExpression {
  public readonly classname = '$binary'
  public parameters?: string[]
  public left: IExpression
  public operator: ExprOperator
  public right?: IExpression

  constructor(json?: IBinaryExpression) {
    switch (typeof json) {
      case 'object':
        this.parameters = json.parameters
        this.left = create(json.left)
        this.operator = json.operator
        if (json.right) this.right = create(json.right)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public toString(): string {
    return `? ${this.operator} ?`
  }
}

import { JQL } from '../..'
import { IBinaryExpression } from '../expressions/binary/index.if'
import { SetVariableExpression } from '../expressions/set-variable'
import { ISetVariableJQL } from './index.if'

/**
 * set variable
 */
export class SetVariableJQL extends JQL implements ISetVariableJQL {
  // @override
  public readonly classname = SetVariableJQL.name

  // @override
  public expression: SetVariableExpression

  constructor(json?: ISetVariableJQL) {
    super()

    if (json) {
      this.setExpression(json.expression)
    }
  }

  /**
   * set expression
   * @param expr [IBinaryExpression]
   */
  public setExpression(expr: IBinaryExpression): SetVariableJQL {
    if (expr.classname !== 'SetVariableExpression') throw new SyntaxError('Expression must be a SetVariableExpression')
    this.expression = new SetVariableExpression(expr)
    return this
  }

  // @override
  public toJson(): ISetVariableJQL {
    this.check()
    return {
      classname: this.classname,
      expression: this.expression.toJson(),
    }
  }

  // @override
  public toString(): String {
    this.check()
    return `SET ${this.expression.toString()}`
  }

  // @override
  protected check(): void {
    if (!this.expression) throw new SyntaxError('Expression is not defined')
  }
}

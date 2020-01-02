import _ = require('lodash')
import { Expression } from '.'
import { IBuilder, IExpression } from '../index.if'
import { parse, register } from '../parse'
import { GroupOperator, IGroupExpression } from './index.if'

class Builder implements IBuilder<GroupExpression> {
  private json: IGroupExpression

  constructor(operator: GroupOperator) {
    this.json = {
      classname: GroupExpression.name,
      operator,
      expressions: [],
    }
  }

  /**
   * Add expression
   * @param json [IExpression]
   */
  public expr(json: IExpression): Builder {
    this.json.expressions.push(json)
    return this
  }

  // @override
  public build(): GroupExpression {
    if (this.json.expressions.length < 2) throw new SyntaxError(`You must specify at least 2 expressions`)
    return new GroupExpression(this.json)
  }

  // @override
  public toJson(): IGroupExpression {
    return _.cloneDeep(this.json)
  }
}

/**
 * AND-OR expressions
 */
export class GroupExpression extends Expression implements IGroupExpression {
  public static Builder = Builder

  public readonly classname: string = GroupExpression.name
  public readonly operator: GroupOperator
  public readonly expressions: Expression[]

  constructor(json: IGroupExpression) {
    super()
    this.operator = json.operator
    this.expressions = json.expressions.map(json => parse(json))
  }

  // @override
  public toJson(): IGroupExpression {
    return {
      classname: this.classname,
      operator: this.operator,
      expressions: this.expressions.map(expr => expr.toJson()),
    }
  }
}

register(GroupExpression)

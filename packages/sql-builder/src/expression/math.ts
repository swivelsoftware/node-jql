import _ = require('lodash')
import { Expression } from '.'
import { IBuilder, IExpression } from '../index.if'
import { parse, register } from '../parse'
import { ColumnExpression } from './column'
import { IMathExpression, MathOperator } from './index.if'
import { isUnknown, Unknown } from './unknown'

class Builder implements IBuilder<MathExpression> {
  private json: IMathExpression

  constructor(operator: MathOperator) {
    this.json = {
      classname: MathExpression.name,
      operator,
    }
  }

  /**
   * Set `left` expression
   * @param json [IExpression|string]
   */
  public left(json: IExpression|string): Builder {
    if (typeof json === 'string') json = new ColumnExpression(json)
    this.json.left = json
    return this
  }

  /**
   * Set `right` expression
   * @param json [IExpression|string]
   */
  public right(json: IExpression|string): Builder {
    if (typeof json === 'string') json = new ColumnExpression(json)
    this.json.right = json
    return this
  }

  // @override
  public build(): MathExpression {
    return new MathExpression(this.json)
  }

  // @override
  public toJson(): IMathExpression {
    return _.cloneDeep(this.json)
  }
}

/**
 * [left] [operator] [right]
 */
export class MathExpression extends Expression implements IMathExpression {
  public static Builder = Builder

  public readonly classname: string = MathExpression.name
  public readonly left: Expression = new Unknown()
  public readonly operator: MathOperator
  public readonly right: Expression = new Unknown()

  constructor(json: IMathExpression) {
    super()
    if (json.left) this.left = parse(json.left)
    this.operator = json.operator
    if (json.right) this.right = parse(json.right)
  }

  // @override
  public toString(): string {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`
  }

  // @override
  public toJson(): IMathExpression {
    const json: IMathExpression = {
      classname: this.classname,
      operator: this.operator,
    }
    if (!isUnknown(this.left)) json.left = this.left.toJson()
    if (!isUnknown(this.right)) json.right = this.right.toJson()
    return json
  }
}

register(MathExpression)

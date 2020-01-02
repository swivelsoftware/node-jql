import _ = require('lodash')
import { Expression } from '.'
import * as $ from '../dbType'
import { IBuilder, IExpression } from '../index.if'
import { parse, register } from '../parse'
import { ColumnExpression } from './column'
import { IMathExpression } from './index.if'
import { isUnknown, Unknown } from './unknown'

/**
 * Default set of operators supported, based on mysql
 */
const DEFAULT_OPERATORS = [
  '+',
  '-',
  '*',
  '/',
  '%',
  'MOD',
  'DIV',
]

class Builder implements IBuilder<MathExpression> {
  private json: IMathExpression

  constructor(operator: string) {
    const SUPPORTED_OPERATORS = _.get($.dbConfigs, [$.dbType, 'mathOperators'], DEFAULT_OPERATORS)
    if (SUPPORTED_OPERATORS.indexOf(operator) === -1) throw new SyntaxError(`Unsupported operator '${operator}'`)

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
  public readonly operator: string
  public readonly right: Expression = new Unknown()

  constructor(json: IMathExpression) {
    super()
    if (json.left) this.left = parse(json.left)
    this.operator = json.operator
    if (json.right) this.right = parse(json.right)
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

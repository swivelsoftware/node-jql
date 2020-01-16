import _ = require('lodash')
import { Expression } from '.'
import { IBuilder, IExpression } from '../index.if'
import { parse, register } from '../parse'
import { ColumnExpression } from './column'
import { IBetweenExpression } from './index.if'
import { isUnknown, Unknown } from './unknown'

class Builder implements IBuilder<BetweenExpression> {
  private readonly json: IBetweenExpression = {
    classname: BetweenExpression.name,
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
   * Set `not` flag
   * @param value [boolean]
   */
  public not(value: boolean = true): Builder {
    this.json.not = value
    return this
  }

  /**
   * Set `start` expression
   * @param json [IExpression|string]
   */
  public start(json: IExpression|string): Builder {
    if (typeof json === 'string') json = new ColumnExpression(json)
    this.json.start = json
    return this
  }

  /**
   * Set `end` expression
   * @param json [IExpression|string]
   */
  public end(json: IExpression|string): Builder {
    if (typeof json === 'string') json = new ColumnExpression(json)
    this.json.end = json
    return this
  }

  // @override
  public build(): BetweenExpression {
    return new BetweenExpression(this.json)
  }

  // @override
  public toJson(): IBetweenExpression {
    return _.cloneDeep(this.json)
  }
}

/**
 * [left] (not) BETWEEN [start] AND [end]
 */
export class BetweenExpression extends Expression implements IBetweenExpression {
  public static Builder = Builder

  public readonly classname: string = BetweenExpression.name
  public readonly left: Expression = new Unknown()
  public readonly not: boolean = false
  public readonly start: Expression = new Unknown()
  public readonly end: Expression = new Unknown()

  constructor(json: IBetweenExpression) {
    super()
    if (json.left) this.left = parse(json.left)
    if (json.not) this.not = json.not
    if (json.start) this.start = parse(json.start)
    if (json.end) this.end = parse(json.end)
  }

  // @override
  public toJson(): IBetweenExpression {
    const json: IBetweenExpression = { classname: this.classname }
    if (!isUnknown(this.left)) json.left = this.left.toJson()
    if (this.not) json.not = this.not
    if (!isUnknown(this.start)) json.start = this.start.toJson()
    if (!isUnknown(this.end)) json.end = this.end.toJson()
    return json
  }
}

register(BetweenExpression)

import squel = require('squel')
import { Expression, IExpression } from '..'
import { parse } from '../parse'

/**
 * Raw JQL defining parameters for function expression
 */
export interface IParameterExpression extends IExpression {
  /**
   * Parameter prefix
   */
  prefix?: string

  /**
   * Parameter context
   */
  expression: any

  /**
   * Parameter suffix
   */
  suffix?: string
}

/**
 * JQL class defining parameters for function expression
 */
export class ParameterExpression extends Expression implements IParameterExpression {
  public readonly classname = ParameterExpression.name
  public readonly prefix?: string
  public readonly expression: Expression
  public readonly suffix?: string

  /**
   * @param json [Partial<IParameterExpression>]
   */
  constructor(json: Partial<IParameterExpression>)

  /**
   * @param prefix [string|null]
   * @param expression [IExpression]
   * @param suffix [string] optional
   */
  constructor(prefix: string|null, expression: IExpression, suffix?: string)

  constructor(...args: any[]) {
    super()

    // parse args
    let prefix: string|undefined, expression: IExpression, suffix: string|undefined
    if (args.length === 1) {
      const json = args[0] as IParameterExpression
      prefix = json.prefix
      expression = json.expression
      suffix = json.suffix
    }
    else {
      prefix = args[0] || undefined
      expression = args[1]
      suffix = args[2]
    }

    // set args
    this.prefix = prefix
    this.expression = parse(expression)
    this.suffix = suffix
  }

  // @override
  public validate(availableTables: string[]) {
    this.expression.validate(availableTables)
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr(`${this.prefix ? `${this.prefix} ` : ''}?${this.suffix ? ` ${this.suffix}` : ''}`, this.expression.toSquel())
  }

  // @override
  public toJson(): IExpression {
    if (this.prefix || this.suffix) {
      const result: IParameterExpression = {
        classname: 'ParameterExpression',
        expression: this.expression.toJson(),
      }
      if (this.prefix) result.prefix = this.prefix
      if (this.suffix) result.suffix = this.suffix
      return result
    }
    else {
      return this.expression.toJson()
    }
  }
}

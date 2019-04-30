import squel = require('squel')
import { Expression, IExpression } from '.'

export interface IParameterExpression extends IExpression {
  prefix?: string
  expression: IExpression
  suffix?: string
}

export class ParameterExpression extends Expression implements IParameterExpression {
  public readonly classname = 'ParameterExpression'
  public readonly prefix?: string
  public readonly expression: Expression
  public readonly suffix?: string

  // @override
  public validate(availableTables: string[]) {
    this.expression.validate(availableTables)
  }

  get template(): string {
    return `${this.prefix ? `${this.prefix} ` : ''}?${this.suffix ? ` ${this.suffix}` : ''}`
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr(this.template, this.expression.toSquel())
  }

  // @override
  public toJson(): IParameterExpression {
    const result: IParameterExpression = {
      classname: 'ParameterExpression',
      expression: this.expression.toJson(),
    }
    if (this.prefix) result.prefix = this.prefix
    if (this.suffix) result.suffix = this.suffix
    return result
  }
}

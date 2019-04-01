import squel = require('squel')
import { Expression, IExpression } from '.'
import { JQLError } from '../utils/error'
import { parse } from './parse'

export interface IFunctionExpression extends IExpression {
  name: string
  parameters?: any[]|any
}

export class FunctionExpression extends Expression implements IFunctionExpression {
  public readonly classname = 'FunctionExpression'
  public name: string
  public parameters: Expression[]

  constructor(json: IFunctionExpression) {
    super()
    try {
      this.name = json.name
      let parameters = json.parameters || []
      if (!Array.isArray(parameters)) parameters = [parameters]
      this.parameters = parameters.map((parameter) => parse(parameter))
    }
    catch (e) {
      throw new JQLError('InstantiateError: Fail to instantiate FunctionExpression', e)
    }
  }

  get template(): string {
    return `${this.name.toLocaleUpperCase()}(${this.parameters.map(() => '?').join(', ')})`
  }

  // @override
  public validate(availableTables: string[]) {
    for (const parameter of this.parameters) parameter.validate(availableTables)
  }

  // @override
  public toSquel(): squel.FunctionBlock {
    return squel.rstr(this.template,
      ...this.parameters.map((parameter) => parameter.toSquel()),
    )
  }
}

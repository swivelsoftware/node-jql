import squel = require('squel')
import { Expression, IExpression } from '.'
import { InstantiateError } from '../utils/error/InstantiateError'
import { ParameterExpression } from './parameter'
import { parse } from './parse'
import { Value } from './value'

export interface IFunctionExpression extends IExpression {
  name: string
  parameters?: any[]|any
}

export class FunctionExpression extends Expression implements IFunctionExpression {
  public readonly classname = 'FunctionExpression'
  public name: string
  public parameters: Array<ParameterExpression|Value>

  constructor(json: IFunctionExpression) {
    super()
    try {
      this.name = json.name
      let parameters = json.parameters || []
      if (!Array.isArray(parameters)) parameters = [parameters]
      this.parameters = parameters.map(parameter => parse(parameter))
      const invalidExpression = this.parameters.find(expression => !(expression instanceof ParameterExpression || expression instanceof Value))
      if (invalidExpression) {
        throw new SyntaxError(`Parameter of FunctionExpression should be either ParameterExpression or Value. ${invalidExpression.classname} found`)
      }
    }
    catch (e) {
      throw new InstantiateError('Fail to instantiate FunctionExpression', e)
    }
  }

  // @override
  get [Symbol.toStringTag]() {
    return 'FunctionExpression'
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
    return squel.rstr(
      this.template,
      ...this.parameters.map(parameter => parameter.toSquel()),
    )
  }

  // @override
  public toJson(): IFunctionExpression {
    const result: IFunctionExpression = {
      classname: this.classname,
      name: this.name,
    }
    if (this.parameters.length > 0) result.parameters = this.parameters.map(expression => expression.toJson())
    return result
  }
}

import squel = require('squel')
import { Expression, IExpression, IUnknownExpression, Parameter } from './__base'
import { create } from './__create'

export interface IFunctionExpression extends IUnknownExpression {
  name: string
}

function isExpression(parameter: Parameter): parameter is IExpression {
  return typeof parameter !== 'string' && typeof parameter !== 'number' && typeof parameter !== 'boolean'
}

export class FunctionExpression extends Expression implements IFunctionExpression {
  public readonly classname = '$function'
  public name: string
  public parameters: Parameter[]

  constructor(json?: IFunctionExpression) {
    super(json)
    if (json) {
      this.name = json.name
      this.parameters = (json.parameters || []).map((parameter) => {
        if (isExpression(parameter)) return create(parameter)
        return parameter
      })
    }
  }

  public toSquel(): squel.BaseBuilder {
    const params: any[] = []
    const args = (this.parameters || []).map((value) => {
      params.push(isExpression(value) ? create(value).toSquel() : value)
      return '?'
    })
    const expr = `${this.name}(${args.join(', ')})`
    return squel.rstr(expr, ...params)
  }
}

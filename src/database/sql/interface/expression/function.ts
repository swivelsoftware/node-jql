import squel = require('squel')
import { create } from './create'
import { Expression, IExpression, Parameter } from './index'

export interface IFunctionExpression extends IExpression {
  name: string
}

function isExpression(parameter: Parameter): parameter is IExpression {
  return typeof parameter !== 'string' && typeof parameter !== 'number' && typeof parameter !== 'boolean'
}

export class FunctionExpression extends Expression implements IFunctionExpression {
  public readonly classname = '$function'
  public name: string

  constructor(json?: IFunctionExpression) {
    super(json)
    if (json) this.name = json.name
  }

  public toSquel(): squel.BaseBuilder {
    const params: any[] = []
    const args = (this.parameters || []).map((value) => {
      params.push(isExpression(value) ? create(value).toSquel() : value)
      return '?'
    })
    const expr = `${this.name}(${args.join(', ')})`
    return squel.str(expr, ...params)
  }
}

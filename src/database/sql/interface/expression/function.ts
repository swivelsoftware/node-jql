import { create } from './create'
import { IExpression } from './index'

type Param = IExpression | string | number | boolean

export interface IFunctionExpression extends IExpression {
  name: string
  params: Param[] | Param
}

function paramIsExpression(param: Param): param is IExpression {
  return typeof param !== 'string' && typeof param !== 'number' && typeof param !== 'boolean'
}

export class FunctionExpression implements IFunctionExpression {
  public readonly classname = '$function'
  public name: string
  public params: Param[]

  constructor(json?: IFunctionExpression) {
    switch (typeof json) {
      case 'object':
        this.name = json.name
        let params = json.params
        if (!Array.isArray(params)) params = [params]
        this.params = params.map((param) => paramIsExpression(param) ? create(param) : param)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public toString(): string {
    return `${this.name}(${this.params.map(() => '?').join(', ')})`
  }
}

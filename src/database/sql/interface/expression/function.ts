import { Expression } from "./index";
import { create } from "./__create";

type Param = Expression | string | number | bigint | boolean

interface FunctionJson extends Expression {
  name: string
  params: Param[] | Param
}

function paramIsExpression (param: Param): param is Expression {
  return typeof param !== 'string' && typeof param !== 'number' && typeof param !== 'bigint' && typeof param !== 'boolean'
}

export class FunctionExpression implements FunctionJson {
  readonly classname = '$function'
  name: string
  params: Param[]

  constructor (json?: FunctionJson) {
    switch (typeof json) {
      case 'object':
        this.name = json.name
        let params = json.params
        if (!Array.isArray(params)) params = [params]
        this.params = params.map(param => paramIsExpression(param) ? create(param) : param)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'expression' object`)
    }
  }
}
import { Expression } from "./index";
import { create } from "./__create";

interface GroupedJson extends Expression {
  expressions: Expression[]
}

abstract class GropuedExpression implements GroupedJson {
  classname = '$and'
  expressions: Expression[]

  constructor (readonly type: string, json?: GroupedJson) {
    switch (typeof json) {
      case 'object':
        json.expressions = json.expressions.map(expression => create(expression))
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'expression' object`)
    }
  }
}

export class AndGroupedExpression extends GropuedExpression {
  readonly classname = '$and'

  constructor (json?: GroupedJson) {
    super('AND', json)
  }
}

export class OrGroupedExpression extends GropuedExpression {
  readonly classname = '$or'

  constructor (json?: GroupedJson) {
    super('OR', json)
  }
}
import { Expression } from "./index";

interface ValueJson extends Expression {
  value?: any
  unknown?: boolean
}

export class ValueExpression implements ValueJson {
  readonly classname = '$value'
  value?: any
  unknown?: boolean

  constructor (json?: ValueJson) {
    switch (typeof json) {
      case 'object':
        this.value = json.value
        this.unknown = json.unknown
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'expression' object`)
    }
  }
}
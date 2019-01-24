import { Expression } from "./index";

interface ColumnJson extends Expression {
  table?: string
  name: string
}

export class ColumnExpression implements ColumnJson {
  readonly classname = '$column'
  table?: string
  name: string

  constructor (json?: ColumnJson) {
    switch (typeof json) {
      case 'object':
        this.table = json.table
        this.name = json.name
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'expression' object`)
    }
  }
}
import { create } from "./expression/__create";
import { Expression } from "./expression/index";

interface ResultColumnJson {
  expression: Expression
  $as?: string
}

export class ResultColumn implements ResultColumnJson {
  expression: Expression
  $as?: string

  constructor (resultColumn?: ResultColumnJson) {
    switch (typeof resultColumn) {
      case 'object':
        this.expression = create(resultColumn.expression)
        this.$as = resultColumn.$as
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'resultColumn' object`)
    }
  }
}
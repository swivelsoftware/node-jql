import { Expression } from "./expression/index";
import { create } from "./expression/__create";

class LimitJson {
  expression: Expression
  $offset?: Expression
}

const allow = ['$case', '$function', '$value']

export class Limit implements LimitJson {
  expression: Expression
  $offset?: Expression

  constructor (limit?: LimitJson) {
    switch (typeof limit) {
      case 'object':
        this.expression = create(limit.expression, { allow })
        if (limit.$offset) this.$offset = create(limit.$offset, { allow })
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'limit' object`)
    }
  }
}
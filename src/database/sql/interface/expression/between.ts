import { Expression } from "./index";
import { create } from "./__create";

interface BetweenJson extends Expression {
  $not?: boolean
  left: Expression
  start?: Expression
  end?: Expression
}

export class BetweenExpression implements BetweenJson {
  readonly classname = '$between'
  $not?: boolean
  left: Expression
  start?: Expression
  end?: Expression

  constructor (json?: BetweenJson) {
    switch (typeof json) {
      case 'object':
        this.$not = json.$not
        this.left = create(json.left)
        if (json.start) this.start = create(json.start)
        if (json.end) this.end = create(json.end)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'expression' object`)
    }
  }
}
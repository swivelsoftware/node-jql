import { Expression } from "./index";
import { create } from "./__create";

interface LikeJson extends Expression {
  $not?: boolean
  left: Expression
  right: Expression
}

export class LikeExpression implements LikeJson {
  readonly classname = '$like'
  $not?: boolean
  left: Expression
  right: Expression

  constructor (json?: LikeJson) {
    switch (typeof json) {
      case 'object':
        this.$not = json.$not
        this.left = create(json.left)
        this.right = create(json.right)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'expression' object`)
    }
  }
}
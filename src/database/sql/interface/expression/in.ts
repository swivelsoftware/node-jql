import { Expression } from "./index";
import { Query } from "database/sql/query";
import { create } from "./__create";

interface InJson extends Expression {
  $not?: boolean
  left: Expression
  query: Query
}

export class InExpression implements InJson {
  readonly classname = '$in'
  $not?: boolean
  left: Expression
  query: Query

  constructor (json?: InJson) {
    switch (typeof json) {
      case 'object':
        this.$not = json.$not
        this.left = create(json.left)
        this.query = new Query(json.query)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'expression' object`)
    }
  }
}
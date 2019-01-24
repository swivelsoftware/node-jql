import { Expression } from "./index";
import { Query } from "database/sql/query";

interface ExistsJson extends Expression {
  $not?: boolean
  query: Query
}

export class ExistsExpression implements ExistsJson {
  readonly classname = '$exists'
  $not?: boolean
  query: Query

  constructor (json?: ExistsJson) {
    switch (typeof json) {
      case 'object':
        this.$not = json.$not
        this.query = new Query(json.query)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'expression' object`)
    }
  }
}
import { Expression } from "./index";
import { create } from "./__create";
import { Query } from "database/sql/query";

type ExprOperator = '=' | '<>' | '<' | '<=' | '>' | '>=' | 'IS' | 'IS NULL' | 'IS NOT NULL'

interface BinaryJson extends Expression {
  left: Expression
  operator: ExprOperator
  right?: Expression
}

export class BinaryExpression implements BinaryJson {
  readonly classname = '$binary'
  left: Expression
  operator: ExprOperator
  right?: Expression

  constructor (json?: BinaryJson) {
    switch (typeof json) {
      case 'object':
        this.left = create(json.left)
        this.operator = json.operator
        if (json.right) this.right = create(json.right)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'expression' object`)
    }
  }
}
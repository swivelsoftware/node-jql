import { Expression } from "./index";
import { create } from "./__create";

interface CaseWhen {
  $when: Expression
  $then: Expression
}

interface CaseJson extends Expression {
  $when: CaseWhen[] | CaseWhen
  $else?: Expression
}

export class CaseExpression implements CaseJson {
  readonly classname = '$case'
  $when: CaseWhen[]
  $else?: Expression

  constructor (json?: CaseJson) {
    switch (typeof json) {
      case 'object':
        let $when = json.$when
        if (!Array.isArray($when)) $when = [$when]
        this.$when = $when.map(when => ({
          $when: create(when.$when),
          $then: create(when.$then)
        }))
        if (json.$else) this.$else = create(json.$else)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'expression' object`)
    }
  }
}
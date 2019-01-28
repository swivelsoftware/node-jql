import { create } from './create'
import { IExpression, IUnknownExpression } from './index'

interface ICase {
  $when: IExpression
  $then: IExpression
}

export interface ICaseExpression extends IExpression, IUnknownExpression {
  cases: ICase[] | ICase
  $else?: IExpression
}

export class CaseExpression implements ICaseExpression {
  public readonly classname = '$case'
  public parameters?: string[]
  public cases: ICase[]
  public $else?: IExpression

  constructor(json?: ICaseExpression) {
    switch (typeof json) {
      case 'object':
        this.parameters = json.parameters
        let $when = json.cases
        if (!Array.isArray($when)) $when = [$when]
        this.cases = $when.map((when) => ({
          $then: create(when.$then),
          $when: create(when.$when),
        }))
        if (json.$else) this.$else = create(json.$else)
        break
      case 'undefined':
        break
      default:
        throw new Error(`invalid 'json' object`)
    }
  }

  public toString(): string {
    return `CASE ${this.cases.map(() => `WHEN ? THEN ?`).join(' ')}${this.$else ? ` ELSE ?` : ''} END`
  }
}
